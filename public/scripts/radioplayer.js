/**
 * Created by michaelconner on 8/12/15.
 */
var song = {};

$(document).ready(function(){
    sm2BarPlayerOptions.marquee = true;

    sm2BarPlayers.on = {
        play: function(player) {
            console.log(player);
            updateNowPlaying(player.playlistController.getItem().getAttribute('data-song_id'));
        }

    }

});


function updateNowPlaying(id) {
    //return;
    var song = getSong(id);
    var event = song.event;
    $('#artist-thumbnail').attr('src', event.thumbnail_uri);
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
