const {body} = require('express-validator');
const {SIGNUP_ROLES} = require('../config/roles');

const signupValidator  = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters'),
    // An allowlist, not a free string: 'admin' is not in SIGNUP_ROLES, so it
    // is rejected here before it can ever reach the database.
    body('role').isIn(SIGNUP_ROLES).withMessage('Choose whether you are hiring or looking for work')
];

const loginValidator = [
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidator = [
    body('email').isEmail().withMessage('Must be a valid email address')
];

const resetPasswordValidator = [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters')
];

module.exports = {
    signupValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
}
