var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var filePath = path.join(__dirname, '../uploadFiles/' + file.fieldname);
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        var timestamp = Date.now();
        cb(null, timestamp + '-' + Date(timestamp).toLocaleString() + '.txt')
    }
})

var storageTest = multer.diskStorage({
    destination: function (req, file, cb) {
        var filePath = path.join(__dirname, '../uploadFilesTest/' + file.fieldname);
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        var timestamp = Date.now();
        cb(null, timestamp + '-' + Date(timestamp).toLocaleString() + '.txt')
    }
})

var storageBin = multer.diskStorage({
    destination: function (req, file, cb) {
        var filePath = path.join(__dirname, '../public/dev_bin/');
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        var timestamp = Date.now();
        cb(null, file.fieldname);
    }
})


var upload = multer({ storage: storage});
var uploadTest = multer({ storage: storageTest});
var uploadBin = multer({ storage: storageBin});

router.post('/', upload.any(), function (req, res, next) {

    if (req.files.length > 0) {
        res.json({err: 0, message: 'upload success!'})
    }
    else {
        res.json({err: -1, message: 'no csv file'})
    }
});

router.post('/test', uploadTest.any(), function (req, res, next) {

    if (req.files.length > 0) {
        res.json({err: 0, message: 'upload success!'})
    }
    else {
        res.json({err: -1, message: 'no csv file'})
    }
});

router.post('/bin', uploadBin.any(), function (req, res, next) {
    if (req.files.length > 0) {
        var pre = fs.readFileSync(path.join(__dirname + "/../preference.json"));
        pre = JSON.parse(pre);
        pre.lastBinName = req.files[0].fieldname;
        fs.writeFileSync(path.join(__dirname + "/../preference.json"), JSON.stringify(pre, null, 2));


        res.json({err: 0, message: 'upload success!'})
    }
    else {
        res.json({err: -1, message: 'upload failed!'})
    }
})

module.exports = router;
