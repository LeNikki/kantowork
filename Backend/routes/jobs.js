var express = require('express');
var router = express.Router();
var jobController = require('../controllers/jobController');
var requireAuth = require('../middleware/requireAuth');
var requireRole = require('../middleware/requireRole');
var validate = require('../middleware/validate');
var {ROLES} = require('../config/roles');
var {jobValidator, jobStatusValidator} = require('../validators/jobValidators');
var applicationController = require('../controllers/applicationController');
var {applicationValidator} = require('../validators/applicationValidators');

// Everything here needs an account. A posting carries a client's location and
// what they are willing to pay, which is for members, not for the open web.
router.use(requireAuth);

// The board. Both roles may read it: a client looking at what else is being
// posted is how they work out what to offer.
router.get('/', jobController.list);

// Before /:id, or 'mine' arrives as an id.
router.get('/mine', requireRole(ROLES.CLIENT), jobController.listMine);

router.post('/',
    requireRole(ROLES.CLIENT), jobValidator, validate,
    jobController.create);

router.get('/:id(\\d+)', jobController.get);

// Replaces the posting. Ownership is checked in the service, which is the
// only place that knows whose job it is.
router.put('/:id(\\d+)',
    requireRole(ROLES.CLIENT), jobValidator, validate,
    jobController.update);

// Status only - cancelling, or marking work finished.
router.patch('/:id(\\d+)',
    requireRole(ROLES.CLIENT), jobStatusValidator, validate,
    jobController.changeStatus);

router.delete('/:id(\\d+)', requireRole(ROLES.CLIENT), jobController.remove);

// A worker puts themselves forward for this job.
router.post('/:id(\\d+)/applications',
    requireRole(ROLES.WORKER), applicationValidator, validate,
    applicationController.apply);

// Everyone who did - for the client who posted it, and nobody else.
router.get('/:id(\\d+)/applications',
    requireRole(ROLES.CLIENT),
    applicationController.listForJob);

module.exports = router;
