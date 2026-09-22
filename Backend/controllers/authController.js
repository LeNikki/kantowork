const authService = require('../services/authService');
const {signToken, EXPIRES_IN} = require('../config/jwt');

const signup = async (req, res, next)=>{
    try{
        // `role` IS read from the body now - a visitor picks a side when they
        // sign up. It is not free text: signupValidator allows only 'worker'
        // or 'client', so this still cannot register itself as an admin.
        const {name, email, password, role} = req.body;
        const user = await authService.signup(name, email, password, role);

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

// JWTs are stateless - the server cannot revoke one. The client discards it.
const logout = (req, res)=>{
    res.status(204).end();
};

// Password reset is not implemented yet - the flow still needs a token store
// (hashed token + expiry), an email sender, and a migration for the table.
const forgotPassword = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

const resetPassword = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

module.exports = {signup, login, me, logout, forgotPassword, resetPassword};
