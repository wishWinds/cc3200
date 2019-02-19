var express = require('express');
var router = express.Router();
var path = require('path');

var configs = {}

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname + '/../index.html'))
});

router.get('/config', function (req, res, next) {
  var dev_id = req.query.dev_id
  if (dev_id) {
    var data = configs[dev_id]
    if (data) {
      config = data["config"]
      configs[dev_id]["hasFetch"] = true
      res.json({
        "dev_id": config["dev_id"],
        "timestamp": Math.floor(Date.now() / 1000),
        "sample_param": {
          "trigger_mechanism": config["trigger_mechanism"],
          "trigger_value": parseInt(config["trigger_value"]),
          "sample_time": parseInt(config["sample_time"]),
          "sample_freq": parseInt(config["sample_freq"]),
          "sample_intvl": parseInt(config["sample_intvl"])
        }
      })

      return
    }
  }

  res.json({
    "dev_id": dev_id,
    "timestamp": Math.floor(Date.now() / 1000),
    "sample_param": {
    }
  })

})

router.post('/config', function (req, res, next) {
  var config = req.body
  configs[config["dev_id"]] = {
    "config": config,
    "hasFetch": false
  }
  res.json({ ret: true })
})
module.exports = router;
