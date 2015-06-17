var express = require('express');
var router = express.Router();

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
    
    var echonestUrl = echonestEndpoint  + '&artist_id=songkick:artist:SKAID&sort=song_hotttnesss-desc&results=3'//&bucket=audio_summary';
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
                artistTracks.push({'displayName': obj.displayName,
                                    'artist_id': obj.performance[0].artist.id,
                                    'trackList': []})
                });
                
                artistTracks.forEach(function(obj, num) {
                    //hash holds pointer for event index
                    echonestOptions.url = echonestUrl.replace('SKAID', obj.artist_id) + '#' + num;
                    //console.log(echonestOptions.url);
                    request (echonestOptions, echonestCallback);
                });
                
            }
	    }
	}
    
    var callbackCount = 0;
    var rendered = false;
    function echonestCallback(error, response, body) {
        callbackCount ++;
        //var tracklist = [];
        console.log(response.statusCode);
        

	    if (!error && response.statusCode == 200) {
            var tracks = JSON.parse(body);
            var ndx = response.request.href.split('#')[1];
            //console.log(tracks);
            if (tracks.response.songs != undefined) {
                //console.log(tracks.response.songs[0].title);

                for (i = 0; i < tracks.response.songs.length; i++) {
                    artistTracks[ndx].trackList.push(tracks.response.songs[i].title);
                }
            }
                
            //artistTracks[ndx].trackList = tracklist;
            if (callbackCount = artistTracks.length && ! rendered) {
                //console.log(artistTracks.length);
                rendered = true;
                //apparently we have to wait a bit to ensure there's not a wait condition with the rendering
                //also this api is throttled at 150 requests per minute
                setInterval( function () {
                    res.render('comingsoon', { title: 'Woodshed Radio', artistTracks: artistTracks });
                    //console.log(artistTracks);
                }, 15000);
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
    var future = getDayWhen(2);          

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
