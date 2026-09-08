var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var forgotPasswordController = require('../controllers/forgot_password');
var requireAuth = require('../middleware/requireAuth');
var validate = require('../middleware/validate');
var {
    signupValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/authValidators');

router.post('/signup', signupValidator, validate, authController.signup);
router.post('/login',  loginValidator,  validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

router.post('/forgot-password', forgotPasswordValidator, validate, forgotPasswordController.request);
router.post('/reset-password',  resetPasswordValidator,  validate, forgotPasswordController.reset);

module.exports = router;
