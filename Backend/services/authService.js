const bcrypt = require('bcrypt');
const User = require('../models/user');
const userQueries = require('../db/queries/userQueries');

const SALT_ROUNDS = 10;

const signupService = async (name, email, password, role)=>{
    //Before signup, check existing user
    const existingUser = await userQueries.findByEmail(email);
    if(existingUser.rows.length > 0){
        throw new Error('Email already registered');
    }
    //hash password first
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await userQueries.createUser(name, email, password_hash, 'user');

    return User.fromRow(result.rows[0]);
};

const loginService = async(email, password)=>{
    const result = await userQueries.findByEmail(email);
    if(result.rows.length === 0){
        throw new Error('Invalid email or password');
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if(!match){
        throw new Error('Invalid email or password');
    }
    return User.fromRow(user);
}

const getById = async (id)=>{
    const result = await userQueries.findById(id);
    if(result.rows.length === 0){
        throw new Error('User not found');
    }
    return User.fromRow(result.rows[0]);
};

module.exports = {signupService, loginService};
