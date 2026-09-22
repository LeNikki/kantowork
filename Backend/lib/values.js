/**
 * Turning what pg hands back into what the API sends.
 *
 * Both of these were written three times over across the models before they
 * lived here, which is two chances too many for the rules to drift apart.
 */

/**
 * pg returns NUMERIC as a string, to avoid quietly losing precision on values
 * too large for a float. Every amount on this platform - a rate, a budget, a
 * price - is well inside what a number holds, and the alternative is every
 * caller parsing it.
 *
 * null survives as null: it means nobody said, which is not zero.
 */
const toNumber = (value) =>
    (value === null || value === undefined ? null : Number(value));

/**
 * A DATE column comes back as a JS Date at midnight in the server's zone, so
 * its local parts are the date that was stored. Read in UTC it can be the day
 * before. This sends the day itself, as YYYY-MM-DD, with no time to drift.
 */
const toDateString = (value) => {
    if(!value) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

module.exports = {toNumber, toDateString};
