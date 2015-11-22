var addshow = require('express').Router();
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var moment = require('moment');


/* POST added show details */

addshow.post('/:collectionNameArtist/:collectionNameVenue/:collectionNamePerformance', function(req, res) {

    //assemble the payload into performance -- > artist
    //                                      -- > venue
    var payload = req.body;
    //any tracks associated with artist will be handled in the upload api

        //'displayName': perfDisplayName,
        //'artist_id': perf.artist.id,
        //'artist_name': perf.artist.displayName,
        //'event_id': obj.id,
        //'event_uri': obj.uri,
        //'event_date': moment(obj.start.date).unix(),
        //'thumbnail_uri': options.artist_icon_url.replace('AID', perf.artist.id),

        var artist = {
            _id: payload.artist_id,
            displayName: payload.artist_displayName,
            artist_uri:  payload.artist_page_url,
            thumbnail_uri: payload.artist_thumbnail_url
        }

        var venue = {
            _id: payload.venue_id,
            venue_uri: payload.venue_url,
            venue_name: payload.venue_name,
        }

        //let's store this as well
        var event = {
            _id: payload.event_id,
            displayName: payload.event_details,   //assemble this
            event_date:  moment(payload.event_date).unix(),
            artist: artist,
            venue: venue
        }

    //write our homemade objects to mongo
    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
        var col = mdb.collection(req.params.collectionNameArtist);
        col.update({_id: artist._id}, artist, {upsert: true}, function(error, count){

            if (error) {
                console.log(error);
                return next(error);
            }
        });

        var col = mdb.collection(req.params.collectionNameVenue);
        col.update({_id: venue._id}, venue, {upsert: true}, function(error, count){

            if (error) {
                console.log(error);
                return next(error);
            }

        });

        var col = mdb.collection(req.params.collectionNamePerformance);
        col.update({_id: event._id}, event, {upsert: true}, function(error, count){

            if (error) {
                console.log(error);
                return next(error);
            }
            res.send({'success': true})
            mdb.close();

        });

    });

});

module.exports = addshow;

