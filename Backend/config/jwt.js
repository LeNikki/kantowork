const jwt = require('jsonwebtoken');

// Fail loudly at boot rather than signing tokens with `undefined`.
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set - add it to .env');
}

const EXPIRES_IN = '7d';

// Keep the payload small and non-sensitive: it is base64, not encrypted,
// so anyone holding the token can read it.
const signToken = (user) =>
    jwt.sign(
        {id: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: EXPIRES_IN}
    );

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {signToken, verifyToken, EXPIRES_IN};
