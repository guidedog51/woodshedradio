var router = require('express').Router();
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var moment = require('moment');


/* GET playlists. */
router.get('/all/:collectionName', function(req, res) {
    //var col = db.collection(req.params.collectionName);
    var arr = [];
    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
    //mongoClient.connect(dbUrl, function(err, mdb){
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
    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.find({'_id': Number(req.params.id)}).toArray(function(err, result){
            if (err) return next(err);
            console.log(result)
            result.map(function(obj, num){
                arr.push({'_id': obj._id,
                    tag: obj.tag,
                    unlinkedSongs: obj.unlinkedSongs})
            })

            res.send({"savedShow": arr});
            mdb.close();
        });
    });
 });



/* GET current playlist by archived=false flag */

router.get('/current/show/:collectionName', function(req, res) {

    var arr = [];
    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.find({'archived': false}).toArray(function(err, result){
            //we only want one
            if (err) return next(err);
            console.log(result)
            result.map(function(obj, num){
                arr.push({'_id': obj._id,
                    tag: obj.tag,
                    unlinkedSongs: obj.unlinkedSongs})
            })

            res.send({'currentPlaylist': arr});
            mdb.close();
        });
    });
});

/*POST new stream playlist */
router.post('/publish/:collectionName', function(req, res, next) {
    //console.log(req.params.collectionName);
    //var payload = {'name' : 'naked barbies' };
    var payload = req.body;
    console.log(payload);

    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionName);

        //set archive flag for all members where archive flag = true
        col.update({}, {$set:{'archived': true}}, {'multi': true}, function(error, result){
            if (error) {
                console.log(error);
                return next(error);
            }

            col.update({_id: payload._id}, payload, {upsert: true}, function(error, count){

                if (error) {
                    console.log(error);
                    return next(error);
                }
                res.send({'success': true})
                mdb.close();

            });
        });
    });
});


/*POST new playlist */
router.post('/:collectionName', function(req, res, next) {
    //console.log(req.params.collectionName);
    //var payload = {'name' : 'naked barbies' };
    var payload = req.body;
    console.log(payload);

    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.insert(payload, function(error, result){
            if (error) {
                console.log(error);
                return next(error);
            }
            res.send({"success": true});
            mdb.close();
        });
    });
});


/*PUT update playlist */
router.put('/:collectionName', function(req, res) {
    var id = req.body._id;
    var tag = req.body.tag;
    var unlinkedSongs = req.body.unlinkedSongs;

    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.update({'_id': id}, {$set:{unlinkedSongs: unlinkedSongs, tag: tag}}, function(error, result){
            if (error) {
                console.log(error);
                return next(error);
            }
            res.send({"success": true});
            mdb.close();
        });
    });
});

/*DELETE new playlist */
router.delete('/:collectionName/:id', function(req, res) {
    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionName);
        col.remove({'_id': Number(req.params.id)}, function(error, result){
            if (error) {
                console.log(error);
                return next(error);
            }
            res.send({"success": true});
            mdb.close();
        });
    });
});


/*POST new merged playlist */
router.post('/merge/:collectionName', function(req, res, next) {
    //console.log(req.params.collectionName);
    //var payload = {'name' : 'naked barbies' };
    var payload = req.body;
    console.log(payload);
    var newPayload = {};
    var mergedULS = [];

    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){

        var col = mdb.collection(req.params.collectionName);
        col.find({_id: {$in: payload.id_list}}).toArray(function(error, result){
            if (error) {
                console.log(error);
                return next(error);
            }

            newPayload.tag = payload.tag;
            newPayload._id = payload._id;

            //map this result array and concatenate the unlinkedSongs, adding tag and _id to array object
            result.map(function(obj, num){
                mergedULS = mergedULS.concat(obj.unlinkedSongs);
            })
            newPayload.unlinkedSongs = mergedULS;

            //add merged PL to collection
            col.update({_id: newPayload._id}, newPayload, {upsert: true}, function(error, count){

                if (error) {
                    console.log(error);
                    return next(error);
                }
                res.send({'success': true})
                mdb.close();

            });
        });
    });
});

module.exports = router;

