var express = require('express');
var app = express();

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var request = require('request');

var routes = require('./routes/index');
var users = require('./routes/users');
var comingsoon = require('./routes/comingsoon');
var api = require('./routes/playlist');

//mongoskin
//var mongoskin = require('mongoskin'),
//  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@127.0.0.1:27017/playlist',
//  db = mongoskin.db(dbUrl, {safe: true}),
//  collections = {
//    //artistData: db.collection('artistData'),
//    //tracks: db.collection('tracks'),
//    playlist: db.collection('playlist')
//  };
//
////console.log(collections);
//
//db.collection('playlist').find(function(error, item) {
//    console.log('findOne:' + item);
//})

var SOUNDKICK_API_KEY = 'xdy5yMc0BaLlDZ0V';
var SOUNDKICK_ENDPOINT = 'http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json?apikey=' + SOUNDKICK_API_KEY;
var SOUNDKICK_STATIC_ENDPOINT = 'http://images.sk-static.com/images/media/';
var ECHONEST_API_KEY= 'M8TCQASXDTEGU9VRO';
var ECHONEST_ENDPOINT = 'http://developer.echonest.com/api/v4/song/search?api_key=' + ECHONEST_API_KEY;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.set('request', request);
app.set('SOUNDKICK_ENDPOINT', SOUNDKICK_ENDPOINT);
app.set('ECHONEST_ENDPOINT', ECHONEST_ENDPOINT);
app.set('SOUNDKICK_STATIC_ENDPOINT', SOUNDKICK_STATIC_ENDPOINT);

app.use(favicon(__dirname + '/public/favicon.ico'));
console.log(__dirname);
//app.use(favicon('http://woodshed.cloudapp.net/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.param('collectionName', function(req, res, next, collectionName){
//  req.collection = db.collection(collectionName)
//  return next()
//})
//
app.use('/', routes);
app.use('/users', users);
app.use('/comingsoon', comingsoon);
app.use('/api/playlist', api);
//app.use('/api/playlist/:id', api);

//app.use(function(req, res, next) {
// //if (!collections.playlist || ! collections.playlist) return next(new Error("No collections."))
//  req.collections = collections;
//  next();
//});

app.use('/api/playlist', api);
//app.use('/api/playlist/:id', api);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

