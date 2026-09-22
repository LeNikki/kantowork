const {body} = require('express-validator');
const {STATUSES} = require('../config/jobStatus');
const {RATE_UNITS} = require('../config/rateUnits');

// Same reasoning as the profile validators: a blank form field arrives as '',
// which is not a number and not a date.
const emptyToNull = (value) => (value === '' ? null : value);

// Title and description are the posting. Everything else a client may leave
// out, and an empty budget simply means they have not said.
const jobValidator = [
    body('title').isString().trim().notEmpty().withMessage('Give the job a title')
        .isLength({max: 140}).withMessage('Title must be 140 characters or fewer'),
    body('description').isString().trim().notEmpty().withMessage('Describe what needs doing')
        .isLength({max: 8000}).withMessage('Description must be 8000 characters or fewer'),
    body('location').optional({values: 'null'}).isString().trim()
        .isLength({max: 120}).withMessage('Location must be 120 characters or fewer'),
    // The same list a worker's service rate is checked against: a budget and a
    // rate answer the same question, so a client may ask for work priced any
    // way a worker may offer it.
    body('budget_type').optional({values: 'null'}).isIn(RATE_UNITS)
        .withMessage(`Budget type must be one of: ${RATE_UNITS.join(', ')}`),
    body('budget_min').customSanitizer(emptyToNull).optional({values: 'null'})
        .isFloat({min: 0, max: 100000000}).withMessage('Budget must be a positive amount').toFloat(),
    body('budget_max').customSanitizer(emptyToNull).optional({values: 'null'})
        .isFloat({min: 0, max: 100000000}).withMessage('Budget must be a positive amount').toFloat(),
    // The database has the same rule as a CHECK. Catching it here makes it a
    // message about the form rather than a constraint violation.
    body('budget_max').custom((max, {req}) => {
        const min = req.body.budget_min;
        if(max === null || max === '' || min === null || min === undefined || min === '') return true;
        if(Number(max) < Number(min)) throw new Error('The top of the budget cannot be below the bottom');
        return true;
    }),
    body('deadline').customSanitizer(emptyToNull).optional({values: 'null'})
        .isISO8601().withMessage('Deadline must be a date'),
    body('skill_ids').optional({values: 'null'}).isArray({max: 40})
        .withMessage('skill_ids must be an array of skill ids'),
    body('skill_ids.*').isInt({min: 1}).withMessage('Every skill id must be a positive integer').toInt()
];

const jobStatusValidator = [
    body('status').isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`)
];

module.exports = {jobValidator, jobStatusValidator};
