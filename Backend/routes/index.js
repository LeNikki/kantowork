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
      'GET  /api/skills',
      'GET  /api/workers/:id',
      'GET  /api/workers/me/profile',
      'PUT  /api/workers/me/profile',
      'PUT  /api/workers/me/skills',
      'GET  /api/clients/me/profile',
      'PUT  /api/clients/me/profile',
    ],
  });
});

module.exports = router;
