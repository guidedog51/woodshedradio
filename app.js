var express = require('express');
var multer = require('multer');
app = express();
var session = require('express-session');
//app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var http = require('http');
var request = require('request');

var routes = require('./routes/index');
var users = require('./routes/users');
var comingsoon = require('./routes/comingsoon');
var showeditor = require('./routes/showeditor');
var radioplayer = require('./routes/radioplayer');
var login = require('./routes/login');
var playlistapi = require('./routes/api/playlist');
var showlistapi = require('./routes/api/showlist');
var uploadapi = require('./routes/api/upload');
var addshowapi = require('./routes/api/addshow');
//var jade_browser = require('jade-browser');
var jade = require('jade');
var fs = require('fs');
var config = require('./config');
var done = false;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', config.port); //process.env.PORT || 3000);
app.set('request', request);
app.set('SOUNDKICK_ENDPOINT', config.soundkick_endpoint);
app.set('ECHONEST_ENDPOINT', config.echonest_endpoint);
app.set('SOUNDKICK_STATIC_ENDPOINT', config.soundkick_static_endpoint);

//mongo config
app.set('dbUrl', config.dbUrl);
app.set('blob_base_url', config.blob_base_url);
app.set('woodshed_library', config.woodshed_library);
app.set('stream_collection', config.stream_collection);


app.use(favicon(__dirname + '/public/favicon.ico'));
console.log(__dirname);
//app.use(favicon('http://woodshed.cloudapp.net/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(cookieParser('c2da2f90-a7fe-441f-a3e9-982c250947d0'));
app.use(session('e45a0035-1478-40d8-9e6e-dfa24164afd6'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/calendar', routes);
app.use('/users', users);
app.use('/comingsoon', comingsoon);
app.use('/showeditor', showeditor);
app.use('/radioplayer', radioplayer);
app.use('/', radioplayer);
app.use('/login', login);
app.use('/api/playlist', playlistapi);
app.use('/api/showlist', showlistapi);
app.use('/api/upload', uploadapi);
app.use('/api/addshow', addshowapi);

//auth stuff
app.use(function(req, res, next) {
    if (req.session && req.session.admin){
        res.locals.admin = true;
    }
})


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


//TODO: set up proper grunt compiler for these templates
var jsFunctionString = jade.compileFileClient('./views/songlist.jade', {name: "songList"});
fs.writeFileSync("./public/scripts/templates1.js", jsFunctionString);
var jsFunctionString2 = jade.compileFileClient('./views/savedlist.jade', {'name': "savedList"});
fs.writeFileSync("./public/scripts/templates2.js", jsFunctionString2);
var jsFunctionString3 = jade.compileFileClient('./views/showlist.jade', {'name': "showList"});
fs.writeFileSync("./public/scripts/templates3.js", jsFunctionString3);
var jsFunctionString4 = jade.compileFileClient('./views/showlist_item.jade', {'name': "showListItem"});
fs.writeFileSync("./public/scripts/templates4.js", jsFunctionString4);
var jsFunctionString5 = jade.compileFileClient('./views/justplayed_item.jade', {'name': "justPlayedItem"});
fs.writeFileSync("./public/scripts/templates5.js", jsFunctionString5);

//http.createServer(app).listen(app.get('port'), function(){
//  console.log("Express server listening on port " + app.get('port'));
//});

app.listen(app.get('port'),function(){
    console.log("Working on port " + app.get('port'));
});
