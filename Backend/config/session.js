const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('../db');

// Fail loudly at boot rather than silently signing sessions with `undefined`.
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set - add it to .env');
}

const COOKIE_NAME = 'kantowork.sid';

const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        schemaName: 'kantowork',
        tableName: 'session',
        createTableIfMissing: true,
    }),
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,             // don't rewrite the row when nothing changed
    saveUninitialized: false,  // no session row until someone actually logs in
    cookie: {
        httpOnly: true,        // JavaScript cannot read it
        sameSite: 'lax',       // not sent on cross-site requests
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
        maxAge: 1000 * 60 * 60 * 24 * 7,                // 7 days
    },
});

module.exports = { sessionMiddleware, COOKIE_NAME };
