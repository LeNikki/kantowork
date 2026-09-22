/**
 * Mirrors the CHECK constraint on jobs.status, the way config/roles.js mirrors
 * the one on users.role. The order a job may move through them is not here -
 * that is jobService, which is where the reason for each move lives.
 */
const STATUSES = ['open', 'assigned', 'completed', 'cancelled'];

module.exports = {STATUSES};
