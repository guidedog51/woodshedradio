var ECHO_API_KEY= 'M8TCQASXDTEGU9VRO';
var ECHO_ENDPOINT = 'http://developer.echonest.com/api/v4/';
jQuery.ajaxSettings.traditional = true;

$(document).ready(function() {
//    var echonest = new EchoNest(ECHO_SECRET);
    
    //append play tag
    // get a set of "Hybrid" audio and output as HTML5 audio tags to the page
//    echonest.artist("Black Keys").audio( function(audioCollection) {
//        $("#playBar").append( audioCollection.to_html('<p>${artist} - ${length} long<br /><audio src="${url}" controls preload="none"></audio></p>') );
//    });
//    
    var locale = 'city: oakland';
    fetchArtistsByLocation(locale);
    
    
    
    
});