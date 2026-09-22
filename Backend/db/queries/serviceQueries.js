const pool = require('../../db');

const SELECT_SERVICE = `
    SELECT id, worker_id, title, description, rate, rate_unit, position
      FROM kantowork.services
`;

// The worker's own ordering first, then id so the order is stable when two
// share a position.
const listByWorker = (workerId) => {
    return pool.query(
        `${SELECT_SERVICE} WHERE worker_id = $1 ORDER BY position, id`,
        [workerId]
    );
};

const findById = (id) => {
    return pool.query(`${SELECT_SERVICE} WHERE id = $1`, [id]);
};

const create = (workerId, {title, description, rate, rate_unit, position}) => {
    return pool.query(
        `INSERT INTO kantowork.services (worker_id, title, description, rate, rate_unit, position)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [workerId, title, description, rate, rate_unit, position]
    );
};

const update = (id, {title, description, rate, rate_unit, position}) => {
    return pool.query(
        `UPDATE kantowork.services
            SET title = $2, description = $3, rate = $4, rate_unit = $5,
                position = $6, updated_at = now()
          WHERE id = $1`,
        [id, title, description, rate, rate_unit, position]
    );
};

const remove = (id) => {
    return pool.query(`DELETE FROM kantowork.services WHERE id = $1`, [id]);
};

module.exports = {listByWorker, findById, create, update, remove};
