var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Maskani' });
});

router.get('/health', function(req, res, next) {
  res.send('I am healthy');
});

module.exports = router;
