const {signupService, loginService} = require('../services/authService');
const {signToken, EXPIRES_IN} = require('../config/jwt');

const signupController = async (req, res, next)=>{
    try{
        const {name, email, password, userRole} = req.body;
        const user = await signupService(name, email, password, userRole);

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

const loginController = async (req, res, next)=>{
    try{
        const user = await loginService(req.body.email, req.body.password);
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
}

module.exports = {signupController, loginController};
