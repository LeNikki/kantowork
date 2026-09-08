var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;
