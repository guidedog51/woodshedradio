var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var request = req.app.settings.request;
    var soundkickEndpoint = req.app.settings.SOUNDKICK_ENDPOINT;
    var echonestEndpoint = req.app.settings.ECHONEST_ENDPOINT;
    var page = 1;
    var events = [];
    var eventIndex = 0;
    var options = {
        url: soundkickEndpoint + '&min_date=' + _getSoundKickDateRange()[0] + '&max_date=' + _getSoundKickDateRange()[1] + '&page=' + page + '&per_page=50&jsoncallback=jpCallback'
    };
    
    var echonestUrl = echonestEndpoint  + '&artist_id=songkick:artist:SKAID&sort=song_hotttnesss-desc&results=5'//&bucket=audio_summary';
    var echonestOptions = {
        url: echonestUrl
    };
    
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
                console.log(options.url);
                request (options, callback);
            }   else {
                
                //get tracklist data from echonest
                
                events.forEach(function(obj, num) {
//                    console.log(obj.performance[0].artist.id);
                    echonestOptions.url = echonestUrl.replace('SKAID', events[num].performance[0].artist.id) + '#' + num;
                    console.log(echonestOptions.url);
                    request (echonestOptions, echonestCallback);
                    //eventIndex ++;
                });
                
                //console.log(events[0].performance[0].artist.id);
                
    //                echonestOptions.url = echonestOptions.url.replace('SKAID', events[eventIndex].performance[0].artist.id) + '#' + eventIndex;
    //                console.log(echonestOptions.url);
    //                request (echonestOptions, echonestCallback);
    //                    
                
                
//                res.render('comingsoon', { title: 'Woodshed Radio', events: events });
            }
	    }
	}
    
    var callbackCount = 0;
    function echonestCallback(error, response, body) {
        callbackCount ++;
	    if (!error && response.statusCode == 200) {
            var tracks = JSON.parse(body);
            var ndx = response.request.href.split('#')[1];
            console.log(ndx);
            
            if (tracks.response.songs != undefined) {
            console.log(tracks.response.songs[0].title);

//            if (eventIndex < event.lenth) {
//                events = events.length == 0 ? tmpEvents : events.concat(tmpEvents);
//                var oldpage = page;
//                page ++;
//                options.url = options.url.replace('&page=' + oldpage, '&page=' + page);
//                console.log(options.url);
//                request (options, callback);
//            }   else {
//                
//                //get tracklist data from echonest
                var tracklist = [];
                for (i = 0; i < tracks.response.songs.length; i++) {
                    tracklist.push(tracks.response.songs[i].title);
                }
                
                events[ndx].tracklist = tracklist;
            }
                
                if (callbackCount = events.length) {
                    console.log(events);
                    res.render('comingsoon', { title: 'Woodshed Radio', events: events });
                }
//            }
	    }

        
    }
    

	request(options, callback);
     //render the container
    //res.render('comingsoon', {title: 'Woodshed Radio'});
    
    function jpCallback(data) {
        return data.resultsPage.results.event;
    }
});




module.exports = router;

 //utilities
var _getSoundKickDateRange = function() {

    var dates = [];
    var sep = '-';
    var today = getDayWhen(0);
    var future = getDayWhen(0);          

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
