const {body, validationResult} = require('express-validator');
const authService = require('../services/authService');
const {signToken, EXPIRES_IN} = require('../config/jwt');

const signup = async (req, res, next)=>{
    try{
        await body('name').notEmpty().withMessage('Name is required').run(req);
        await body('email').isEmail().withMessage('Must be a valid email').run(req);
        await body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters').run(req);

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        // `role` is deliberately NOT read from the body - a client must not be
        // able to register itself as an admin.
        const {name, email, password} = req.body;
        const user = await authService.signup(name, email, password);

        res.status(201).json({
            message: 'User created successfully',
            user: user.toPublic(),
            token: signToken(user),
            expiresIn: EXPIRES_IN
        });
    }catch(err){
        if (err.message === 'Email already registered') {
            return res.status(409).json({ error: err.message });
        }
        next(err);
    }
};

const login = async (req, res, next)=>{
    try{
        await body('email').isEmail().withMessage('Must be a valid email').run(req);
        await body('password').notEmpty().withMessage('Password is required').run(req);

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        const user = await authService.login(email, password);

        res.json({
            message: 'Logged in successfully',
            user: user.toPublic(),
            token: signToken(user),
            expiresIn: EXPIRES_IN
        });
    }catch(err){
        if (err.message === 'Invalid email or password') {
            return res.status(401).json({ error: err.message });
        }
        next(err);
    }
};

// The frontend calls this on page load to turn a stored token back into a user.
// Reads the row fresh, so a role change takes effect without waiting for the
// token to expire.
const me = async (req, res, next)=>{
    try{
        const user = await authService.getById(req.user.id);
        res.json({user: user.toPublic()});
    }catch(err){
        if (err.message === 'User not found') {
            return res.status(401).json({error: 'Not authenticated'});
        }
        next(err);
    }
};

// JWTs are stateless - the server cannot revoke one. Logging out means the
// client discards its copy; the token stays valid until it expires.
const logout = (req, res)=>{
    res.status(204).end();
};

module.exports = {signup, login, me, logout};
