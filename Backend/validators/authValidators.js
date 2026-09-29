const {body} = require('express-validator'); 
 
const signupValidator  = [

    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters'),
    body('userRole').isIn(['employer', 'freelancer']).withMessage('Role must be employer or freelancer')
];

module.exports = {
    signupValidator
}