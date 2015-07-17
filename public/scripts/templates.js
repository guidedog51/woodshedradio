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

buf.push("<li class=\"song-title\"><a" + (jade.attr("href", val.event_uri, true, false)) + " target=\"_blank\">" + (null == (jade_interp = val.displayName) ? "" : jade_interp) + "</a></li><ul class=\"trackList\">");
// iterate val.trackList
;(function(){
  var $$obj = val.trackList;
  if ('number' == typeof $$obj.length) {

  if ($$obj.length) {
    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
    }

  } else {
buf.push("<li class=\"tracklist\">no tracks!</li>");
  }
  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
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

buf.push("<li class=\"song-title\"><a" + (jade.attr("href", val.event_uri, true, false)) + " target=\"_blank\">" + (null == (jade_interp = val.displayName) ? "" : jade_interp) + "</a></li><ul class=\"trackList\">");
// iterate val.trackList
;(function(){
  var $$obj = val.trackList;
  if ('number' == typeof $$obj.length) {

  if ($$obj.length) {
    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
    }

  } else {
buf.push("<li class=\"tracklist\">no tracks!</li>");
  }
  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<li" + (jade.attr("id", item.row, true, false)) + (jade.attr("data-track_id", item.foreign_id, true, false)) + (jade.attr("data-event_id", item.event_id, true, false)) + (jade.cls([(item.foreign_id === 'none') ? 'tracklist' : 'tracklist track-playable'], [true])) + ">" + (jade.escape(null == (jade_interp = item.title) ? "" : jade_interp)) + "</li>");
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