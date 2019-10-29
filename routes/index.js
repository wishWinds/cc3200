var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require("fs");
var semver = require('semver');

var binAddressBase = "http://cc3200.fancyjohn.com/dev_bin/"

var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/* GET home page. */
router.get('/', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    res.sendFile(path.join(__dirname + '/../index.html'))
});



var configs = fs.readFileSync(path.join(__dirname + "/../configs.json"));
configs = JSON.parse(configs);

router.post('/remove', function(req, res, next) {
    var dir = path.join(__dirname + "/../uploadFilesTest");
    deleteFolderRecursive(dir);
    fs.mkdirSync(dir);

    res.send("clear success");
})

router.get('/config', function(req, res, next) {
    var pre = fs.readFileSync(path.join(__dirname + "/../preference.json"));
    pre = JSON.parse(pre);

    var dev_id = req.query.dev_id
    var version = req.query.soft_ver;
    if (dev_id) {
        var data = configs[dev_id]
        if (data) {
            config = data["config"]
            configs[dev_id]["hasFetch"] = true;
            saveConfigs();
            var ret = {
                "dev_id": config["dev_id"],
                "timestamp": Math.floor(Date.now() / 1000),
                "sample_param": {
                    "trigger_mechanism": config["trigger_mechanism"],
                    "trigger_value": parseInt(config["trigger_value"]) ? parseInt(config["trigger_value"]) : 0,
                    "sample_time": parseInt(config["sample_time"]) ? parseInt(config["sample_time"]) : 0,
                    "sample_freq": parseInt(config["sample_freq"]) ? parseInt(config["sample_freq"]) : 0,
                    "sample_intvl": parseInt(config["sample_intvl"]) ? parseInt(config["sample_intvl"]) : 0,
                }
            }
            if (pre.upgrade && shouldUpgrade(version)) {
                ret["sample_param"]["ota"] = { "url": binAddressBase + pre.lastBinName }
            }
            res.json(ret)
            return
        }
    }

    var ret = {
        "dev_id": dev_id,
        "timestamp": Math.floor(Date.now() / 1000),
        "sample_param": {}
    }

    if (pre.upgrade && shouldUpgrade(version)) {
        ret["sample_param"]["ota"] = { "url": binAddressBase + pre.lastBinName }
    }

    res.json(ret)

})

router.post('/config', function(req, res, next) {
    var config = req.body
    configs[config["dev_id"]] = {
        "config": config,
        "hasFetch": false
    }
    saveConfigs();
    res.json({ ret: true })
})

router.get('/upgrade', function(req, res, next) {
    var pre = fs.readFileSync(path.join(__dirname + "/../preference.json"));
    pre = JSON.parse(pre);
    res.json({ "upgrade": pre.upgrade })
})

router.post('/upgrade', function(req, res, next) {
    var pre = fs.readFileSync(path.join(__dirname + "/../preference.json"));
    pre = JSON.parse(pre);
    pre.upgrade = req.body["upgrade"]
    savePreference(pre);
    res.json({ ret: true })
})

router.get('/lastVersion', function(req, res, next) {
    var pre = fs.readFileSync(path.join(__dirname + "/../preference.json"));
    pre = JSON.parse(pre);
    res.json({ latestVersion: getBinNameVersion() })
})

function saveConfigs() {
    fs.writeFileSync(path.join(__dirname + "/../configs.json"), JSON.stringify(configs, null, 2));
}

function savePreference(pre) {
    fs.writeFileSync(path.join(__dirname + "/../preference.json"), JSON.stringify(pre, null, 2));
}

function getBinNameVersion() {
    var pre = fs.readFileSync(path.join(__dirname + "/../preference.json"));
    pre = JSON.parse(pre);
    var binName = pre.lastBinName;
    // var version = binName.slice(binName.indexOf("_V") + 2, binName.indexOf(".bin"));
    var version = binName;
    return version;
}

function shouldUpgrade(currVer) {
    var binVersion = getBinNameVersion();
    // if (semver.gte(binVersion, currVer)) {
    //   return true;
    // } else {
    //   return false;
    // }
    if (binVersion == currVer) {
        return false;
    } else {
        return true;
    }
}

module.exports = router;