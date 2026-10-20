const crypto = require('crypto');
const bcrypt = require('bcrypt');
const userQueries = require('../db/queries/userQueries');
const { sendMail } = require('../config/mailer');

const SALT_ROUNDS = 10;

// Short-lived on purpose: the link travels over email, which is the least
// trusted channel in the flow, so give it the smallest window that still lets
// someone actually click it.
const RESET_TOKEN_TTL_MINUTES = 60;

// Points at the Next.js app, not the API - the recipient clicks a page, and that
// page posts the token back to us.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 32 random bytes = 64 hex chars = 256 bits of entropy. crypto.randomBytes is
// a CSPRNG, so this is not guessable the way a timestamp or Math.random() would be.
const generateRawToken = () => crypto.randomBytes(32).toString('hex');

// The database stores only this digest, so a dump of the users table cannot be
// replayed as a working reset link. One-way, which is fine: we never need to
// recover the raw token, we only compare digests.
const hashToken = (rawToken) =>
    crypto.createHash('sha256').update(rawToken).digest('hex');

// Ask the database for the token's expiry rather than trusting a timestamp
// carried in the URL - a client-supplied expiry could be edited freely.
const isExpired = (expiresAt) => new Date(expiresAt).getTime() <= Date.now();

const requestPasswordResetService = async (email) => {
    const result = await userQueries.findByEmail(email);

    // No such user: do exactly what we do on success and say nothing. If this
    // 404s while a real address returns 200, the endpoint becomes a way to test
    // whether somebody has an account here.
    if (result.rows.length === 0) return;

    const user = result.rows[0];
    const rawToken = generateRawToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await userQueries.setResetToken(user.id, hashToken(rawToken), expiresAt);

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    await sendMail({
        to: user.email,
        subject: 'Reset your KantoWork password',
        text: [
            `Hi ${user.name},`,
            '',
            'Someone asked to reset the password for your KantoWork account.',
            'Open this link to choose a new one:',
            '',
            resetUrl,
            '',
            `This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes and can only be used once.`,
            'If this was not you, ignore this email and your password stays as it is.',
            '',
            '-- KantoWork'
        ].join('\n')
    });
};

const resetPasswordService = async (rawToken, newPassword) => {
    const result = await userQueries.findByResetTokenHash(hashToken(rawToken));

    // Unknown, already used, or malformed tokens all land here. One generic
    // message for all three so the response cannot be used to probe which is which.
    if (result.rows.length === 0) {
        throw new Error('This reset link is invalid or has already been used');
    }

    const user = result.rows[0];

    if (isExpired(user.reset_expires_at)) {
        // Clear the dead token so it cannot be retried.
        await userQueries.setResetToken(user.id, null, null);
        throw new Error('This reset link has expired. Please request a new one');
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userQueries.updatePasswordAndClearReset(user.id, password_hash);

    return { id: user.id };
};

module.exports = {
    requestPasswordResetService,
    resetPasswordService,
    RESET_TOKEN_TTL_MINUTES
};