var express = require('express');
var router = express.Router();

/* GET playlists. */
router.get('/all', function(req, res) {
    var request = req.app.settings.request;
    console.log('all playlists!');
});


/* GET playlist by id */
router.get('/:id', function(req, res) {
    console.log('one playlist: ' + req.params.id);
});


/*POST new playlist */
router.post('/:name', function(req, res) {
    console.log(req);
    //mongo
    
    
    res.send('mongoId: ' + req.params.name);
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