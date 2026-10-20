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

const findById = (id) => {
  return pool.query(
    `SELECT * FROM kantowork.users WHERE id = $1`,
    [id]
  );
};

// Any live reset request replaces the previous one, so an old email that was
// already sitting in someone's inbox stops working the moment they ask again.
// Setting the hash and the expiry together keeps the two from ever disagreeing.
const setResetToken = (id, reset_token_hash, reset_expires_at) => {
  return pool.query(
    `UPDATE kantowork.users
        SET reset_token_hash = $2, reset_expires_at = $3
      WHERE id = $1
      RETURNING *`,
    [id, reset_token_hash, reset_expires_at]
  );
};

const findByResetTokenHash = (reset_token_hash) => {
  return pool.query(
    `SELECT * FROM kantowork.users WHERE reset_token_hash = $1`,
    [reset_token_hash]
  );
};

// Clear the token in the same statement that swaps the password, so a used or
// expired link cannot be replayed. No WHERE on the token: the row is already
// identified by id and the token must be cleared even if it had expired.
const updatePasswordAndClearReset = (id, password_hash) => {
  return pool.query(
    `UPDATE kantowork.users
        SET password_hash = $2, reset_token_hash = NULL, reset_expires_at = NULL
      WHERE id = $1
      RETURNING *`,
    [id, password_hash]
  );
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  setResetToken,
  findByResetTokenHash,
  updatePasswordAndClearReset
};
