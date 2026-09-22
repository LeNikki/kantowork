/**
 * How a price is shaped: by the job, by the hour, by the day, or by the square
 * metre. Trades quote differently, and an amount with no unit says half of
 * what was meant.
 *
 * One list for both sides of the market. A worker's services.rate_unit and a
 * client's jobs.budget_type ask the same question - "per what?" - and while
 * they were two separate lists they drifted: a worker could offer tiling at
 * 800 per square metre that no client was allowed to ask for. Tiling,
 * painting and plastering, the trades that quote by area, were exactly the
 * ones that could not say what they meant.
 *
 * Mirrors the CHECK constraints on both columns, the way config/roles.js
 * mirrors the one on users.role. Changing this list means changing them too.
 */
const RATE_UNITS = ['job', 'hour', 'day', 'sqm'];

// What both columns fall back to. An amount with nothing said about its unit
// is an amount for the whole job, which is the common case and what both
// forms offer first.
const DEFAULT_RATE_UNIT = 'job';

module.exports = {RATE_UNITS, DEFAULT_RATE_UNIT};
