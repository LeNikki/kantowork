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
      'GET  /api/workers',
      'GET  /api/workers/:id',
      'GET  /api/workers/me/profile',
      'PUT  /api/workers/me/profile',
      'PUT  /api/workers/me/skills',
      'GET  /api/workers/me/services',
      'POST /api/workers/me/services',
      'PUT  /api/workers/me/services/:id',
      'DELETE /api/workers/me/services/:id',
      'GET  /api/workers/me/portfolio',
      'POST /api/workers/me/portfolio',
      'PUT  /api/workers/me/portfolio/:id',
      'DELETE /api/workers/me/portfolio/:id',
      'GET  /api/clients/me/profile',
      'PUT  /api/clients/me/profile',
      'GET  /api/jobs',
      'POST /api/jobs',
      'GET  /api/jobs/mine',
      'GET  /api/jobs/:id',
      'PUT  /api/jobs/:id',
      'PATCH /api/jobs/:id',
      'DELETE /api/jobs/:id',
      'POST /api/jobs/:id/applications',
      'GET  /api/jobs/:id/applications',
      'GET  /api/applications/me',
      'PATCH /api/applications/:id',
      'POST /api/applications/:id/withdraw',
    ],
  });
});

module.exports = router;
