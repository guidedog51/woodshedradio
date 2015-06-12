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
                    'max_date': end,
                    'jsoncallback': '?'
                };

            
//            $.ajax({
//                
////                dataType: 'jsonp',
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
            
        
            
            $.getJSON(url, 
                { 
                    'apikey' : SOUNDKICK_API_KEY,
                    'min_date': start,  
                    'max_date': end,
                    'jsoncallback': '?'
                },
                function(data) {
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
                })
                .error( 
                    function(data) {
                        alert("query syntax");
                    }
                );

        }
        
        return {
            fetchArtistsByLocation: _fetchArtistsByLocation,
            fetchArtistsByAppearanceDate: _fetchArtistsByAppearanceDate
        }
     
})();
