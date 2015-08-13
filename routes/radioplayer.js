var express = require('express');
var radioplayer = express.Router();

/* GET get the radio player. */
radioplayer.get('/', function(req, res) {
  res.render('radioplayer', { title: 'Woodshed Radio' });
});

module.exports = radioplayer;
