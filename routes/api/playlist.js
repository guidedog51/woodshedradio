var router = require('express').Router();
//var app = require('../app.js');
//console.log(app);

var mongoskin = require('mongoskin'),
    //mongo = require('mongo'),
  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@127.0.0.1:27017/playlist',
  db = mongoskin.db(dbUrl, {safe: true}),
  collections = {
    //artistData: db.collection('artistData'),
    //tracks: db.collection('tracks'),
    playlist: db.collection('playlist')
  };

var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var moment = require('moment');

/* GET playlists. */
router.get('/all/:collectionName', function(req, res) {
    //var col = db.collection(req.params.collectionName);
    var arr = [];
    mongoClient.connect(dbUrl, function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.find({'tag':{$exists: true}}, {unlinkedSongs: 0}).toArray(function(err, result){
            if (err) return next(err);
            console.log(result)
            result.map(function(obj, num){
                arr.push({id: obj._id,
                        tag: obj.tag,
                        dateTime: moment.unix(obj._id).format("MM/DD/YYYY:hh:mm:ss")})
            })

            res.send({"idList": arr});
            mdb.close();
        });
    });

});


/* GET playlist by id */
router.get('/:collectionName/:id', function(req, res) {

    var arr = [];
    mongoClient.connect(dbUrl, function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.find({'_id': Number(req.params.id)}).toArray(function(err, result){
            if (err) return next(err);
            console.log(result)
            result.map(function(obj, num){
                arr.push({id: obj._id,
                    tag: obj.tag,
                    unlinkedSongs: obj.unlinkedSongs})
            })

            res.send({"savedShow": arr});
            mdb.close();
        });
    });
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

