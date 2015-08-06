var router = require('express').Router();
var mongoClient = require('mongodb').MongoClient;
var config = require('../config.js');

/* POST login listing. */
router.post('/', function(req, res) {
    //authenticate against db
    mongoClient.connect(config.dbUrl, function(err, mdb) {
        var col = mdb.collection('users');
        col.find({'username': req.body.username, 'password': req.body.password}).toArray(function (err, result) {
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

router.get('/logoff', function(req, res){
    req.session.destroy();
    res.send(JSON.stringify({'success': true}))
});

router.get('/auth', function(req, res){

    res.send(JSON.stringify({auth: req.session.auth == undefined ? false : req.session.auth}));

});

module.exports = router;
