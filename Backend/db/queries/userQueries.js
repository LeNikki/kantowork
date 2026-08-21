const pool = require('../../db');

const createUser = (name, email, password_hash, role) =>{
    return pool.query(
        `INSERT INTO  kantowork.users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4) RETURNING *
        `,
        [name, email, password_hash, role]
    );
};

const findByEmail = (email) => {
  return pool.query(
    `SELECT * FROM kantowork.users WHERE email = $1`,
    [email]
  );
};

module.exports = {createUser, findByEmail};