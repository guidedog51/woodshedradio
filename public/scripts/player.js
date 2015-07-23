var R = window.R || {};
var currentSongs = [];
var currentShow = [];
var savedShow = [];
var songsToPlay = [];
var unlinkedCurrentSongs = [];
var savedSongs = [];
var curSong = null;
//var curShowSong = null;
var artistData;     //all the track metadata from the server
//var jade = require("jade");
var laddaSpinner={};

$(document).ready(function() {
    $.ajaxSetup( {cache: false});
    initUI();

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
    if ($('.tracklist').sortable('instance')) {
        $('.trackList').sortable('destroy')
    };
    $('.trackList').sortable({
        connectWith: '.showList',
        cursor: 'crosshair',
        items: '.track-playable'

    }).disableSelection();
    if ($('.showList').sortable('instance')) {
        $('.showList').sortable('destroy')
    };
    $('.showList').sortable({
        cursor: 'crosshair',
        connectWith: '#trash-dropdown',
        //connectWith: 'trackList',
        receive: function(e, ui) {
            //reset the playlist linked lists
            unlinkedCurrentSongs.length=0;
            createSongTable();
            //createShowTable();
            console.log(currentShow);
        },
        update: function(e, ui) {
            unlinkedCurrentSongs.length=0;
            createShowTable();
        }
    }).disableSelection();
    //$('.showList li').draggable();
    if($('#trash-playlist').droppable('instance')){
        $('#trash-playlist').droppable('destroy');
    }

    $('#trash-playlist').droppable({
        over: function(){
            $('#trash-playlist').trigger('click');
        }

    });
    if ($('#trash-dropdown').sortable('instance')) {
        $('#trash-dropdown').sortable('destroy')
    };
    $('#trash-dropdown').sortable({
        cursor: 'crosshair',
        connectWith: '.showList',
        receive: function(e, ui){
            //createShowTable();
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
        if (savedShow._id) {
            asyncConfirmYesNo('Save Show', 'Do you want to create a new show from this list?  Click <b>Save.</b><br/><br/>Do you want to update the currently loaded show?  Click <b>Save As.</b>', 'Save', 'Save As', saveNewPlaylist, saveCurrentPlaylist);
        } else {
            saveNewPlaylist();
        }
    })


}


function playNextSong() {
    if (curSong) {
        if (curSong.next) {
            playSong(curSong.next);
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
    //artistData is fetched from songKick
    //check if it is undefined or not -- if it is, get performance and track data
    //from persisted unlinkedCurrentSongs
    if (artistData) {
        artistData.forEach(function(obj, num) {
            if (obj.event_id == performanceId) {
                perf = obj;

            }
        });
    }

    if (perf.event_id) return perf;

    //these have been fetched from db
    savedSongs.forEach(function(obj, num) {
        if (obj.event.event_id == performanceId) {
            perf = obj.event;

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
    var trackList = $('#songContainer li').map(function() {
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
        } else {
            song.last = null;
            song.id = obj.track_id;
            song.event = obj.event;
            song.track = obj.song;
            unlinkedSong = jQuery.extend({}, song);
        }
        currentSongs.push(song);
    });
}


//this is for the radio show TODO: show = radio show; performance = songkick performance data;
function createShowTable() {

    currentShow = [{}];
    var rowNum = 1;
    //unlinkedCurrentSongs.length = 0;

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

function saveNewPlaylist() {
    savePlaylist(true);
}

function saveCurrentPlaylist() {
    savePlaylist(false);
}


function savePlaylist(createNew) {
    if (!$('#playlist-name').val()) {
        //alert('enter a playlist name!');
        setTimeout(function(){
            $('#playlist-name').focus();
        }, 0);
        return;
    }

    if (currentShow.length == 0) {
        $('#showContainer').removeClass('playlist-active');
        $('#songContainer').removeClass('playlist-active');
        $('#showContainer').addClass('playlist-active');
        return;
    }

    if (createNew===true) {
        //timestamp will be the id
        //tag is for the curator from UI
        songData._id = moment(Date.now()).unix();
    }
    songData.tag = $('#playlist-name').val();

    var l = Ladda.create($('#save-playlist').get()[0]);
    l.start();
    var songData = {'unlinkedSongs' : unlinkedCurrentSongs};

    console.log(songData);

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
        savedShow = songData;
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

    $.ajax({
        type: "GET",
        url: '/api/playlist/all/playlist/',
        data: {},
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data) {
        console.log(data);

        var savedShows = data.idList;
        var markup = window.savedList(data);
        $('#saved-list').html(markup);
        $('#saved-list').off('click', 'li');
        $('#saved-list').on('click', 'li', function(){
            //alert($(this).data('saved-id'));
            getSavedShow($(this).data('saved-id'));
        });


    }

    function error(xhr, result, error) {
        console.log(error);
        //l.stop();
    }

}

function getSavedShow(showID) {
    //var l = Ladda.create($('#get-playlists').get()[0]);
    //l.start();

    $.ajax({
        type: "GET",
        url: '/api/playlist/playlist/' + showID,
        data: {},
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data) {
        unlinkedCurrentSongs.length = 0;
        savedSongs.length = 0;
        savedShow.length = 0;
        savedShow = data.savedShow[0];
        savedSongs=data.savedShow[0].unlinkedSongs;
        var markup = window.showList(data.savedShow[0]);
        $('#showContainer').html(markup);
        $('#playlist-name').val(data.savedShow[0].tag);
        createShowTable();
        initSortable();
    }

    function error(xhr, result, error) {
        console.log(error);
        //l.stop();
    }

}

function asyncConfirmYesNo(title, msg, yesBtnText, noBtnText, yesFn, noFn) {
    var $confirm = $("#modalConfirmYesNo");
    $confirm.modal('show');
    $("#lblTitleConfirmYesNo").html(title);
    $("#lblMsgConfirmYesNo").html(msg);
    $('#btnYesConfirmYesNo').text(yesBtnText || 'Yes');
    $('#btnNoConfirmYesNo').text(noBtnText || 'No');
    $("#btnYesConfirmYesNo").off('click').click(function () {
        yesFn();
        $confirm.modal("hide");
    });
    $("#btnNoConfirmYesNo").off('click').click(function () {
        noFn();
        $confirm.modal("hide");
    });
}


