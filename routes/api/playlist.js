var router = require('express').Router();
//var app = require('../app.js');
//console.log(app);

var mongoskin = require('mongoskin'),
  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@127.0.0.1:27017/playlist',
  db = mongoskin.db(dbUrl, {safe: true}),
  collections = {
    //artistData: db.collection('artistData'),
    //tracks: db.collection('tracks'),
    playlist: db.collection('playlist')
  };



/* GET playlists. */
router.get('/all/:collectionName', function(req, res) {
    var request = req.app.settings.request;
    result = {'result':'all playlists!'};
    res.send(result);
    console.log('result!');

});


/* GET playlist by id */
router.get('/:collectionName/:id', function(req, res) {
    console.log('one playlist: ' + req.params.id);
        var col = db.collection(req.params.collectionName);    
        col.findById(req.params.id, function(e, result){
            if (e) return next(e);
            res.send(result)
        })
});


/*POST new playlist */
router.post('/:collectionName', function(req, res, next) {
    //console.log(req.params.collectionName);
    //var payload = {'name' : 'naked barbies' };
    var payload = req.body;
    console.log(payload);
    var col = db.collection(req.params.collectionName);
    
    col.insert(payload, {}, function(error, results) {
        if (error) {
            console.log(error);
            return next(error);
        }
        var success = JSON.stringify({'success': true});
        res.send(results ? success : results);
    })
    
    
});
           
/*PUT new playlist */
router.put('/:id', function(req, res) {
    console.log('update playlist: ' + req.data);
    
    //mongo
    
    
    res.send('mongoId');
});

/*DELETE new playlist */
router.delete('/:id', function(req, res) {
    console.log('delete playlist: ' + req.params.id);
});

module.exports = router;

