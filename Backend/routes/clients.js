var express = require('express');
var router = express.Router();
var clientController = require('../controllers/clientController');
var requireAuth = require('../middleware/requireAuth');
var requireRole = require('../middleware/requireRole');
var validate = require('../middleware/validate');
var {ROLES} = require('../config/roles');
var {clientProfileValidator} = require('../validators/profileValidators');

router.get('/me/profile',
    requireAuth, requireRole(ROLES.CLIENT),
    clientController.getOwnProfile);

router.put('/me/profile',
    requireAuth, requireRole(ROLES.CLIENT), clientProfileValidator, validate,
    clientController.saveOwnProfile);

module.exports = router;
