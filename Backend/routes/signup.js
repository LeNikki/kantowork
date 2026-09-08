var express =  require('express');
const multer = require('multer');
var router = express.Router();
const authController = require('../controllers/authController');
const upload = multer();
const { signupValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');


router.get('/', (req,res)=>{
    res.render('signup', {title: 'Signup', errors: null, old: {}})
});

router.post('/',upload.none(), signupValidator, validate, authController.signupController);

module.exports = router;