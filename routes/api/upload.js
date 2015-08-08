var express = require('express');
var upload = express.Router();
var uploadcomplete = false;
var multer = require('multer');
var storage = require('azure-storage');
var blobService = storage.createBlobService();
var containerName = 'mpc-test-container';
var fs = require('fs');
var uploadFilePath, uploadFileName;

/*POST new track */
upload.post('/', [multer({ dest: './uploads/',

    rename: function (fieldname, filename) {
        return filename+Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        uploadFilePath = file.path;
        uploadFileName = file.name;
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        uploadcomplete=true;
    }}),

    function(req, res, next) {
        console.log('posting file')
        if(uploadcomplete==true){
            console.log(req.files);
            writeToBlobStorage(function(){res.end("File uploaded.");});
              //TODO: use a callback to end the response, as the write to blob storage is async
        }
    }]
);

function writeToBlobStorage(callback){
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
            //write to blob storage
            var fileName = './' + uploadFilePath;   //uploads/favicon (2)1438969432084.ico';
            blobService.createBlockBlobFromLocalFile(
                containerName,
                uploadFileName, //'mpc-test-blob.ico',
                fileName,
                function(error, result, response){
                    if(error){
                        console.log("Couldn't upload file %s", fileName);
                        console.error(error);
                        callback();
                    } else {
                        console.log('File %s uploaded successfully', fileName);
                        callback();
                    }
                }
            );
        }
    });
}

module.exports = upload;

