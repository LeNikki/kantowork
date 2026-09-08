var express = require('express');
var router = express.Router();

/* GET service info. */
router.get('/', function(req, res, next) {
  res.json({
    name: 'kantowork-api',
    endpoints: [
      'GET  /api/health',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET  /api/users',
    ],
  });
});

module.exports = router;
