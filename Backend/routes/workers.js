var express = require('express');
var router = express.Router();
var workerController = require('../controllers/workerController');
var requireAuth = require('../middleware/requireAuth');
var requireRole = require('../middleware/requireRole');
var validate = require('../middleware/validate');
var {ROLES} = require('../config/roles');
var {workerProfileValidator, workerSkillsValidator} = require('../validators/profileValidators');

// A worker's own profile. requireRole keeps a client out: they have a profile
// too, but it is a different shape and lives under /api/clients.
router.get('/me/profile',
    requireAuth, requireRole(ROLES.WORKER),
    workerController.getOwnProfile);

router.put('/me/profile',
    requireAuth, requireRole(ROLES.WORKER), workerProfileValidator, validate,
    workerController.saveOwnProfile);

router.put('/me/skills',
    requireAuth, requireRole(ROLES.WORKER), workerSkillsValidator, validate,
    workerController.saveOwnSkills);

// Public, and last: the \d+ keeps it from swallowing /me, which would arrive
// here as the id 'me'.
router.get('/:id(\\d+)', workerController.getPublicProfile);

module.exports = router;
