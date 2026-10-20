const {
    requestPasswordResetService,
    resetPasswordService
} = require('../services/forgot_password');

const forgotPasswordController = async (req, res, next) => {
    try {
        await requestPasswordResetService(req.body.email);

        // Always the same message, whether or not the address exists. A
        // different reply for "no such user" would turn this into an account
        // lookup tool for anyone who can send an HTTP request.
        res.json({
            message: 'If an account exists for that email, a reset link is on its way'
        });
    } catch (err) {
        next(err);
    }
};

const resetPasswordController = async (req, res, next) => {
    try {
        await resetPasswordService(req.body.token, req.body.password);

        res.json({ message: 'Password updated. You can now log in' });
    } catch (err) {
        // These are expected outcomes of a bad or stale link, not server faults,
        // so they get a 400 with a readable message rather than a 500.
        if (
            err.message === 'This reset link is invalid or has already been used' ||
            err.message === 'This reset link has expired. Please request a new one'
        ) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
};

module.exports = { forgotPasswordController, resetPasswordController };