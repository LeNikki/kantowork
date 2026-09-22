const bcrypt = require('bcrypt');
const User = require('../models/user');
const userQueries = require('../db/queries/userQueries');

const SALT_ROUNDS = 10;

const signup = async (name, email, password, role)=>{
    const existingUser = await userQueries.findByEmail(email);
    if(existingUser.rows.length > 0){
        throw new Error('Email already registered');
    }

    // The role arrives already checked against SIGNUP_ROLES by the validator,
    // and the CHECK constraint on the column is the backstop behind that.
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await userQueries.createUser(name, email, password_hash, role);

    return User.fromRow(result.rows[0]);
};

const login = async(email, password)=>{
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

module.exports = {signup, login, getById};
