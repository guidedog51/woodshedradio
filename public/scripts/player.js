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
var laddaSpinner = null;
var deleteId=null;
var currentShowDirty=false;
var dirtyShowId;
var adminAuthenticated = false;
var uploadedSongData = {};

$(document).ready(function() {
    $.ajaxSetup( {
        cache: false
        //beforeSend: function(xhr, opts) {
            //if (!adminAuthenticated) {
            //    xhr.abort();
            //
            //    setTimeout(function() {
            //        $('#modal-login').modal('show');
            //    }, 200)
            //}
        //}
    });

    adminAuthenticated = isAuthenticated(initUI);
    //initUI();

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
        connectWith: '#trash-playlist',
        //connectWith: 'trackList',
        receive: function(e, ui) {
            //reset the playlist linked lists
            unlinkedCurrentSongs.length=0;
            createSongTable();
        },
        update: function(e, ui) {
            unlinkedCurrentSongs.length=0;
            createShowTable();
            currentShowDirty = true;
        }
    }).disableSelection();
    //$('.showList li').draggable();
    if($('#trash-playlist').sortable('instance')){
        $('#trash-playlist').sortable('destroy');
    }
    $('#trash-playlist').sortable({
        over: function(){
            //$('#trash-playlist').trigger('click');
        },
        receive: function(e, ui) {
            //TODO: turn the button red
            $(ui.item).remove();
            if ($(ui.item).data('saved-id')) {

                deleteId = $(ui.item).data('saved-id');

                asyncConfirmYesNo('Delete Show', 'Delete saved playlist<br/><br/> <b>' + $(ui.item).text() + '?<br/><br/></b>This cannot be undone.', 'Delete', 'Cancel', deleteSavedShow, dismissModal);
            }   else {

                currentShowDirty = true;
            }
        }

    });
    if ($('#saved-list').sortable('instance')) {
        $('#saved-list').sortable('destroy')
    };
    $('#saved-list').sortable({
        cursor: 'crosshair',
        connectWith: '#trash-playlist'
    }).disableSelection();
}

function initUI() {
    $.ajaxSetup( {
        beforeSend: function(xhr, opts) {
            if (!adminAuthenticated) {
                xhr.abort();

                setTimeout(function() {
                    $('#modal-login').modal('show');
                    $('#login-message').hide();
                }, 200)
            } else {if (laddaSpinner){laddaSpinner.start();}}

        }
    });


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
    });

    $("#save-playlist").on("click", function(e) {
        if (savedShow._id) {
            asyncConfirmYesNo('Save Show', 'Do you want to create a new show from this list?  Click <b>Save New.</b><br/><br/>Do you want to update the currently loaded show?  Click <b>Update.</b>', 'Save New', 'Update', saveNewPlaylist, saveCurrentPlaylist);
        } else {
            saveNewPlaylist();
        }
    });

    $('#trash-playlist').on('click', function(e) {
        $('li', $(this)).remove();
    });

    if (!adminAuthenticated) {
        $('#modal-login').modal('show');
    }

    $('#submit-login').on('click', function(e) {
        loginCurator();
    })

    $('#upload-track').fileinput({
        uploadUrl: '/api/upload/woodshedlibrary',
        uploadExtraData: uploadedSongData,
    });

    $('#btn-upload').on('click', function(){
        $('#modal-upload').modal('show');
    })

    $('#btn-logoff').on('click', function(){
        logOnOrOff();
    })

    $('#btn-publish-playlist').on('click', function() {
        confirmPublishPlaylist();
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
            $(this).attr('id', 'p' + rowNum);
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
            unlinkedSong = jQuery.extend({}, song); //clones song
        }
        song.rowId = 'p' + (num + 1);
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
            $(this).off('click');
            $(this).on('click', function() {
                songsToPlay = currentShow;
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
        song.rowId = 's' + (num + 1);
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
      $('li').removeClass('track-playing');
      $('#' + song.rowId).addClass('track-playing');
      console.log(event);
      updateUpload(song)
  }

function updateUpload(song) {
    var event = song.event;
    $('#artist-thumbnail-upload').attr('src', event.thumbnail_uri);
    $('#artist-name-upload').text(song.track.artist_name);
    $('#track-name-upload').text(song.track.title);
    $('#performance-link-upload').attr('href', event.event_uri);
    $('#performance-link-upload').text(event.displayName);

    uploadedSongData.artist_id = song.track.artist_id;
    uploadedSongData.artist_name = song.track.artist_name;
}

function saveNewPlaylist() {
    savePlaylist(true);
}

function saveCurrentPlaylist() {
    savePlaylist(false);
}

function deleteSavedShow() {
    deletePlaylist(deleteId)
}

function savePlaylist(createNew) {
    var verb = 'POST';

    if (!$('#playlist-name').val()) {
        //resetting focus in this context likes a separate thread
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

    var l = Ladda.create($('#save-playlist').get()[0]);
    l.start();

    var songData = {'unlinkedSongs' : unlinkedCurrentSongs};

    if (createNew===true) {
        //timestamp will be the id
        //tag is for the curator from UI
        songData._id = moment(Date.now()).unix();
    } else {
        verb = 'PUT';
        songData._id = savedShow._id;
    }
    songData.tag = $('#playlist-name').val();
    $.ajax({
        type: verb,
        url: '/api/playlist/playlist',
        data: JSON.stringify(songData),
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data) {
        savedShow = songData;
        currentShowDirty = false;
        l.stop();
    }

    function error(xhr, result, error) {
        console.log(error);
        l.stop();
    }

}

function confirmPublishPlaylist() {

    asyncConfirmYesNo('Publish Playlist <b>'+ $('#playlist-name').val() + '</b>', 'Publishing this playlist will replace the current stream with new stream of this playlist.<br/><br/></b>Current listeners will receive new stream when their current playlist is done playing.', 'Publish', 'Cancel', publishCurrentPlaylist, dismissModal);

}

function publishCurrentPlaylist() {
    var verb = 'POST';

    if (!$('#playlist-name').val()) {
        //resetting focus in this context likes a separate thread
        setTimeout(function(){
            $('#playlist-name').focus();
        }, 0);
        return;
    }

    if (savedShow.id) {
        //TODO: validate -- only allow publishing for non-dirty saved show
        if (currentShowDirty) {return;}

    }


    var l = Ladda.create($('#btnYesConfirmYesNo').get()[0]);
    l.start();

    savedShow.archived = false;

    //strip the tracklist
    savedShow.unlinkedSongs.forEach(function(obj, num){
        delete obj.event.trackList;
    })


    $.ajax({
          type: 'POST',
          url: '/api/playlist/publish/streamPlaylist',
          data: JSON.stringify(savedShow),
          success: success,
          error: error,
          dataType: 'json',
            contentType: "application/json; charset=utf-8"
    });
    
    function success(data) {
        l.stop();
    }
    
    function error(xhr, result, error) {
        console.log(error);
        l.stop();
    }
}

function deletePlaylist(plId) {

    //var l = Ladda.create($('#get-playlists').get()[0]);
    //l.start();

    $.ajax({
        type: "DELETE",
        url: '/api/playlist/playlist/' + plId,
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data) {
        console.log(data);
    }

    function error(xhr, result, error) {
        console.log(error);
        //l.stop();
    }
}

function getArtistsPerformances(sd) {
    laddaSpinner = Ladda.create($('#date-button').get()[0]);
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
        laddaSpinner.stop();
        //laddaSpinner.destroy();
        laddaSpinner = null;
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
            loadSavedShow($(this).data('saved-id'));
        });

        initSortable();
    }

    function error(xhr, result, error) {
        console.log(error);
        //l.stop();
    }

}

function loadSavedShow(showId) {
    if (!currentShowDirty) {
        getSavedShow(showId)
    } else {
        dirtyShowId = showId;
        asyncConfirmYesNo('Load Saved Show', 'Before loading another saved show, do you want to save changes to show you have been working on?  Click <b>Save.</b><br/><br/><b>Or: </b> just load the selected show?  Click <b>Load.</b>', 'Save', 'Load', triggerSaveShow, promptForSavedShow);
    }
}

function promptForSavedShow() {
    getSavedShow(dirtyShowId);
}

function triggerSaveShow(){
    if (!currentShowDirty) {return;}
    $('#modalConfirmYesNo').css('display', 'block');    //hack to allow chaining of the bootstrap modal
    setTimeout(function(){
        $("#save-playlist").trigger('click');
    }, 500);
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
        currentShowDirty = false;
    }

    function error(xhr, result, error) {
        console.log(error);
        //l.stop();
    }

}


function logOnOrOff() {
    if (adminAuthenticated) {
        logoutCurator();
    } else {
        $('#modal-login').modal('show');
    }
}


function logoutCurator() {

    //var l = Ladda.create($('#get-playlists').get()[0]);
    //l.start();
    $.ajax({
        type: "GET",
        url: '/login/logoff',
        data: {},
        beforeSend: function(){},
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data, response, xhr) {
        adminAuthenticated = false;
        //modify the login menu text
        $('#btn-logoff').text("Log in");
    }

    function error(xhr, result, error) {
        console.log(error);
        adminAuthenticated = false;
        //l.stop();
    }
}

function loginCurator() {
    //var l = Ladda.create($('#get-playlists').get()[0]);
    //l.start();
    var formData = ({'username': $('#user-name').val(), 'password': $('#password').val()})
    $.ajax({
        type: "POST",
        url: '/login',
        data: JSON.stringify(formData),
        beforeSend: function(){},
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data, response, xhr) {
        adminAuthenticated = data.auth;
        if (!adminAuthenticated) {
            $('#login-message').show();
        } else {
            $('#modal-login').modal('hide');
            //modify login menu text
            $('#btn-logoff').text('Log off');
        }
    }

    function error(xhr, result, error) {
        console.log(error);
        adminAuthenticated = false;
        //l.stop();
    }

}


function isAuthenticated(callback) {
    if (adminAuthenticated) {return true;};

    $.ajax({
        type: "GET",
        url: '/login/auth',
        beforeSend: function(){},
        data: {},
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data, response, xhr) {
        adminAuthenticated = data.auth;
        callback();
    }

    function error(xhr, result, error) {
        console.log(error);
        adminAuthenticated = false;
        $('#modal-login').modal('show');
        //l.stop();
        callback();
    }

}

function dismissModal() {
    var $confirm = $("#modalConfirmYesNo");
    $confirm.modal("hide");
}

function asyncConfirmYesNo(title, msg, yesBtnText, noBtnText, yesFn, noFn) {
    var $confirm = $("#modalConfirmYesNo");
    $confirm.modal('show');
    $("#lblTitleConfirmYesNo").html(title);
    $("#lblMsgConfirmYesNo").html(msg);
    $('#btnYesConfirmYesNo').text(yesBtnText || 'Yes');
    $('#btnNoConfirmYesNo').text(noBtnText || 'No');
    $("#btnYesConfirmYesNo").off('click').click(function () {
        $confirm.modal("hide");
        yesFn();
    });
    $("#btnNoConfirmYesNo").off('click').click(function () {
        $confirm.modal("hide");
        noFn();
    });
}


