var express = require('express');
var upload = express.Router();
var uploadcomplete = false;
var multer = require('multer');
var storage = require('azure-storage');
var blobService = storage.createBlobService();
var containerName = 'mpc-test-container';


/*POST new track */
upload.post('/', [multer({ dest: './uploads/',

    rename: function (fieldname, filename) {
        return filename+Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        uploadcomplete=true;
    }}),


    function(req, res, next) {
    //console.log(req.params.collectionName);
    //var payload = {'name' : 'naked barbies' };
    //var payload = req.body;
    //console.log(payload);
    console.log('posting file')
    if(uploadcomplete==true){
        console.log(req.files);
        writeToBlobStorage();
        res.end("File uploaded.");
    }


}]);

function writeToBlobStorage(){
    blobService.createContainerIfNotExists(containerName, function(err, result, response) {
        if (err) {
            console.log("Couldn't create container %s", containerName);
            console.error(err);
        } else {
            if (result) {
                console.log('Container %s created', containerName);
            } else {
                console.log('Container %s already exists', containerName);
            }

            // Your code goes here
        }
    });
}

module.exports = upload;

