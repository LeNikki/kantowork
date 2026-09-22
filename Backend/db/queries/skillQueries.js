const pool = require('../../db');

// The whole vocabulary. Twenty rows today, so there is nothing to paginate -
// the frontend renders it as a pick list.
const listAll = () => {
    return pool.query(
        `SELECT id, name, category
           FROM kantowork.skills
          ORDER BY category, name`
    );
};

module.exports = {listAll};
