var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
const multer = require('multer');
const upload = multer();
const { signupValidator } = require('../validators/authValidators');
const validateErrors = require('../middleware/validate');

router.post('/signup', upload.none(), signupValidator, validateErrors, authController.signupController);
router.post('/login', upload.none(), authController.loginController);
// router.post('/logout', authController.logout);
// router.get('/me', requireAuth, authController.me);

module.exports = router;
