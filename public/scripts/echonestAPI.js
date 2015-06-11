function fetchArtistsByLocation(locale) {
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
}