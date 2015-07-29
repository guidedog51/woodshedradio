var router = require('express').Router();
var mongoClient = require('mongodb').MongoClient;

/* GET users listing. */
router.post('/', function(req, res) {
    //authenticate against db
    mongoClient.connect(req.app.get('dbUrl'), function(err, mdb) {
        var col = mdb.collection('users');
        col.find({'username': req.body.username, 'password': req.body.password}).toArray(function (err, result) {
            //console.log(col.find());
            col.find().toArray(function (err, result) {
                if (err) return next(err);
                console.log(result)
                if (result.length > 0) {
                    req.session.auth = true;
                    res.send(JSON.stringify({"auth": true}));
                }
                else {
                    req.session.auth = false;
                    res.send(JSON.stringify({"auth": false}));
                }
                mdb.close();
            });
        });
    });

});

module.exports = router;
