function songList(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    ;var locals_for_with = (locals || {});(function (artistTracks) {
        buf.push("<ul>");
// iterate artistTracks
        ;(function(){
            var $$obj = artistTracks;
            if ('number' == typeof $$obj.length) {

                if ($$obj.length) {
                    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                        var val = $$obj[$index];

                        buf.push("<li" + (jade.attr("data-event_uri", val.event_uri, true, false)) + (jade.attr("data-event_id", val.event_id, true, false)) + (jade.attr("data-artist_id", val.artist_id, true, false)) + " class=\"song-title\">" + (null == (jade_interp = val.displayName) ? "" : jade_interp) + "<!--a(href=val.event_uri, target='_blank')!=val.displayName--></li><ul class=\"trackList\">");
// iterate val.trackList
                        ;(function(){
                            var $$obj = val.trackList;
                            if ('number' == typeof $$obj.length) {

                                if ($$obj.length) {
                                    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                                        var item = $$obj[$index];

                                        var baseClass = item.foreign_id === 'none' ? 'tracklist' : 'tracklist track-playable'
                                        var uploaded = item.track_url ? ' track-uploaded' : ''
                                        baseClass = baseClass + uploaded
                                        buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.attr("data-artist_id", item.artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
                                    }

                                } else {
                                    buf.push("<li class=\"tracklist\">no tracks!</li>");
                                }
                            } else {
                                var $$l = 0;
                                for (var $index in $$obj) {
                                    $$l++;      var item = $$obj[$index];

                                    var baseClass = item.foreign_id === 'none' ? 'tracklist' : 'tracklist track-playable'
                                    var uploaded = item.track_url ? ' track-uploaded' : ''
                                    baseClass = baseClass + uploaded
                                    buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.attr("data-artist_id", item.artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
                                }

                                if ($$l === 0) {
                                    buf.push("<li class=\"tracklist\">no tracks!</li>");
                                }
                            }
                        }).call(this);

                        buf.push("</ul>");
                    }

                } else {
                    buf.push("<li>no artist!</li>");
                }
            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;      var val = $$obj[$index];

                    buf.push("<li" + (jade.attr("data-event_uri", val.event_uri, true, false)) + (jade.attr("data-event_id", val.event_id, true, false)) + (jade.attr("data-artist_id", val.artist_id, true, false)) + " class=\"song-title\">" + (null == (jade_interp = val.displayName) ? "" : jade_interp) + "<!--a(href=val.event_uri, target='_blank')!=val.displayName--></li><ul class=\"trackList\">");
// iterate val.trackList
                    ;(function(){
                        var $$obj = val.trackList;
                        if ('number' == typeof $$obj.length) {

                            if ($$obj.length) {
                                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                                    var item = $$obj[$index];

                                    var baseClass = item.foreign_id === 'none' ? 'tracklist' : 'tracklist track-playable'
                                    var uploaded = item.track_url ? ' track-uploaded' : ''
                                    baseClass = baseClass + uploaded
                                    buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.attr("data-artist_id", item.artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
                                }

                            } else {
                                buf.push("<li class=\"tracklist\">no tracks!</li>");
                            }
                        } else {
                            var $$l = 0;
                            for (var $index in $$obj) {
                                $$l++;      var item = $$obj[$index];

                                var baseClass = item.foreign_id === 'none' ? 'tracklist' : 'tracklist track-playable'
                                var uploaded = item.track_url ? ' track-uploaded' : ''
                                baseClass = baseClass + uploaded
                                buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.attr("data-artist_id", item.artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
                            }

                            if ($$l === 0) {
                                buf.push("<li class=\"tracklist\">no tracks!</li>");
                            }
                        }
                    }).call(this);

                    buf.push("</ul>");
                }

                if ($$l === 0) {
                    buf.push("<li>no artist!</li>");
                }
            }
        }).call(this);

        buf.push("</ul>");}.call(this,"artistTracks" in locals_for_with?locals_for_with.artistTracks:typeof artistTracks!=="undefined"?artistTracks:undefined));;return buf.join("");
}
function savedList(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    ;var locals_for_with = (locals || {});(function (idList) {
// iterate idList
        ;(function(){
            var $$obj = idList;
            if ('number' == typeof $$obj.length) {

                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var val = $$obj[$index];

                    buf.push("<li" + (jade.attr("data-saved-id", val.id, true, false)) + " class=\"saved-title\"><span>" + (jade.escape(null == (jade_interp = val.tag) ? "" : jade_interp)) + "</span><span>  --</span><span>" + (jade.escape(null == (jade_interp = val.dateTime) ? "" : jade_interp)) + "</span></li>");
                }

            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;      var val = $$obj[$index];

                    buf.push("<li" + (jade.attr("data-saved-id", val.id, true, false)) + " class=\"saved-title\"><span>" + (jade.escape(null == (jade_interp = val.tag) ? "" : jade_interp)) + "</span><span>  --</span><span>" + (jade.escape(null == (jade_interp = val.dateTime) ? "" : jade_interp)) + "</span></li>");
                }

            }
        }).call(this);
    }.call(this,"idList" in locals_for_with?locals_for_with.idList:typeof idList!=="undefined"?idList:undefined));;return buf.join("");
}
function showList(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    ;var locals_for_with = (locals || {});(function (unlinkedSongs) {
        buf.push("<ul id=\"saved-show\" class=\"showList\">");
// iterate unlinkedSongs
        ;(function(){
            var $$obj = unlinkedSongs;
            if ('number' == typeof $$obj.length) {

                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var val = $$obj[$index];

                    var baseClass = 'tracklist track-playable'
                    var uploaded = val.track.track_url ? ' track-uploaded' : ''
                    baseClass = baseClass + uploaded
                    buf.push("<li" + (jade.attr("data-track_id", val.id, true, false)) + (jade.attr("data-track_url", val.track.track_url, true, false)) + (jade.attr("data-event_id", val.event.event_id, true, false)) + (jade.attr("data-artist_id", val.event.artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = val.track.title) ? "" : jade_interp)) + "</li>");
                }

            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;      var val = $$obj[$index];

                    var baseClass = 'tracklist track-playable'
                    var uploaded = val.track.track_url ? ' track-uploaded' : ''
                    baseClass = baseClass + uploaded
                    buf.push("<li" + (jade.attr("data-track_id", val.id, true, false)) + (jade.attr("data-track_url", val.track.track_url, true, false)) + (jade.attr("data-event_id", val.event.event_id, true, false)) + (jade.attr("data-artist_id", val.event.artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = val.track.title) ? "" : jade_interp)) + "</li>");
                }

            }
        }).call(this);

        buf.push("</ul>");}.call(this,"unlinkedSongs" in locals_for_with?locals_for_with.unlinkedSongs:typeof unlinkedSongs!=="undefined"?unlinkedSongs:undefined));;return buf.join("");
}
function showListItem(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    ;var locals_for_with = (locals || {});(function (track_url, _id, event_id, artist_id, title) {
        var baseClass = 'tracklist track-playable'
        var uploaded = track_url ? ' track-uploaded' : ''
        baseClass = baseClass + uploaded
        buf.push("<li" + (jade.attr("data-track_id", _id, true, false)) + (jade.attr("data-track_url", track_url, true, false)) + (jade.attr("data-event_id", event_id, true, false)) + (jade.attr("data-artist_id", artist_id, true, false)) + (jade.cls([baseClass], [true])) + ">" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</li>");}.call(this,"track_url" in locals_for_with?locals_for_with.track_url:typeof track_url!=="undefined"?track_url:undefined,"_id" in locals_for_with?locals_for_with._id:typeof _id!=="undefined"?_id:undefined,"event_id" in locals_for_with?locals_for_with.event_id:typeof event_id!=="undefined"?event_id:undefined,"artist_id" in locals_for_with?locals_for_with.artist_id:typeof artist_id!=="undefined"?artist_id:undefined,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
}
function justPlayedItem(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    ;var locals_for_with = (locals || {});(function (event, track, event_uri) {
        var imgSrc = event.thumbnail_uri ? event.thumbnail_uri : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
        buf.push("<li class=\"list-group-item\"><div class=\"image-container\"><img" + (jade.attr("src", imgSrc, true, false)) + " width=\"100px\" height=\"100px\" alt=\"\" class=\"woodshedw img-circle\"/></div><div class=\"track-info-container\"><h4 class=\"list-group-item-heading\">" + (jade.escape(null == (jade_interp = event.artist_name) ? "" : jade_interp)) + "</h4><p class=\"list-group-item-text\">" + (jade.escape(null == (jade_interp = track.title) ? "" : jade_interp)) + "</p><a" + (jade.attr("href", event_uri, true, false)) + " class=\"list-group-item-text\">" + (jade.escape(null == (jade_interp = event.displayName) ? "" : jade_interp)) + "</a></div></li>");}.call(this,"event" in locals_for_with?locals_for_with.event:typeof event!=="undefined"?event:undefined,"track" in locals_for_with?locals_for_with.track:typeof track!=="undefined"?track:undefined,"event_uri" in locals_for_with?locals_for_with.event_uri:typeof event_uri!=="undefined"?event_uri:undefined));;return buf.join("");
}