var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'LiveCode', id:req.query.id });
});

module.exports = router;
