var express = require('express');
var router = express.Router();
var applicationController = require('../controllers/applicationController');
var requireAuth = require('../middleware/requireAuth');
var requireRole = require('../middleware/requireRole');
var validate = require('../middleware/validate');
var {ROLES} = require('../config/roles');
var {applicationDecisionValidator} = require('../validators/applicationValidators');

router.use(requireAuth);

// A worker's own applications. Before /:id, or 'me' arrives as an id.
router.get('/me', requireRole(ROLES.WORKER), applicationController.listMine);

// The client's decision. Which client may decide is settled in the service,
// by way of the job the application is for.
router.patch('/:id(\\d+)',
    requireRole(ROLES.CLIENT), applicationDecisionValidator, validate,
    applicationController.decide);

// The worker's own retreat. Not a DELETE: withdrawing leaves a record, so the
// client can see somebody applied and pulled out.
router.post('/:id(\\d+)/withdraw', requireRole(ROLES.WORKER), applicationController.withdraw);

module.exports = router;
