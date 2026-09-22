var express = require('express');
var router = express.Router();
var workerController = require('../controllers/workerController');
var requireAuth = require('../middleware/requireAuth');
var requireRole = require('../middleware/requireRole');
var validate = require('../middleware/validate');
var {ROLES} = require('../config/roles');
var {workerProfileValidator, workerSkillsValidator} = require('../validators/profileValidators');
var offeringController = require('../controllers/offeringController');
var {offeringValidator, portfolioValidator} = require('../validators/offeringValidators');

// The directory. Signed in only, like the job board: these are members'
// profiles, not a page for the open web to crawl.
router.get('/', requireAuth, workerController.list);

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

// What the worker offers, priced. The API says "services" because that is the
// word a worker uses for them; the code calls them offerings, to stay clear of
// its own services/ layer.
router.get('/me/services',
    requireAuth, requireRole(ROLES.WORKER),
    offeringController.listServices);

router.post('/me/services',
    requireAuth, requireRole(ROLES.WORKER), offeringValidator, validate,
    offeringController.createService);

router.put('/me/services/:id(\\d+)',
    requireAuth, requireRole(ROLES.WORKER), offeringValidator, validate,
    offeringController.updateService);

router.delete('/me/services/:id(\\d+)',
    requireAuth, requireRole(ROLES.WORKER),
    offeringController.removeService);

// Previous work. A project's pictures arrive and leave with it, as one set.
router.get('/me/portfolio',
    requireAuth, requireRole(ROLES.WORKER),
    offeringController.listProjects);

router.post('/me/portfolio',
    requireAuth, requireRole(ROLES.WORKER), portfolioValidator, validate,
    offeringController.createProject);

router.put('/me/portfolio/:id(\\d+)',
    requireAuth, requireRole(ROLES.WORKER), portfolioValidator, validate,
    offeringController.updateProject);

router.delete('/me/portfolio/:id(\\d+)',
    requireAuth, requireRole(ROLES.WORKER),
    offeringController.removeProject);

// Public, and last: the \d+ keeps it from swallowing /me, which would arrive
// here as the id 'me'.
router.get('/:id(\\d+)', workerController.getPublicProfile);

module.exports = router;
