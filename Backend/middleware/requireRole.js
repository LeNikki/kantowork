/**
 * Gates a route on the caller's role. Sits behind requireAuth, which is what
 * puts `req.user` there:
 *
 *     router.post('/', requireAuth, requireRole(ROLES.CLIENT), ctrl.create)
 *
 * The role comes from the signed token. That is safe here because a role is
 * fixed at signup and never changes - if roles ever become switchable, this
 * has to read the database instead, or an old token keeps the old role until
 * it expires.
 *
 * This answers "may this kind of user do this at all", never "does this row
 * belong to them" - ownership is a per-row question and lives in the services.
 */
const requireRole = (...allowed) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({error: 'Not authenticated'});
    }

    if (!allowed.includes(req.user.role)) {
        return res.status(403).json({error: 'Not allowed for your account type'});
    }

    next();
};

module.exports = requireRole;
