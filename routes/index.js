var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/config', function(req, res, next) {
  res.json({
    "dev_id": req.query.dev_id,
    "timestamp": Math.floor(Date.now() / 1000),
    "sample_param": {
      "trigger_mechanism":"event",
      "trigger_value":200,
      "sample_time":30,
      "sample_freq":200
    }
  })
})

module.exports = router;
