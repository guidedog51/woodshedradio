var ECHO_API_KEY= 'M8TCQASXDTEGU9VRO';
var SOUNDKICK_API_KEY = 'xdy5yMc0BaLlDZ0V';
var ECHO_ENDPOINT = 'http://developer.echonest.com/api/v4/';
var SOUNDKICK_ENDPOINT = 'http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json';
jQuery.ajaxSettings.traditional = true;

$(document).ready(function() {

    var locale = 'city: oakland';
    //EchoNestAPI.fetchArtistsByLocation (locale);
    
    EchoNestAPI.fetchArtistsByAppearanceDate('2015-06-11', '2015-06-19');
                                             
    
    
});