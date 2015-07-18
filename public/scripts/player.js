var R = window.R || {};
var currentSongs = [];
var currentShow = [];
var songsToPlay = [];
var unlinkedCurrentSongs = [];
var curSong = null;
//var curShowSong = null;
var artistData;     //all the track metadata from the server
//var jade = require("jade");
var laddaSpinner={};

$(document).ready(function() {
    $.ajaxSetup( {cache: false});
    initUI();
    //createSongTable();
    //postCurrentSongs();
    //initSortable();
    //var jt = jade.render("/views/error.jade")

    //var markup = window.songList({artistTracks: artistData});

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

function initSortable() {
    $('.trackList').sortable({
        connectWith: '.showList',
        cursor: 'crosshair',
        items: '.track-playable'

    }).disableSelection();
    $('.showList').sortable({
        cursor: 'crosshair',
        //connectWith: 'trackList',
        receive: function(e, ui) {
            //reset the playlist linked lists
            createSongTable();
            createShowTable();
            console.log(currentShow);
        }
    }).disableSelection();
}

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
            if (songsToPlay && songsToPlay.length > 0) {
                playSong(songsToPlay[0]);
            }
        } else {
            R.player.togglePause();
        }
    });
    $("#playPause").click(function() {
        R.player.togglePause();
    }).hide();


    $("#performance-date").datepicker({
        format: "yyyy-mm-dd",
        todayHighlight: true,
        startDate: 'd'
    });

    $("#performance-date").on("changeDate", function (e) {
        $(this).datepicker('hide');
        getArtistsPerformances($(this).val());
    });

    $("#get-playlists").on("click", function(e) {
        getPlaylists();
    })

    $("#save-playlist").on("click", function(e) {
        savePlaylist();
    })
}


function playNextSong() {
    if (curSong) {
        if (curSong.next) {
            playSong(curSong.next);l
        } 
    }  else {
        if (songsToPlay && songsToPlay.length > 0) {
            playSong(songsToPlay[0]);
        }
    }
}

function playPrevSong() {
    if (curSong) {
        if (curSong.prev) {
            playSong(curSong.prev);
        } 
    }  else {
        if (songsToPlay && songsToPlay.length > 0) {
            playSong(songsToPlay[0]);
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
            updateNowPlaying(song);
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
    songsToPlay.forEach(function(obj, num) {
        if (obj.id == songId) {
            newSong = obj;

            
        }
    });
    return newSong;
}

function getPerformance(performanceId) {
    var perf = {};
    artistData.forEach(function(obj, num) {
        if (obj.event_id == performanceId) {
            perf = obj;

        }
    });
    return perf;
}

function getTrackDataForPerformance(eventId, trackId) {
    var perf = getPerformance(eventId);
    var trackData = {};
    perf.trackList.forEach(function(obj, num) {
        if (obj.foreign_id == trackId) {
            trackData = obj;

        }
    });
    return trackData;
}

function createSongTable() {
    currentSongs = [{}];
    var rowNum = 1;
    
    //get the trackids from jquery
    var trackList = $('li').map(function() {
        var id = $(this).data("track_id");
        var eventId = $(this).data('event_id');
        var performance = {};
        var songToPlay = {};
        if (id != 'none' && $(this).hasClass('track-playable')) {
            $(this).on('click', function() {
                songsToPlay = currentSongs;
                songToPlay = getSong(id);
                playSong(songToPlay);
                $('#showContainer').removeClass('playlist-active');
                $('#songContainer').addClass('playlist-active');
            });
            $(this).attr('id', rowNum);
            rowNum++;
            return {'track_id': id,
                    'event': getPerformance(eventId),
                    'song': getTrackDataForPerformance(eventId, id)};
        }
    }).get();    
    
    trackList.forEach(function(obj, num) {
        var song = {};
        var unlinkedSong = {};
        if (currentSongs.length > 0) {
            var last = currentSongs[currentSongs.length - 1];
            last.next = song;
            song.prev = last;
            song.id = obj.track_id;
            song.event = obj.event;
            song.track = obj.song;
            //persist unlinked version
            //unlinkedSong = jQuery.extend({}, song);
            //delete unlinkedSong.next;
            //delete unlinkedSong.prev;
        } else {
            song.last = null;
            song.id = obj.track_id;
            song.event = obj.event;
            song.track = obj.song;
            unlinkedSong = jQuery.extend({}, song);
        }
        currentSongs.push(song);
        //unlinkedCurrentSongs.push(unlinkedSong);
        //debugger;
    });
}

function createShowTable() {

    currentShow = [{}];
    var rowNum = 1;

    //get the trackids from jquery
    var showTrackList = $('.showList li').map(function() {
        var id = $(this).data("track_id");
        var eventId = $(this).data('event_id');
        var performance = {};
        var songToPlay = {};
        if (id != 'none' && $(this).hasClass('track-playable')) {
            songsToPlay = currentShow;
            $(this).off('click');
            $(this).on('click', function() {
                $('#songContainer').removeClass('playlist-active');
                $('#showContainer').addClass('playlist-active');
                songToPlay = getSong(id);
                playSong(songToPlay);
            })

            $(this).attr('id', 's' + rowNum);
            rowNum++;
            return {'track_id': id,
                'event': getPerformance(eventId),
                'song': getTrackDataForPerformance(eventId, id)};
        }
    }).get();

    showTrackList.forEach(function(obj, num) {
        var song = {};
        if (currentShow.length > 0) {
            var last = currentShow[currentShow.length - 1];
            last.next = song;
            song.prev = last;
            song.id = obj.track_id;
            song.event = obj.event;
            song.track = obj.song;
            //persist unlinked version
            unlinkedSong = jQuery.extend({}, song);
            delete unlinkedSong.next;
            delete unlinkedSong.prev;
        } else {
            song.last = null;
            song.id = obj.track_id;
            song.event = obj.event;
            song.track = obj.song;
            unlinkedSong = jQuery.extend({}, song);
        }
        currentShow.push(song);
        unlinkedCurrentSongs.push(unlinkedSong);
        //debugger;
    });

}


  function updateNowPlaying(song) {
      var event = song.event;
      $('#artist-thumbnail').attr('src', event.thumbnail_uri);
      $('#artist-name').text(song.track.artist_name);
      $('#track-name').text(song.track.title);
      $('#performance-link').attr('href', event.event_uri);
      $('#performance-link').text(event.displayName);
      console.log(event);
  }

function savePlaylist() {
    var l = Ladda.create($('#save-playlist').get()[0]);
    l.start();
    var songData = {'unlinkedSongs' : unlinkedCurrentSongs};

    //timestamp will be the id
    //tag is for the curator from UI
    songData._id = moment(Date.now()).unix();
    songData.tag = $('#playlist-name').val();

    console.log(songData);
    return;
    $.ajax({
          type: "POST",
          url: '/api/playlist/playlist',
          data: JSON.stringify(songData),
          success: success,
          error: error,
          dataType: 'json',
            contentType: "application/json; charset=utf-8"
    });
    
    function success(data) {
        console.log(data.success);
        l.stop();
    }
    
    function error(xhr, result, error) {
        console.log(error);
        l.stop();
    }
}

function getArtistsPerformances(sd) {
    var l = Ladda.create($('#date-button').get()[0]);
    l.start();
    $.ajax({
        type: "GET",
        url: '/api/showlist/' + moment(sd).unix(),
        data: {},
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data) {
        console.log('performance data fetched');
        artistData = data.artistTracks;
        var markup = window.songList({artistTracks: data.artistTracks});
        $('#songContainer').html(markup);
        createSongTable();
        initSortable();
        l.stop();
    }

    function error(xhr, result, error) {
        console.log(error);
        l.stop();
    }
}

function getPlaylists() {
    //var l = Ladda.create($('#get-playlists').get()[0]);
    //l.start();
}


