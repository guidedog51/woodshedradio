function songList(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    ;var locals_for_with = (locals || {});(function (artistTracks, item) {
        buf.push("<ul>");
// iterate artistTracks
        ;(function(){
            var $$obj = artistTracks;
            if ('number' == typeof $$obj.length) {

                if ($$obj.length) {
                    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                        var val = $$obj[$index];

                        buf.push("<li" + (jade.attr("data-event_uri", val.event_uri, true, false)) + (jade.attr("data-event_id", val.event_id, true, false)) + " class=\"song-title\">" + (null == (jade_interp = val.displayName) ? "" : jade_interp) + "<!--a(href=val.event_uri, target='_blank')!=val.displayName--></li><ul class=\"trackList\">");
// iterate val.trackList
                        ;(function(){
                            var $$obj = val.trackList;
                            if ('number' == typeof $$obj.length) {

                                if ($$obj.length) {
                                    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                                        var item = $$obj[$index];

                                        buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
                                    }

                                } else {
                                    buf.push("<li class=\"tracklist\">no tracks!</li>");
                                }
                            } else {
                                var $$l = 0;
                                for (var $index in $$obj) {
                                    $$l++;      var item = $$obj[$index];

                                    buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
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

                    buf.push("<li" + (jade.attr("data-event_uri", val.event_uri, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + " class=\"song-title\">" + (null == (jade_interp = val.displayName) ? "" : jade_interp) + "<!--a(href=val.event_uri, target='_blank')!=val.displayName--></li><ul class=\"trackList\">");
// iterate val.trackList
                    ;(function(){
                        var $$obj = val.trackList;
                        if ('number' == typeof $$obj.length) {

                            if ($$obj.length) {
                                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                                    var item = $$obj[$index];

                                    buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
                                }

                            } else {
                                buf.push("<li class=\"tracklist\">no tracks!</li>");
                            }
                        } else {
                            var $$l = 0;
                            for (var $index in $$obj) {
                                $$l++;      var item = $$obj[$index];

                                buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-track_url", item.track_url, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
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

        buf.push("</ul>");}.call(this,"artistTracks" in locals_for_with?locals_for_with.artistTracks:typeof artistTracks!=="undefined"?artistTracks:undefined,"item" in locals_for_with?locals_for_with.item:typeof item!=="undefined"?item:undefined));;return buf.join("");
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
        buf.push("<ul class=\"showList\">");
// iterate unlinkedSongs
        ;(function(){
            var $$obj = unlinkedSongs;
            if ('number' == typeof $$obj.length) {

                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var val = $$obj[$index];

                    buf.push("<li" + (jade.attr("data-track_id", val.id, true, false)) + (jade.attr("data-track_url", val.track.track_url, true, false)) + (jade.attr("data-event_id", val.event.event_id, true, false)) + " class=\"tracklist track-playable\">" + (jade.escape(null == (jade_interp = val.track.title) ? "" : jade_interp)) + "</li>");
                }

            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;      var val = $$obj[$index];

                    buf.push("<li" + (jade.attr("data-track_id", val.id, true, false)) + (jade.attr("data-track_url", val.track.track_url, true, false)) + (jade.attr("data-event_id", val.event.event_id, true, false)) + " class=\"tracklist track-playable\">" + (jade.escape(null == (jade_interp = val.track.title) ? "" : jade_interp)) + "</li>");
                }

            }
        }).call(this);

        buf.push("</ul>");}.call(this,"unlinkedSongs" in locals_for_with?locals_for_with.unlinkedSongs:typeof unlinkedSongs!=="undefined"?unlinkedSongs:undefined));;return buf.join("");
}