var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var requireAuth = require('../middleware/requireAuth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
