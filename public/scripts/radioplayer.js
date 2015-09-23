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

    soundManager.onready(function(){
        //for load testing -- autoplay one song
        var mySound = soundManager.createSound({
            id: 'test',
            url: "https://woodshedradio.blob.core.windows.net/mpc-test-container/04%20The%20Sun%20Ain't%20Gonna%20Shine%20Anymore1438992438659.m4a",
            onfinish: function(){
                this.destruct();
                //this.play()
                //$('#play').trigger('click');
            }
        });
        mySound.play();

    })



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
