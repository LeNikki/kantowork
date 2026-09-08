// Password reset is not implemented yet - the flow still needs a token store
// (hashed token + expiry), an email sender, and a migration for the table.
// The endpoints exist so the routes are wired and documented in one place.

const request = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

const reset = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};

module.exports = {request, reset};
