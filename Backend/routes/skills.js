var express = require('express');
var router = express.Router();
var skillController = require('../controllers/skillController');

// Open: the signup and profile forms need it, and it is reference data that
// gives nothing away.
router.get('/', skillController.list);

module.exports = router;
