var express = require('express');
var upload = express.Router();
var uploadcomplete = false;
var multer = require('multer');
//var app = express();

//app.use(multer({ dest: './uploads/',
//    rename: function (fieldname, filename) {
//        return filename+Date.now();
//    },
//    onFileUploadStart: function (file) {
//        console.log(file.originalname + ' is starting ...')
//    },
//    onFileUploadComplete: function (file) {
//        console.log(file.fieldname + ' uploaded to  ' + file.path)
//        uploadcomplete=true;
//    }
//}));


//app.use(function(req, res, next){
//    multer({ dest: './uploads/',
//        rename: function (fieldname, filename) {
//            return filename+Date.now();
//        },
//        onFileUploadStart: function (file) {
//            console.log(file.originalname + ' is starting ...')
//        },
//        onFileUploadComplete: function (file) {
//            console.log(file.fieldname + ' uploaded to  ' + file.path)
//            uploadcomplete=true;
//        }
//    })
//})

//upload.use(function(req, res, next){
//    multer({ dest: './uploads/',
//        rename: function (fieldname, filename) {
//            return filename+Date.now();
//        },
//        onFileUploadStart: function (file) {
//            console.log(file.originalname + ' is starting ...')
//        },
//        onFileUploadComplete: function (file) {
//            console.log(file.fieldname + ' uploaded to  ' + file.path);
//            uploadcomplete=true;
//        }
//    });
//    next();
//});

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
        res.end("File uploaded.");
    }


}]);
           

module.exports = upload;

