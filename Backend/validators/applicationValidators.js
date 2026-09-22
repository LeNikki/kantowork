const {body} = require('express-validator');

const emptyToNull = (value) => (value === '' ? null : value);

// Both fields are optional: a worker may simply put their name forward, and
// the profile a client can click through to says the rest.
const applicationValidator = [
    body('cover_message').optional({values: 'null'}).isString().trim()
        .isLength({max: 4000}).withMessage('Message must be 4000 characters or fewer'),
    body('proposed_amount').customSanitizer(emptyToNull).optional({values: 'null'})
        .isFloat({min: 0, max: 100000000}).withMessage('Your price must be a positive amount').toFloat()
];

// Only the two a client can choose. 'withdrawn' is the worker's word and has
// its own endpoint; 'pending' is where an application starts, not somewhere
// to put it back.
const applicationDecisionValidator = [
    body('status').isIn(['accepted', 'rejected'])
        .withMessage('You can accept or reject an application')
];

module.exports = {applicationValidator, applicationDecisionValidator};
