var express =  require('express');
const multer = require('multer');
var router = express.Router();
const authController = require('../controllers/authController');
const upload = multer();


router.get('/', (req,res)=>{
    res.render('signup', {title: 'Signup', errors: null, old: {}})
});

router.post('/',upload.none(), authController.signup);

module.exports = router;