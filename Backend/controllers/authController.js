const {body, validationResult} = require('express-validator');
const authService = require('../services/authService');
const {COOKIE_NAME} = require('../config/session');

// Issue a brand new session id, then store who the user is.
// Regenerating first means a session id captured before login is useless
// afterwards (session fixation).
const startSession = (req, userId) => {
    return new Promise((resolve, reject) => {
        req.session.regenerate((regenErr) => {
            if (regenErr) return reject(regenErr);
            req.session.userId = userId;
            req.session.save((saveErr) => saveErr ? reject(saveErr) : resolve());
        });
    });
};

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
        await startSession(req, user.id);

        res.status(201).json({
            message: 'User created successfully',
            user: user.toPublic()
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
        await startSession(req, user.id);

        res.json({
            message: 'Logged in successfully',
            user: user.toPublic()
        });
    }catch(err){
        if (err.message === 'Invalid email or password') {
            return res.status(401).json({ error: err.message });
        }
        next(err);
    }
};

// Who am I? The frontend calls this on page load to restore the logged-in state.
const me = async (req, res, next)=>{
    try{
        const user = await authService.getById(req.session.userId);
        res.json({user: user.toPublic()});
    }catch(err){
        // Session points at a user row that no longer exists.
        if (err.message === 'User not found') {
            return req.session.destroy(() => {
                res.clearCookie(COOKIE_NAME);
                res.status(401).json({error: 'Not authenticated'});
            });
        }
        next(err);
    }
};

const logout = (req, res, next)=>{
    if(!req.session){
        return res.status(204).end();
    }
    req.session.destroy((err)=>{
        if(err) return next(err);
        res.clearCookie(COOKIE_NAME);
        res.status(204).end();
    });
};

module.exports = {signup, login, me, logout};
