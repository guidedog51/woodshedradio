var R = window.R || {};
var currentSongs = [];
var currentShow = [];
var savedShow = {};
var songsToPlay = [];
var unlinkedCurrentSongs = [];
var savedSongs = [];
//var unsavedSongs = [];
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
var songLoaded = false;
//var uploadedSongDataStringified = {};
var config;

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
            createShowTable();

            if (!savedShow.unlinkedCurrentSongs){
                savedShow.unlinkedCurrentSongs = unlinkedCurrentSongs;
                savedSongs = unlinkedCurrentSongs;
            }

            currentShowDirty = true;
        },
        stop: function(e, ui) {
            unlinkedCurrentSongs.length=0;
            createShowTable();
            currentShowDirty = true;
        },
        change: function(e, ui) {

        },
        update: function(e, ui) {

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

    if ($('#saved-merge-playlists').sortable('instance')) {
        $('#saved-merge-playlists').sortable('destroy')
    };

    $('#saved-merge-playlists').sortable({
        cursor: 'crosshair',
        connectWith: '#playlists-to-merge'

    }).disableSelection();

    if ($('#playlists-to-merge').sortable('instance')) {
        $('#playlists-to-merge').sortable('destroy')
    }

    $('#playlists-to-merge').sortable({
        cursor: 'crosshair',
        connectWith: '#saved-merge-playlists',
        over: function(){
        },
        receive: function(e, ui) {

        }
    });
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
            //R.player.togglePause();
            playSong(curSong);
        }
    });
    $("#playPause").click(function() {
        //R.player.togglePause();
        playSong(curSong);
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

    $("#add-show-performance-date").datepicker({
        format: "yyyy-mm-dd",
        todayHighlight: true,
        startDate: 'd'
    });

    $("#add-show-performance-date").on("changeDate", function (e) {
        $(this).datepicker('hide');
        //getArtistsPerformances($(this).val());
    });

    $("#get-playlists").on("click", function(e) {
        getPlaylists();
    });

    $("#save-playlist").on("click", function(e) {
        if (showLogin()) {
            return;
        }
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

    $('#add-show-form').valid();

    $('#submit-show').on('click', function(e) {
        //only valid if file has been uploaded -- we have to turn the upload button into a submit button
        if ($('#add-show-form').valid()) {
            e.preventDefault();
            //alert('valid');
            //process the added show

            var timestamp = Date.now();
            var eventId = 'wseid' + timestamp;
            var artistId = 'wsaid' + timestamp;  //TODO: replace with existing artistId if any
            var venueId = 'wsvid' + timestamp;  //this is provisional -- we'll search by venue name before upserting

            var values = {};
            var inputs = $('#add-show-form input, #add-show-form textarea');
            $.each(inputs, function(index, obj){
                values[obj.name] = $(obj).val();
            })
            values.event_id = eventId;
            values.artist_id = artistId;
            values.venue_id = venueId;

            //alert(values.artist_name);
            $('#modal-add-show').modal('hide');

            //ajax the show and artist details
            addShow(values);

        }
    })

    $('#upload-track').fileinput({
        uploadUrl: '/api/upload/woodshedlibrary',
        uploadExtraData: uploadedSongData,
        allowedFileTypes: ['audio', 'object'],
        allowedPreviewTypes: false
    });

    $('#upload-track').on('filepreajax', function(event, previewId, index) {
        //console.log('File pre ajax triggered');
        //update the track name in uploadedSongData
        uploadedSongData.track_name = $('#track-name-upload').val();
    });

    $('#upload-track').on('fileloaded', function(event, file, previewId, index, reader) {
        //console.log(file.name);
        var cleanedName = file.name.split('.')[0];
        $('#track-name-upload').val(cleanedName);
        uploadedSongData.track_name = cleanedName;
    });

    $('#upload-track').on('fileuploaded', function(event, data, previewId, index) {

        if ($('.showList').sortable('instance')) {
            $('.showList').sortable('destroy')
        };

        //this will update the saved show
        addUploadedTrackToPerformanceAndShow(data.response.fileData.event_id, data.response.fileData, data.response.fileData.artist_id)


        var markup = window.showList(savedShow);
        $('#showContainer').empty().html(markup);
        var ssName = savedShow.tag;

        $('#playlist-name').val(ssName);

        unlinkedCurrentSongs.length = 0;
        createShowTable();
        initSortable();
        currentShowDirty = true;

        //update the track name in the upload marquee
        //$('#track-name-upload').val('');

    });

    $('#btn-upload').on('click', function(){
        if (showLogin()) {
            return;
        }

        if (!songLoaded){
            asyncAlert('Upload Track For Show', 'No show or artist selected.<br/><br/></b>Select a track or a show to load show data for the newly uploaded track.');
            return;
        }

        $('#modal-upload').modal('show');
    })

    $('#btn-add-show').on('click', function() {
        if (showLogin()) {
            return;
        }
        $('#modal-add-show').modal('show');
    })

    $('#btn-logoff').on('click', function(){
        logOnOrOff();
    })

    $('#btn-publish-playlist').on('click', function() {
        if (showLogin()) {
            return;
        }
        confirmPublishPlaylist();
    })

    $('#btn-new-playlist').on('click', function() {
        if (showLogin()) {
            return;
        }
        clearCurrentShow();
    })

    $('#btn-stale-playlist').on('click', function() {
        if (showLogin()) {
            return;
        }
        removeStaleShowListings();
    })

    $('#btn-merge-playlists').on('click', function() {
        if (showLogin()) {
            return;
        }

        $('#modal-merge-playlists').modal('show');
        getPlaylists(true);
    })

    $('#save-merged-playlist').on('click', function(e){
        var mergedList = $('#playlists-to-merge li').map(function() {
            var id = $(this).data("saved-id");
            if (id) {
                //return {'playlist_id': id};
                return id;
            }
        }).get();
        mergePlaylist(mergedList)
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
        if (curSong.soundManagerId) {
            //TODO: move to togglePause function
            var s = soundManager.getSoundById(curSong.soundManagerId);
            if (curSong.playing) {
                s.pause();
                $("#playPlay").show();
                $("#playPause").hide();
                delete curSong.playing;
            }  else {
                s.play();
                $("#playPlay").hide();
                $("#playPause").show();
                curSong.playing = true;
            }
        } else {

            if (R.player.playState() === 0){
                R.player.play({source: song.id});
                updateNowPlaying(song);
                $("#playPlay").hide();
                $("#playPause").show();
            } else {
                R.player.togglePause();
            }
        }

    } else {
        var oldSong = curSong;
        curSong = song;
        songChanged(oldSong);
        var id = song.id;//getRdioID(curSong);
        if (id == null) {
            playNextSong();
        } else {

            if (R.player.playState() === R.player.PLAYSTATE_PLAYING) {
                R.player.togglePause();
            }

            if (oldSong){
                if (oldSong.playing){
                    stopSoundManagerSong(oldSong);
                }
            }

            //if we have a ws id, use the alternate player -- soundManager2 sound
            //its playlist will be re-rendered after selecting or uploading items -- do this in createShowTable
            //use the ids to check current index of playlist -- if next song
            //is not ws uploaded, trigger playnext for rdio player
            //use the index to add selected class to playlist item, then trigger play on html player
            //if next item is ws uploaded, etc
            if (id.slice(0, 2) == 'ws') {
                var mySound = soundManager.createSound({
                    id: id,
                    url: song.track.track_url,
                    onfinish: function(){
                        this.destruct();
                        playNextSong();
                        $("#playPlay").show();
                        $("#playPause").hide();

                    }
                });
                mySound.play();
                song.soundManagerId = id;
                song.playing = true;
                $("#playPlay").hide();
                $("#playPause").show();

                updateNowPlaying(song);
            } else {
                if (oldSong) {
                    if (oldSong.playing) {
                        stopSoundManagerSong(oldSong);
                    }
                }

                R.player.play({source: id});
                updateNowPlaying(song);
            }
        }
    }
}

function stopSoundManagerSong(song){

    if (song.playing) {
        var s = soundManager.getSoundById(song.soundManagerId)
        if (s) {
            s.stop();
            s.unload();
            s.destruct();

        }
        delete song.playing;

    }
}

function songChanged(song) {
    if (song) {
        //if (song.playing) {
        //    var s = soundManager.getSoundById(song.soundManagerId)
        //    s.stop();
        //    s.unload();
        //    s.destruct();
        //    delete song.playing;
        //}
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

function addUploadedTrackToPerformanceAndShow(performanceId, track, artistId) {
    var evt = getPerformance(performanceId, artistId);
    track.id = track._id;
    track.foreign_id = track.id;
    //evt.trackList.push(track);
    if (artistData) {
        artistData.forEach(function(obj, num) {
            if (obj.event_id == performanceId) {
                if (!obj.event) {
                    obj.event =  jQuery.extend({},evt); //if you don't clone the perf you'll get events nested into infinity
                    if (!obj.event.trackList){
                        obj.event.trackList = [];
                    }
                }
                obj.event.trackList.push(track);
            }
        });
    }

    if (savedSongs) {

        savedSongs.push({
            'track': track,
            'event': evt,
            'id': track._id
        })
    }

    if (savedShow) {

        if (savedShow.unlinkedSongs) {
            savedShow.unlinkedSongs = savedSongs;
        } else {
            savedShow = {
                'unlinkedSongs': savedSongs,
                '_id': '',
                'tag': ''
            };
        }
     }
}


function getPerformance(performanceId, artistId) {
    var perf = {};
    //artistData is fetched from songKick
    //check if it is undefined or not -- if it is, get performance and track data
    //from persisted unlinkedCurrentSongs
    if (artistData) {
        artistData.forEach(function(obj, num) {
            if (obj.event_id == performanceId && obj.artist_id == artistId) {
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


    //if (unsavedSongs) {
    //    if (obj.event.event_id == performanceId) {
    //        perf = obj.event;
    //
    //    }
    //}
    return perf;


}

function getTrackDataForPerformance(perf, trackId) {
    //var perf = getPerformance(eventId);
    var trackData = {};
    if (perf.trackList) {
        perf.trackList.forEach(function (obj, num) {
            if (obj.foreign_id == trackId) {
                trackData = obj;

            }
        });
    }

    //if we haven't found trackdata, check the savedSongs array
    if (!trackData.foreign_id) {
        if (savedSongs.length > 0) {
            savedSongs.forEach(function(obj, num){
                if (obj.track){
                    if (obj.track.foreign_id == trackId) {
                        trackData = obj.track;
                    }
                }
            })
        }
    }

    return trackData;
}

function createSongTable() {
    currentSongs = [{}];
    var rowNum = 1;
    
    //get the trackids from jquery
    var trackList = $('#songContainer li').map(function() {
        var id = $(this).data("track_id");
        var eventId = $(this).data('event_id');
        var artistId = $(this).data('artist_id')
        //b/c we are now getting supporting artists, pass in the artist id
        //TODO: add artist_id data attribute to list templates
        var performance = getPerformance(eventId, artistId);
        var songToPlay = {};

        $("this").contextMenu({
            menuSelector: "#contextMenu",
            menuSelected: function (invokedOn, selectedMenu) {
                var msg = "You selected the menu item '" + selectedMenu.text() +
                    "' on the value '" + invokedOn.text() + "'";
                alert(msg);
            }
        });

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
                    'event': performance,
                    'song': getTrackDataForPerformance(performance, id)};
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
        var artistId = $(this).data('artist_id')
        var performance = getPerformance(eventId, artistId);
        var songToPlay = {};
        //if (id != 'none' && $(this).hasClass('track-playable')) {
        if (id && $(this).hasClass('track-playable')) {
            if (id != 'none') {
                $(this).off('click');
                $(this).on('click', function() {
                    songsToPlay = currentShow;
                    $('#songContainer').removeClass('playlist-active');
                    $('#showContainer').addClass('playlist-active');
                    songToPlay = getSong(id);
                    playSong(songToPlay);
                });

                $(this).attr('id', 's' + rowNum);
                rowNum++;
                return {'track_id': id,
                    'event': jQuery.extend({}, performance),
                    'song': getTrackDataForPerformance(performance, id)};
            }

        }
    }).get();

    showTrackList.forEach(function(obj, num) {
        var song = {};
        //arg -- for some reason events get nested when starting with blank playlist and uploading
        //this is a hack
        if (obj.event.event) {
            delete obj.event.event;
        };
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
        //filter one last time, the mapping is funky for some reason after updating the
        //markup dynamically -- may have to do with sortable, but there's some phantom list items
        //showing up when doing just a get on the li inside showList
        //TODO: don't need this after changing the callback on the sort
        if (!showTrackList[song.id]) {
            //debugger;
            showTrackList[song.id] = 1;
        } else {
            showTrackList[song.id] += showTrackList[song.id] ;
        }
        song.rowId = 's' + (num + 1);
        currentShow.push(song);
        unlinkedCurrentSongs.push(unlinkedSong);

    })
}
function thumbError(image) {
    image.onerror = "";
    image.src = "../images/woodshedW";
    return true;
}

function updateNowPlaying(song) {
    var event = song.event;
    var thumb_uri = event.thumbnail_uri;

    $('#artist-thumbnail').attr('src', thumb_uri);
    $('#artist-name').text(song.track.artist_name);
    $('#track-name').text(song.track.title);
    $('#performance-link').attr('href', event.event_uri);
    $('#performance-link').text(event.displayName);
    $('li').removeClass('track-playing');
    $('#' + song.rowId).addClass('track-playing');
    console.log(event);
    updateUpload(song);
    songLoaded = true;
}

function updateNowPlayingFromEvent(id, artistId) {
    var event = getPerformance(id, artistId);
    var thumb_uri = event.thumbnail_uri;

    $('#artist-thumbnail').attr('src', thumb_uri);
    $('#artist-name').text(event.artist_name);
    $('#track-name').text('select a track');
    $('#performance-link').attr('href', event.event_uri);
    $('#performance-link').text(event.displayName);
    //$('li').removeClass('track-playing');
    //$('#' + song.rowId).addClass('track-playing');
    //console.log(event);
    updateUploadFromEvent(event);
    songLoaded = true;
}

function updateUpload(song) {
    var event = song.event;
    $('#artist-thumbnail-upload').attr('src', event.thumbnail_uri);
    $('#artist-name-upload').text(song.track.artist_name);
    $('#track-name-upload').val(song.track.title);
    $('#performance-link-upload').attr('href', event.event_uri);
    $('#performance-link-upload').text(event.displayName);

    uploadedSongData.artist_id = song.track.artist_id;
    uploadedSongData.artist_name = song.track.artist_name;
    uploadedSongData.event_id = event.event_id;
}

function updateUploadFromEvent(event) {
    $('#artist-thumbnail-upload').attr('src', event.thumbnail_uri);
    $('#artist-name-upload').text(event.artist_name);
    //$('#track-name-upload').text(song.track.title);
    $('#performance-link-upload').attr('href', event.event_uri);
    $('#performance-link-upload').text(event.displayName);

    uploadedSongData.artist_id = event.artist_id;
    uploadedSongData.artist_name = event.artist_name;
    uploadedSongData.event_id = event.event_id;
}

function updateUploadFromAddedShow(payload) {
    $('#artist-thumbnail-upload').attr('src', payload.artist_url);
    $('#artist-name-upload').text(payload.artist_name);
    //$('#track-name-upload').text(song.track.title);
    $('#performance-link-upload').attr('href', payload.venue_url);
    $('#performance-link-upload').text(payload.event_details);

    uploadedSongData.artist_id = payload.artist_id;
    uploadedSongData.artist_name = payload.artist_name;
    uploadedSongData.event_id = payload.event_id;

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

    if (unlinkedCurrentSongs.length == 0 ){
        asyncAlert('Publish Playlist', "You don't have anything ready to publish.<br/><br/>You have to add at least one song to the playlist.");
        return;
    }
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

    if (savedShow._id) {
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

    //if configured, strip out non-uploaded songs from clone of savedShow
    var showToUpload =  removeNonUploadedSongs(jQuery.extend({}, savedShow)) ;


    $.ajax({
          type: 'POST',
          url: '/api/playlist/publish/streamPlaylist',
          data: JSON.stringify(showToUpload),
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


function addShow(showDetails) {
    var l = Ladda.create($('#submit-show').get()[0]);
    l.start();

    $.ajax({
        type: 'POST',
        url: '/api/addshow/wsArtist/wsVenue/wsPerformance',
        data: JSON.stringify(showDetails),
        success: success,
        error: error,
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });

    function success(data) {
        l.stop();
        //proceed to the track upload
        if (data.success) {
            updateUploadFromAddedShow(showDetails);
            $('#modal-upload').modal('show');
        }
    }

    function error(xhr, result, error) {
        console.log(error);
        l.stop();
    }
}

function mergePlaylist(playList) {
    if (!$('#merged-playlist-name').val()) {
        //resetting focus in this context likes a separate thread
        setTimeout(function(){
            $('#merged-playlist-name').focus();
        }, 0);
        return;
    }

    var l = Ladda.create($('#save-merged-playlist').get()[0]);
    l.start();

    console.log(playList)

    var verb = 'POST';

    var payload = {
        _id: moment(Date.now()).unix(),
        tag: $('#merged-playlist-name').val(),
        id_list: playList
    }

    $.ajax({
        type: verb,
        url: '/api/playlist/merge/playlist',
        data: JSON.stringify(payload),
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

function removeStaleShowListings() {
    if (savedShow.length == 0 ||  currentShowDirty) {
        asyncAlert('Remove Stale Listings', "You've got to have a saved show loaded to remove stale listings.  <br/><br/>Load a saved show, or save the show you're working on.")
        return;
    }

    var tempShow = jQuery.extend({}, savedShow);
    var songArr = [];
    var nowDateOnly = moment().clone().startOf('day').unix();


    savedShow.unlinkedSongs.forEach(function(obj, num) {
        if (obj.event.event_date >= nowDateOnly) {
            songArr.push(obj)
        }
    })

    unlinkedCurrentSongs.length = 0;
    currentShow.length=0;
    savedShow = tempShow;
    savedShow.unlinkedSongs = songArr;
    savedSongs.length = 0;
    savedSongs=tempShow.unlinkedSongs;
    var markup = window.showList(savedShow);
    $('#showContainer').empty().html(markup);
    createShowTable();
    initSortable();
    currentShowDirty = true;

}

function removeNonUploadedSongs(showToPublish) {

    var songArr = [];


    showToPublish.unlinkedSongs.forEach(function(obj, num) {
        if (obj.track.track_url) {
            if (obj.track.track_url.length > 0){
                songArr.push(obj)
            }
        }
    })

    showToPublish.unlinkedSongs = songArr;

    return showToPublish;

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
        $('.song-title').on('click', function(){
            updateNowPlayingFromEvent($(this).data('event_id'), $(this).data('artist_id'));
        })
        laddaSpinner.stop();
        //laddaSpinner.destroy();
        laddaSpinner = null;
    }

    function error(xhr, result, error) {
        console.log(error);
        l.stop();
    }
}

function getPlaylists(fromMergePopup) {
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
        if (fromMergePopup){
            $('#saved-merge-playlists').html(markup);

        } else {
            $('#saved-list').html(markup);
            $('#saved-list').off('click', 'li');
            $('#saved-list').on('click', 'li', function(){
                //alert($(this).data('saved-id'));
                loadSavedShow($(this).data('saved-id'));
            });

        }

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

function clearCurrentShow() {
    if (!currentShowDirty) {
        //clear the list
        startNewPlaylist();
    } else {
        asyncConfirmYesNo('Load Saved Show', 'Before starting another playlist, do you want to save changes to the playlist you have been working on?  Click <b>Save.</b><br/><br/><b>Or: </b> just clear the current list and start a new one?  Click <b>new.</b>', 'Save', 'New', triggerSaveShow, startNewPlaylist);
    }
}

function startNewPlaylist() {
    $('.showList').empty();
    currentShowDirty = false;
    //savedShow.length = 0;
    savedSongs.length = 0;
    unlinkedCurrentSongs.length = 0;
    currentShow.length = 0;
    savedShow = {};
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
        currentShow.length=0;
        //savedShow.length = 0;
        savedShow = data.savedShow;
        savedSongs=data.savedShow.unlinkedSongs;
        var markup = window.showList(data.savedShow);
        $('#showContainer').empty().html(markup);
        $('#playlist-name').val(data.savedShow.tag);
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


function showLogin() {
    if (!adminAuthenticated){
        $('#modal-login').modal('show');
        return true;
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

function asyncAlert(title, msg) {
    var $confirm = $("#modalConfirmYesNo");
    $confirm.modal('show');
    $("#lblTitleConfirmYesNo").html(title);
    $("#lblMsgConfirmYesNo").html(msg);
    $('#btnNoConfirmYesNo').hide();
    $('#btnYesConfirmYesNo').text('OK');
    $("#btnYesConfirmYesNo").off('click').click(function () {
        $confirm.modal("hide");
    });
}


