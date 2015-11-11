var addshow = require('express').Router();
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var moment = require('moment');


/* POST added show details */

addshow.post('/:collectionNameArtist/:collectionNameVenue', function(req, res) {

    //var arr = [];

    //assemble the payload into performance -- > artist
    //                                      -- > venue
    var payload = req.body;
    //any tracks associated with artist will be handled in the upload api

    //mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
    //    var col = mdb.collection(req.params.collectionNameArtist);
    //
    //
    //
    //    //TODO: research some backend modelling here
    //
    //
    //    col.update({_id: payload._id}, payload, {upsert: true}, function(error, count){
    //
    //        if (error) {
    //            console.log(error);
    //            return next(error);
    //        }
    //
    //    });
    //
    //    var col = mdb.collection(req.params.collectionNameVenue);
    //    col.update({_id: payload._id}, payload, {upsert: true}, function(error, count){
    //
    //        if (error) {
    //            console.log(error);
    //            return next(error);
    //        }
            res.send({'success': true})
    //        mdb.close();
    //
    //    });
    //
    //});

});

module.exports = addshow;

