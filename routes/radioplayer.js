var express = require('express');
var radioplayer = express.Router();
var request = require('request');

/* GET get the radio player. */
radioplayer.get('/', function(req, res) {
  /*fetch the current active stream*/

  request('http://localhost:3000/api/playlist/current/show/' + req.app.get('stream_collection'), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
      res.render('radioplayer', { title: 'Woodshed Radio',  'currentPlaylist': JSON.parse(body).currentPlaylist});
    }
  })

});

module.exports = radioplayer;
