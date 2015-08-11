var express = require('express');
var mongoClient = require('mongodb').MongoClient;
var router = express.Router();
var callbackCount = 0;
var moment = require('moment');
var config = require('../../config.js');

/* GET home page. */
router.get('/:startdate', function(req, res) {
    //var col = {};
    //
    //mongoClient.connect(req.app.get('dbUrl'), function(err, mdb) {
    //    col = mdb.collection(req.app.get('woodshed_library'));
    //})

    var request = req.app.settings.request;
    var soundkickEndpoint = config.soundkick_endpoint;  //req.app.settings.SOUNDKICK_ENDPOINT;
    var echonestEndpoint = config.echonest_endpoint; //req.app.settings.ECHONEST_ENDPOINT;
    var soundkickStaticEndpoint = config.soundkick_static_endpoint;     //req.app.settings.SOUNDKICK_STATIC_ENDPOINT;
    var page = 1;
    var events = [];
    var artistTracks = [];
    var dateRange = _getSoundKickDateRange(req.params.startdate);
    var bucketId = 'rdio-US';   //7digital-US rdio-US spotify

    var eventIndex = 0;
    var options = {
        url: soundkickEndpoint + '&min_date=' + dateRange[0] + '&max_date=' + dateRange[1] + '&page=' + page + '&per_page=50&jsoncallback=jpCallback',
        artist_icon_url: soundkickStaticEndpoint + 'profile_images/artists/AID/huge_avatar'
    };
    
//    var echonestUrl = echonestEndpoint  + '&artist_id=songkick:artist:SKAID&sort=song_hotttnesss-desc&results=5&bucket=tracks&bucket=id:rdio-US';//&bucket=id:tracks:rdio-US;//&bucket=audio_summary';
    var echonestUrl = echonestEndpoint  + '&artist_id=songkick:artist:SKAID&sort=song_hotttnesss-desc&results=5&bucket=tracks&bucket=id:' + bucketId;//&bucket=id:tracks:rdio-US;//&bucket=audio_summary';
    var echonestOptions = {
        url: echonestUrl
    };

    //get artist data from soundkick
    request(options, callback);

    function jpCallback(data) {
        return data.resultsPage.results.event;
    }

    function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
            //run it thru jpCallback - this will return proper JSON
	        var tmpEvents = eval(body);
	        //console.log(events);
            if (tmpEvents != undefined) {
                events = events.length == 0 ? tmpEvents : events.concat(tmpEvents);
                var oldpage = page;
                page ++;
                options.url = options.url.replace('&page=' + oldpage, '&page=' + page);
//                console.log(options.url);
                request (options, callback);
            }   else {
                
                //get tracklist data from echonest
                events.forEach(function(obj, num) {
                    //console.log(obj.performance);
                    if (obj.performance[0]) {
                        artistTracks.push({'displayName': obj.displayName,
                                            'artist_id': obj.performance[0].artist.id,
                                            'event_id': obj.id,
                                            'event_uri': obj.uri,
                                            'thumbnail_uri': options.artist_icon_url.replace('AID', obj.performance[0].artist.id),
                                            'trackList': []})
                        }
                });
                
                artistTracks.forEach(function(obj, num) {
                    //hash holds pointer for event index
                    echonestOptions.url = echonestUrl.replace('SKAID', obj.artist_id) + '#' + num;
                    //get the tracks
                    request (echonestOptions, echonestCallback);
                });
            }
	    }
	}
    
    var rendered = false;
    var throttled = false;
    function echonestCallback(error, response, body) {
        callbackCount++;        // = callbackCount + 1;
        //console.log(response.statusCode);



        //fetch any tracks for this artist from woodshed library
	    if (!error && (response.statusCode == 200 || response.statusCode == 429)) {
            
            if (response.statusCode == 429 && ! throttled) {
                console.log('throttled at: ' + callbackCount + ', ' + artistTracks.length);
                throttled = true;
            }
            
            var tracks = JSON.parse(body);
            var ndx = response.request.href.split('#')[1];
            if (tracks.response.songs != undefined) {
                //console.log(tracks.response.songs);

                tracks.response.songs.forEach(function (obj, num) {
                    //console.log(artistTracks[ndx]);
                    var fId = obj.tracks.length > 0 ? obj.tracks[0].foreign_id.replace('rdio-US:track:', '') : 'none';
                    artistTracks[ndx].trackList.push({
                        'title': obj.title,
                        'artist_name': obj.artist_name,
                        'artist_id': artistTracks[ndx].artist_id,
                        'event_id': artistTracks[ndx].event_id,
                        'id': obj.id,
                        'foreign_id': fId,
                        'catalog': 'rdio-US'
                    });
                    //console.log(fId);
                });

                mongoClient.connect(req.app.get('dbUrl'), function (err, mdb) {
                    var col = mdb.collection(req.app.get('woodshed_library'));
                    var artistTrack = artistTracks[ndx];
                    var aId = artistTrack.artist_id.toString(); //OMG you wouldn't think so but mongo didn't like the numeric version
                    col.find({'artist_id': aId}).toArray(function (err, result) {
                        if (err) return;
                        console.log('artist: ' + artistTrack.artist_id + ' result:' + result)
                        result.map(function (obj, num) {
                            artistTrack.trackList.push({
                                '_id': obj._id,
                                'title': obj.title,
                                //'artist_name': obj.artist_name,
                                'artist_id': obj.artist_id,
                                'event_id': artistTrack.event_id,
                                'id': obj.id,
                                'woodshed_url': obj.trackUrl,
                                'catalog': 'woodshed'
                            })
                        })
                        mdb.close();
                    });
                });
            }
            //artistTracks[ndx].trackList = tracklist;
            if (callbackCount >= artistTracks.length && ! rendered) {
                //console.log(artistTracks.length + '  ' + callbackCount);
                rendered = true;
                throttled = false;
                callbackCount = 0;
               
                console.log('render at callbackCount: ' +  callbackCount);
                res.send({ artistTracks: artistTracks });
            }
	    }
    }
});


module.exports = router;

 //utilities
var _getSoundKickDateRange = function(startdate, enddate) {

    var dates = [];
    var sep = '-';
    var today = getMomentWhen(startdate, 0);
    var future = getMomentWhen(startdate, 1);

    dates.push(today.year() + sep + padDateItem(today.month() + 1) + sep + padDateItem(today.date()));
    dates.push(future.year() + sep + padDateItem(future.month() + 1) + sep + padDateItem(future.date()));

    return dates;

    function getDayWhen(days) {
        var dt = new Date();
        dt.setDate(dt.getDate() + days);
        return dt;
    }


    function getMomentWhen(startDate, days) {
        var mDay = moment.unix(startDate);
        return mDay.add(days, 'd');
    }




    function padDateItem(item) {
        return ('0' + item).slice(-2);
    }
};
