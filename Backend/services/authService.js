const bcrypt = require('bcrypt');
const User = require('../models/user');
const userQueries = require('../db/queries/userQueries');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

const signup = async (name, email, password, role)=>{
    const existingUser = await userQueries.findByEmail(email);
    if(existingUser.rows.length > 0){
        throw new Error('Email already registered');
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await userQueries.createUser(name, email, password_hash, role);

    return User.fromRow(result.rows[0]);
};

const login = async(email, password)=>{
    const result = await userQueries.findByEmail(email);
    const generateToken = (user) =>
        jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

    if(result.rows.length === 0){
        throw new Error('Invalid email or password');
    }
    const user = User.fromRow(result.rows[0]);
    const match = await bcrypt.compare(password, user.password_hash);
    if(!match){
        throw new Error('Invalid email or password');
    }
    return {user, token: generateToken(user)};
}

module.exports = {signup, login};
