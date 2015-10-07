/**
 * Created by michaelconner on 8/12/15.
 */
var song = {};

$(document).ready(function(){

    soundManager.defaultOptions = {
        autoLoad: false,        // enable automatic loading (otherwise .load() will call with .play())
        autoPlay: false,        // enable playing of file ASAP (much faster if "stream" is true)
        from: null,             // position to start playback within a sound (msec), see demo
        loops: 1,               // number of times to play the sound. Related: looping (API demo)
        multiShot: false,        // let sounds "restart" or "chorus" when played multiple times..
        multiShotEvents: false, // allow events (onfinish()) to fire for each shot, if supported.
        onid3: null,            // callback function for "ID3 data is added/available"
        onload: null,           // callback function for "load finished"
        onstop: null,           // callback for "user stop"
        onfinish: null,         // callback function for "sound finished playing"
        onpause: null,          // callback for "pause"
        onplay: null,           // callback for "play" start
        onresume: null,         // callback for "resume" (pause toggle)
        position: null,         // offset (milliseconds) to seek to within downloaded sound.
        pan: 0,                 // "pan" settings, left-to-right, -100 to 100
        stream: true,           // allows playing before entire file has loaded (recommended)
        to: null,               // position to end playback within a sound (msec), see demo
        type: null,             // MIME-like hint for canPlay() tests, eg. 'audio/mp3'
        usePolicyFile: false,   // enable crossdomain.xml request for remote domains (for ID3/waveform access)
        volume: 100,            // self-explanatory. 0-100, the latter being the max.
        whileloading: null,     // callback function for updating progress (X of Y bytes received)
        whileplaying: null,     // callback during play (position update)
        // see optional flash 9-specific options, too
    }

    sm2BarPlayerOptions.marquee = true;

    sm2BarPlayers.on = {
        play: function(player) {
            console.log(player);
            updateNowPlaying(player.playlistController.getItem().getAttribute('data-song_id'));
        }


    }


    $('#button-fb').on('click', function(){
        FB.ui({
            method: 'share',
            href: 'http://woodshed.cloudapp.net/radioplayer',
        }, function(response){
            //I guess we could tell 'em it didn't work....
        });
    })


});


function updateNowPlaying(id) {
    //return;
    var song = getSong(id);
    var event = song.event;
    var thumb_uri = event.thumbnail_uri;
    $('#artist-thumbnail').attr('src', thumb_uri);
    $('#artist-name').text(song.track.artist_name);
    $('#track-name').text(song.track.title);
    $('#performance-link').attr('href', event.event_uri);
    $('#performance-link').text(event.displayName);

}

function getSong(id) {
    var song = {};
    currentPlaylist.unlinkedSongs.forEach(function(obj, num){
        if (obj.id == id) {
            song = obj;
            return;
        }
    });
    return song;
}
