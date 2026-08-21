const {body, validationResult} = require('express-validator');
const authService = require('../services/authService');

const signup = async (req, res, next)=>{
    try{
        await body('name').notEmpty().withMessage('Name is required').run(req);
        await body('email').isEmail().withMessage('Must be a valid email').run(req);
        await body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters').run(req);

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body;
        const user = await authService.signup(name, email, password);

        res.status(201).json({
            message: 'User created successfully',
            user: {id: user.id, name: user.name, email: user.email, role: user.role}
        });
    }catch(err){
        if (err.message === 'Email already registered') {
            return res.status(409).json({ error: err.message });
        }
        next(err);
    }
};

module.exports = {signup};
