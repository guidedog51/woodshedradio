var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var request = req.app.settings.request;
    var soundkickEnpoint = req.app.settings.SOUNDKICK_ENDPOINT;
    var page = 1;
    var events = [];
    var options = {
        url: soundkickEnpoint + '&min_date=' + _getSoundKickDateRange()[0] + '&max_date=' + _getSoundKickDateRange()[1] + '&page=' + page + '&per_page=50&jsoncallback=jpCallback'
    };

    function callback(error, response, body) {
	    console.log(options.url);
	    if (!error && response.statusCode == 200) {
            //console.log(response);
	        var tmpEvents = eval(body);
	        //console.log(events);
            if (tmpEvents != undefined) {
                if (events.length == 0) {
                    events = tmpEvents;
                } else {
                    events = events.concat(tmpEvents);
                }
                console.log(events.length);
                var oldpage = page;
                page ++;
                options.url = options.url.replace('&page=' + oldpage, '&page=' + page);
                request (options, callback);
            }   else {
                console.log('render');
                console.log(events.length);
                res.render('comingsoon', { title: 'Woodshed Radio', events: events });
            }
	    }
	}

	request(options, callback);
    
    
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
    var future = getDayWhen(7);          

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
