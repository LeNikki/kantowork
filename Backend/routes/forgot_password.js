const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidators');
const validateErrors = require('../middleware/validate');
const {
    forgotPasswordController,
    resetPasswordController
} = require('../controllers/forgot_password');

// Both are POST: the first submits an email, the second submits the token from
// the emailed link plus a new password. Neither is GET, so neither can be
// triggered by a link prefetch, a crawler, or an <img> tag.
router.post('/', upload.none(), forgotPasswordValidator, validateErrors, forgotPasswordController);
router.post('/reset', upload.none(), resetPasswordValidator, validateErrors, resetPasswordController);

module.exports = router;