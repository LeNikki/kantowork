const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.render('forgot_password', { title: 'Forgot Password' });
});

module.exports = router;