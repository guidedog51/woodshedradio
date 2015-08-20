/**
 * Created by michaelconner on 7/31/15.
 */
var SOUNDKICK_API_KEY = 'xdy5yMc0BaLlDZ0V';
//var SOUNDKICK_ENDPOINT = 'http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json?apikey=' + SOUNDKICK_API_KEY;
//var SOUNDKICK_STATIC_ENDPOINT = 'http://images.sk-static.com/images/media/';
var ECHONEST_API_KEY= 'M8TCQASXDTEGU9VRO';
//var ECHONEST_ENDPOINT = 'http://developer.echonest.com/api/v4/song/search?api_key=' + ECHONEST_API_KEY;



module.exports = {
    dbUrl: process.env.MONGOHQ_URL || 'mongodb://@127.0.0.1:27017/playlist',
    port: process.env.PORT || 3000,
    soundkick_api_key: SOUNDKICK_API_KEY,
    soundkick_endpoint: 'http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json?apikey=' + SOUNDKICK_API_KEY,
    soundkick_static_endpoint: 'http://images.sk-static.com/images/media/',
    echonest_api_key: ECHONEST_API_KEY,
    echonest_endpoint: 'http://developer.echonest.com/api/v4/song/search?api_key=' + ECHONEST_API_KEY,
    blob_base_url: 'https://woodshedradio.blob.core.windows.net/mpc-test-container/',
    woodshed_library: 'woodshedlibrary',
    stream_collection: 'streamPlaylist'
}