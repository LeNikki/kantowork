const {body} = require('express-validator'); 
 
const signupValidator  = [

    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters'),
    body('userRole').isIn(['employer', 'freelancer']).withMessage('Role must be employer or freelancer')
];

const forgotPasswordValidator = [

    body('email').isEmail().withMessage('Must be a valid email address')
];

const resetPasswordValidator = [

    body('token').isLength({min: 32}).withMessage('Reset token is required'),
    // Matches the signup rule so one account cannot move to a weaker password
    // by resetting it. .trim() so an all-spaces password cannot slip through
    // the length check.
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters').trim()
];

module.exports = {
    signupValidator,
    forgotPasswordValidator,
    resetPasswordValidator
}