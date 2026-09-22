const {body} = require('express-validator');

/**
 * A blank form field arrives as '', which for a text column is simply an empty
 * value. For a number it is not a number at all, so it is turned back into null
 * before the numeric checks run.
 *
 * `optional({values: 'null'})` and not the usual 'falsy': 0 years of experience
 * and a rate of 0 are answers, and 'falsy' would quietly drop both.
 */
const emptyToNull = (value) => (value === '' ? null : value);

const workerProfileValidator = [
    body('headline').optional({values: 'null'}).isString().trim()
        .isLength({max: 120}).withMessage('Headline must be 120 characters or fewer'),
    body('bio').optional({values: 'null'}).isString().trim()
        .isLength({max: 4000}).withMessage('Bio must be 4000 characters or fewer'),
    body('location').optional({values: 'null'}).isString().trim()
        .isLength({max: 120}).withMessage('Location must be 120 characters or fewer'),
    body('years_experience').customSanitizer(emptyToNull).optional({values: 'null'})
        .isInt({min: 0, max: 80}).withMessage('Years of experience must be between 0 and 80').toInt(),
    body('hourly_rate').customSanitizer(emptyToNull).optional({values: 'null'})
        .isFloat({min: 0, max: 1000000}).withMessage('Hourly rate must be a positive amount').toFloat(),
    body('phone').optional({values: 'null'}).isString().trim()
        .isLength({max: 30}).withMessage('Phone must be 30 characters or fewer')
];

const clientProfileValidator = [
    body('company').optional({values: 'null'}).isString().trim()
        .isLength({max: 120}).withMessage('Company must be 120 characters or fewer'),
    body('about').optional({values: 'null'}).isString().trim()
        .isLength({max: 4000}).withMessage('About must be 4000 characters or fewer'),
    body('location').optional({values: 'null'}).isString().trim()
        .isLength({max: 120}).withMessage('Location must be 120 characters or fewer'),
    body('phone').optional({values: 'null'}).isString().trim()
        .isLength({max: 30}).withMessage('Phone must be 30 characters or fewer')
];

// The request states the whole set, so an empty array is valid - it means "I
// have removed all of my skills".
const workerSkillsValidator = [
    body('skill_ids').isArray({max: 40}).withMessage('skill_ids must be an array of skill ids'),
    body('skill_ids.*').isInt({min: 1}).withMessage('Every skill id must be a positive integer').toInt()
];

module.exports = {workerProfileValidator, clientProfileValidator, workerSkillsValidator};
