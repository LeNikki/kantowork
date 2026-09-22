const {body} = require('express-validator');

const emptyToNull = (value) => (value === '' ? null : value);

// Trades quote by the job, the hour, the day, or the square metre. A rate with
// no unit is the job, which the service fills in.
const RATE_UNITS = ['job', 'hour', 'day', 'sqm'];

const offeringValidator = [
    body('title').isString().trim().notEmpty().withMessage('Give the service a name')
        .isLength({max: 140}).withMessage('Name must be 140 characters or fewer'),
    body('description').optional({values: 'null'}).isString().trim()
        .isLength({max: 4000}).withMessage('Description must be 4000 characters or fewer'),
    body('rate').customSanitizer(emptyToNull).optional({values: 'null'})
        .isFloat({min: 0, max: 100000000}).withMessage('The rate must be a positive amount').toFloat(),
    body('rate_unit').optional({values: 'null'}).isIn(RATE_UNITS)
        .withMessage(`Rate unit must be one of: ${RATE_UNITS.join(', ')}`),
    body('position').customSanitizer(emptyToNull).optional({values: 'null'})
        .isInt({min: 0, max: 1000}).withMessage('Position must be a small positive number').toInt()
];

/**
 * A project's pictures arrive with it, as the whole set - the form arranges
 * them, and their order in the array is their order on the page.
 *
 * A URL is required to be http or https. Nothing else can be an image, and it
 * keeps a javascript: or data: string out of an attribute the browser will
 * read back.
 */
const portfolioValidator = [
    body('title').isString().trim().notEmpty().withMessage('Give the project a name')
        .isLength({max: 140}).withMessage('Name must be 140 characters or fewer'),
    body('description').optional({values: 'null'}).isString().trim()
        .isLength({max: 4000}).withMessage('Description must be 4000 characters or fewer'),
    body('completed_on').customSanitizer(emptyToNull).optional({values: 'null'})
        .isISO8601().withMessage('Finished on must be a date'),
    body('position').customSanitizer(emptyToNull).optional({values: 'null'})
        .isInt({min: 0, max: 1000}).withMessage('Position must be a small positive number').toInt(),
    body('images').optional({values: 'null'}).isArray({max: 12})
        .withMessage('A project can have up to 12 pictures'),
    body('images.*.url').isURL({protocols: ['http', 'https'], require_protocol: true})
        .withMessage('Each picture needs a web address starting http:// or https://')
        .isLength({max: 2000}).withMessage('That web address is too long'),
    body('images.*.caption').optional({values: 'null'}).isString().trim()
        .isLength({max: 200}).withMessage('A caption must be 200 characters or fewer')
];

module.exports = {offeringValidator, portfolioValidator, RATE_UNITS};
