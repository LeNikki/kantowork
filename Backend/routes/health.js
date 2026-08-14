var express = require('express');
var router = express.Router();
var pool = require('../db');

router.get('/health', async function (req, res, next) {
  try {
    var result = await pool.query('SELECT NOW() AS now');
    res.json({
      status: 'ok',
      db: 'connected',
      time: result.rows[0].now,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
