/**
 * The closed set of `users.role`, mirroring the CHECK constraint added in
 * 1790055299967_constrain-user-roles. Changing either one means changing both.
 */
const ROLES = {
    WORKER: 'worker',
    CLIENT: 'client',
    ADMIN:  'admin',
};

// What a visitor may choose at signup. ADMIN is absent on purpose: nobody gets
// to hand themselves elevated access by posting a different string.
const SIGNUP_ROLES = [ROLES.WORKER, ROLES.CLIENT];

module.exports = {ROLES, SIGNUP_ROLES};
