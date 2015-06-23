var express = require('express');
var router = express.Router();
var callbackCount = 0;

/* GET home page. */
router.get('/', function(req, res) {
    var request = req.app.settings.request;
    var soundkickEndpoint = req.app.settings.SOUNDKICK_ENDPOINT;
    var echonestEndpoint = req.app.settings.ECHONEST_ENDPOINT;
    var page = 1;
    var events = [];
    var artistTracks = [];

    var eventIndex = 0;
    var options = {
        url: soundkickEndpoint + '&min_date=' + _getSoundKickDateRange()[0] + '&max_date=' + _getSoundKickDateRange()[1] + '&page=' + page + '&per_page=50&jsoncallback=jpCallback'
    };
    
    var echonestUrl = echonestEndpoint  + '&artist_id=songkick:artist:SKAID&sort=song_hotttnesss-desc&results=5&bucket=tracks&bucket=id:rdio-US';//&bucket=id:tracks:rdio-US;//&bucket=audio_summary';
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
                    //console.log(obj);
                    artistTracks.push({'displayName': obj.displayName,
                                        'artist_id': obj.performance[0].artist.id,
                                        'event_id': obj.id,
                                        'event_uri': obj.uri,
                                        'thumbnail_uri': '',
                                        'trackList': []})
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
                    //console.log(obj.tracks);
                    var fId = obj.tracks.length > 0 ? obj.tracks[0].foreign_id.replace('rdio-US:track:', '') : 'none';
                    artistTracks[ndx].trackList.push( {
                        'title': obj.title,
                        'artist_name': obj.artist_name,
                        'event_id': artistTracks[ndx].event_id,
                        'id': obj.id,
                        'tracks': obj.tracks,
                        'foreign_id': fId,
                        'catalog': 'rdio-US'
                    })
                    //console.log(fId);
                });

            }
                
            //artistTracks[ndx].trackList = tracklist;
            if (callbackCount == artistTracks.length && ! rendered) {
                console.log(artistTracks.length + '  ' + callbackCount);
                rendered = true;
                throttled = false;
                callbackCount = 0;
               
                console.log('render at callbackCount: ' +  callbackCount);
                res.render('comingsoon', { title: 'Woodshed Radio', artistTracks: artistTracks });
            }
	    }
    }
});


module.exports = router;

 //utilities
var _getSoundKickDateRange = function() {

    var dates = [];
    var sep = '-';
    var today = getDayWhen(0);
    var future = getDayWhen(1);          

    dates.push(today.getFullYear() + sep + padDateItem(today.getMonth() + 1) + sep + padDateItem(today.getDate()));
    dates.push(future.getFullYear() + sep + padDateItem(future.getMonth() + 1) + sep + padDateItem(future.getDate()));

    return dates;

    function getDayWhen(days) {
        var dt = new Date();
        dt.setDate(dt.getDate() + days);
        return dt;
    }

    function padDateItem(item) {
        return ('0' + item).slice(-2);
    }
};
