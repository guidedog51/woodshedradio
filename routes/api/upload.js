var express = require('express');
var upload = express.Router();
var uploadcomplete = false;
var multer = require('multer');
var storage = require('azure-storage');
var mongoClient = require('mongodb').MongoClient;

var blobService = storage.createBlobService();
var containerName = 'mpc-test-container';
var fs = require('fs');
var uploadFilePath, uploadFileName, uploadFileId, originalFileName;
var timestamp;

/*POST new track */
upload.post('/:collectionName', [multer({ dest: './uploads/',

    rename: function (fieldname, filename) {
        timestamp = Date.now();
        uploadFileId = 'ws' + timestamp;
        return filename + timestamp;
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        uploadFilePath = file.path;
        uploadFileName = file.name;
        originalFileName = file.originalname;
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        uploadcomplete=true;
    }}),

    function(req, res, next) {
        console.log('posting file')
        if(uploadcomplete==true){
            console.log(req.files);
            writeToBlobStorage(req, res, function(fileData){
            fs.unlink(uploadFilePath);
                if (fileData == null) {
                    res.send({'success': false, 'fileData': null})
                }   else {
                    res.send({"success": true, 'fileData': fileData});
                }
            });
        }
    }]
);

function writeToBlobStorage(req, res, callback){
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
                        callback({});
                    } else {
                        console.log('File %s uploaded successfully', fileName);

                        //write doc to mongo woodshedlibrary  TODO: change to upsert
                        mongoClient.connect(req.app.get('dbUrl'), function(err, mdb){
                            var col = mdb.collection(req.params.collectionName);
                            var payload = req.body;
                            payload._id = uploadFileId;
                            payload.track_url = req.app.get('blob_base_url') + uploadFileName;
                            payload.title = originalFileName.split('.')[0];
                            payload.artist_id = req.body.artist_id;
                            payload.event_id = req.body.event_id;
                            payload.artist_name = req.body.artist_name;


                            //col.update({_id: uploadFileId}, payload, {upsert: true}, function(error, count){
                            //
                            //    if (error) {
                            //        console.log(error);
                            //        return next(error);
                            //    }
                            //
                            //    mdb.close();
                            //    callback(payload);
                            //
                            //
                            //
                            //
                            //});


                            col.insert(payload, function(error, result){
                                if (error) {
                                    console.log(error);
                                    return next(error);
                                }

                                mdb.close();
                                callback(payload);

                            });
                        });



                    }
                }
            );
        }
    });
}

module.exports = upload;
