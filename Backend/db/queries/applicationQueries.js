const pool = require('../../db');

// An application is always read with the worker it came from and the job it
// is for - neither side is useful on its own.
const SELECT_APPLICATION = `
    SELECT a.id,
           a.job_id,
           a.worker_id,
           a.cover_message,
           a.proposed_amount,
           a.status,
           a.created_at,
           w.name  AS worker_name,
           p.headline AS worker_headline,
           j.title AS job_title,
           j.status AS job_status,
           j.client_id
      FROM kantowork.applications a
      JOIN kantowork.users w ON w.id = a.worker_id
      LEFT JOIN kantowork.worker_profiles p ON p.user_id = a.worker_id
      JOIN kantowork.jobs j  ON j.id = a.job_id
`;

const findById = (id) => {
    return pool.query(`${SELECT_APPLICATION} WHERE a.id = $1`, [id]);
};

const findByJobAndWorker = (jobId, workerId) => {
    return pool.query(
        `${SELECT_APPLICATION} WHERE a.job_id = $1 AND a.worker_id = $2`,
        [jobId, workerId]
    );
};

// Everyone who applied, for the client deciding. Withdrawn ones are left out:
// a worker who pulled out is not asking to be chosen.
const listByJob = (jobId) => {
    return pool.query(
        `${SELECT_APPLICATION}
          WHERE a.job_id = $1 AND a.status <> 'withdrawn'
          ORDER BY a.created_at`,
        [jobId]
    );
};

// The worker's own list, every status - they want to see the rejections too.
const listByWorker = (workerId) => {
    return pool.query(
        `${SELECT_APPLICATION} WHERE a.worker_id = $1 ORDER BY a.created_at DESC`,
        [workerId]
    );
};

const create = (jobId, workerId, {cover_message, proposed_amount}) => {
    return pool.query(
        `INSERT INTO kantowork.applications (job_id, worker_id, cover_message, proposed_amount)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [jobId, workerId, cover_message, proposed_amount]
    );
};

// Used when a worker applies again to a job they had withdrawn from: the
// UNIQUE (job_id, worker_id) means there is a row to revive rather than add.
const reopen = (id, {cover_message, proposed_amount}) => {
    return pool.query(
        `UPDATE kantowork.applications
            SET status = 'pending', cover_message = $2, proposed_amount = $3, updated_at = now()
          WHERE id = $1`,
        [id, cover_message, proposed_amount]
    );
};

const updateStatus = (id, status) => {
    return pool.query(
        `UPDATE kantowork.applications SET status = $2, updated_at = now() WHERE id = $1`,
        [id, status]
    );
};

/**
 * Choosing a worker. Three statements that only make sense together:
 *
 *   1. this application is accepted,
 *   2. everyone else still waiting is turned down,
 *   3. the job is assigned to that worker and leaves the board.
 *
 * Half of this would be a job with an accepted application still sitting open
 * for more, or workers left waiting on a job that is already taken. The
 * partial unique index on (job_id) WHERE status = 'accepted' is the backstop
 * if two accepts race.
 */
const accept = async (applicationId, jobId, workerId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE kantowork.applications
                SET status = 'accepted', updated_at = now()
              WHERE id = $1`,
            [applicationId]
        );
        await client.query(
            `UPDATE kantowork.applications
                SET status = 'rejected', updated_at = now()
              WHERE job_id = $1 AND id <> $2 AND status = 'pending'`,
            [jobId, applicationId]
        );
        await client.query(
            `UPDATE kantowork.jobs
                SET status = 'assigned', assigned_worker_id = $2, updated_at = now()
              WHERE id = $1`,
            [jobId, workerId]
        );
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Every application that still stands - a withdrawn one is not one. Not
// "pending": a rejected application is still an application the client
// received, and it is still in the list they are shown.
const countForJob = (jobId) => {
    return pool.query(
        `SELECT count(*)::int AS total
           FROM kantowork.applications
          WHERE job_id = $1 AND status <> 'withdrawn'`,
        [jobId]
    );
};

module.exports = {
    findById,
    findByJobAndWorker,
    listByJob,
    listByWorker,
    create,
    reopen,
    updateStatus,
    accept,
    countForJob
};
