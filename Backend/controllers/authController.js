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

        const {name, email, password, role} = req.body;
        const user = await authService.signup(name, email, password, role);

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

const signup

const login = async (req, res, next)=>{
    try{
        const {user, token} = await authService.login(req.body.email, req.body.password );
        res.json({
            user: {id: user.id, name: user.name, email: user.email}, token
        });
    } catch(err){
        next(err);
    }
}

module.exports = {signup, login};
