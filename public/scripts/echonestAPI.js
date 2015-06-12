var EchoNestAPI = (function () {
    jQuery.ajaxSettings.traditional = true;
       
        
     //private functions   
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
        
        var _fetchArtistsByAppearanceDate = function (start, end) {
            var url = SOUNDKICK_ENDPOINT;
            //$("#playBar").empty();
            
            var reqData =                 { 
                    'apikey' : SOUNDKICK_API_KEY,
                    'min_date': start,  
                    'max_date': end
                };

//            $.ajax({
//                
//                dataType: 'jsonp',
//                jsonp: false,
//                jsonpCallback: 'jsonCallback',
//                cache: 'true',
//                url: url,
//                data: reqData,
//                success: function(data) {
//                    
//                },
//                error: function(xHR) {
//                    
//                }
//                
//                
//                
//            })
//            
            var _renderList = function(data) {
                //alert(data.resultsPage.status);
                     if (data.resultsPage.status == 'ok') {
                        var events = data.resultsPage.results.event;
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
                    } else {
                        alert("Trouble getting artists: " + data.response.status.message);
                    }
           };
            
          //var url = "https://api.songkick.com/api/3.0/artists/253846/calendar.json?apikey=HlgKnFaq9qYO1h9T&jsoncallback=?";
          var url = "http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json?apikey=xdy5yMc0BaLlDZ0V&min_date=2015-06-11&max_date=2015-06-22&jsoncallback=?";
            $.getJSON(url, function(data){
            // Do what you want to do with the return data within this callback
                console.log(data);
                _renderList(data);
            });
            
            
//            $.getJSON(url, 
//                { 
//                    'apikey' : SOUNDKICK_API_KEY,
//                    'min_date': start,  
//                    'max_date': end//,
//                    //jsoncallback': 'jsonCallback'
//                },
//                function(data) {
//                    if (data.resultsPage.status == 'ok') {
//                        var events = data.resultsPage.results.event;
//                        if (events.length > 0) {
//                            for (i = 0; i < events.length; i++) {
//                                var event = events[i].displayName;
//                                var li = $("<li>");
//                                li.text(event);
//                                $("#playBar").append(li);
//                            }
//                            
//                        } else {
//                            $('#playBar').text("No events");     
//                      }
//                    } else {
//                        alert("Trouble getting artists: " + data.response.status.message);
//                    }
//                })
//                .error( 
//                    function(data, err, response) {
//                        eval(data.responseText);
//                    }
//                );

        }
        
        return {
            fetchArtistsByLocation: _fetchArtistsByLocation,
            fetchArtistsByAppearanceDate: _fetchArtistsByAppearanceDate
        }
     
})();
