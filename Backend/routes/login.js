var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/', (req, res) => {
    const { email, password } = req.body;
    
    res.send(`Login attempt for: ${email}`);
});

module.exports = router;