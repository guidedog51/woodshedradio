var R = window.R || {};
var currentSongs = [];
var curSong = null;
var artistData;     //all the track metadata from the server

$(document).ready(function() {
    $.ajaxSetup( {cache: false});
    initUI();
    createSongTable();
    R.ready(
        function() {
            R.player.on("change:playingTrack", function(track) {
                if (track === null) {
                    playNextSong();
                }
            });
            
            R.player.on("change:playState", function(state) {
                if (state == R.player.PLAYSTATE_PAUSED) {
                    $("#playPlay").show();
                    $("#playPause").hide();
                }
                if (state == R.player.PLAYSTATE_PLAYING) {
                    $("#playPlay").hide();
                    $("#playPause").show();
                }
                if (state == R.player.PLAYSTATE_STOPPED) {
                    // playNextSong();
                }
                songChanged(curSong);
            });
            R.player.on("change:playingSource", function(track) {
                songChanged(curSong);
            });
        }
    );
});


function initUI() {
    $("#save").click(function() {
        savePlaylist();
    });
    $("#playNext").click(function() {
        playNextSong();
    });
    $("#playPrev").click(function() {
        playPrevSong();
    });
    $("#playPlay").click(function() {
        if (curSong == null) {
            if (currentSongs && currentSongs.length > 0) {
                playSong(currentSongs[0]);
            }
        } else {
            R.player.togglePause();
        }
    });
    $("#playPause").click(function() {
        R.player.togglePause();
    }).hide();
}


function playNextSong() {
    if (curSong) {
        if (curSong.next) {
            playSong(curSong.next);
        } 
    }  else {
        if (currentSongs && currentSongs.length > 0) {
            playSong(currentSongs[0]);
        }
    }
}

function playPrevSong() {
    if (curSong) {
        if (curSong.prev) {
            playSong(curSong.prev);
        } 
    }  else {
        if (currentSongs && currentSongs.length > 0) {
            playSong(currentSongs[0]);
        }
    }
}

function playSong(song) {
    if (song === curSong) {
        R.player.togglePause();
    } else {
        var oldSong = curSong;
        curSong = song;
        songChanged(oldSong);
        var id = song.id;//getRdioID(curSong);
        if (id == null) {
            playNextSong();
        } else {
            R.player.play({source: id});
        }
    }
}

function songChanged(song) {
    if (song) {
        if (song === curSong && R.player.playState() === R.player.PLAYSTATE_PLAYING) {
            //song.row.addClass('success');
        } else {
            //song.row.removeClass('success');
        }
    }
}    

function getSong(songId) {
    var newSong={};
    currentSongs.forEach(function(obj, num) {
        if (obj.id == songId) {
            newSong = obj;
            return;
            
        }
    });
    return newSong;
}

function createSongTable() {
    currentSongs = [{}];
    var rowNum = 1;
    
    //get the trackids from jquery
    var trackList = $('li').map(function() {
        var id = $(this).data("track_id");
        if (id != 'none' && $(this).attr('class')==='tracklist track-playable') {
            $(this).on('click', function() {
                var songToPlay = getSong(id);
                playSong(songToPlay);
                //alert(id);
            });
            $(this).attr('id', rowNum);
            rowNum++;
            return id;
        }
    }).get();    
    
    trackList.forEach(function(obj, num) {
        var song = {};
        if (currentSongs.length > 0) {
            var last = currentSongs[currentSongs.length - 1];
            last.next = song;
            song.prev = last;
            song.id = obj;
        } else {
            song.last = null;
            song.id = obj;
        }
        currentSongs.push(song);
    });
    
    
    
//    _.each(currentMessage, function(c, i) {
//        var row = $("<tr>");
//        var char = $("<td class='char'>");
//        char.html('<b>' + c.toUpperCase() + '</b>');
//        var title = $("<td>");
//        if (c == ' ') {
//            title.html('&nbsp;');
//        } else {
//           var song = getMatchingSong(c, currentGenre);
//            if (song) {
//                song.prev = null;
//                song.next = null;
//                if (currentSongs.length > 0) {
//                    var last = currentSongs[currentSongs.length - 1];
//                    last.next = song;
//                    song.prev = last;
//                } 
//                currentSongs.push(song);
//                title.text(song.title + ' by ' + song.artist_name);
//                song.row = row;
//                row.on("click", function() {
//                    playSong(song);
//                });
//            }
//        }
//        row.append(char);
//        row.append(title);
//        rows.append(row);
//    });
}


