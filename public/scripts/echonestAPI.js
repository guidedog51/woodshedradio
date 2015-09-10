var EchoNestAPI = (function () {
    jQuery.ajaxSettings.traditional = true;
       
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
       
     //private functions 
    //this one hits echo nest
     var _fetchArtistsByLocation =  function (locale) {
            var url = ECHO_ENDPOINT + 'artist/search';
            $("#playBar").empty();
            $.getJSON(url, 
                { 
                    'api_key' : ECHO_API_KEY,
                    'artist_location': locale, 
                    'results' : 100,
                    'bucket': [ 'artist_location'],  
                    'sort': 'hotttnesss-desc'
                },
                function(data) {
                    if (data.response.status.code == 0) {
                        var artists = data.response.artists;
                        if (artists.length > 0) {
                            for (var i = 0; i < artists.length; i++) {
                                var artist = artists[i];
                                var li = $("<li>");
                                if ('artist_location' in artist) {
                                    //li.text(artist.name + " from " + artist.artist_location.location);
                                    li.text(artist.name);
                                    $("#playBar").append(li);
                                } else {
                                    console.log(artist);
                                }
                            }
                        } else {
                                $("#playBar").text("No results");
                        }
                    } else {
                        alert("Trouble getting artists: " + data.response.status.message);
                    }
                })
                .error( 
                    function(data) {
                        alert("query syntax error. Use 'city:', 'region:' and 'country:' qualifiers only");
                    }
                );
        };
        var _renderList = function(events) {
            if (events.length > 0) {
                for (i = 0; i < events.length; i++) {
                    var event = events[i].displayName;
                    var li = $("<li>");
                    li.text(event);
                    $("#playBar").append(li);
                }

            } else {
                $('#playBar').text("No events");     
            }
       };

        var page = 0;
        var _fetchArtistsByAppearanceDate = function (start, end) {
            _getListings();
        }
        
        
        var _getListings = function() {
            page ++;
            var url = SOUNDKICK_ENDPOINT + '&min_date=' + _getSoundKickDateRange()[0] + '&max_date=' + _getSoundKickDateRange()[1] + '&page=' + page + '&per_page=50&jsoncallback=?';
            console.log(url);
            $.getJSON(url, function(data){
                
                if (data.resultsPage.status == 'ok') {
                    var events = data.resultsPage.results.event;
                    //page through results
                    if (events != undefined) {
                        _renderList(events);
                        _getListings();
                    }
                    
                }   else {
                    console.log("Trouble getting artists: " + data.response.status.message);
                }
            })
            .error(
                function(data) {
                    console.log(data);
                }
            );
        }
        
        
        //expose public methods
        return {
            fetchArtistsByLocation: _fetchArtistsByLocation,
            fetchArtistsByAppearanceDate: _fetchArtistsByAppearanceDate
        }
        
        
})();
