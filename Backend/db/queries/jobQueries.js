const pool = require('../../db');

/**
 * Every read returns the job with its client's name and its skills already
 * attached. The skills come back from one json_agg rather than a query per
 * job - a board of twenty jobs should be one round trip, not twenty-one.
 *
 * The FILTER is what keeps a job with no skills from ending up with a list
 * containing one null: LEFT JOIN gives it a row of nulls, and json_agg would
 * otherwise faithfully aggregate it.
 */
const SELECT_JOB = `
    SELECT j.id,
           j.client_id,
           u.name AS client_name,
           j.title,
           j.description,
           j.location,
           j.budget_type,
           j.budget_min,
           j.budget_max,
           j.status,
           j.assigned_worker_id,
           j.deadline,
           j.created_at,
           COALESCE(
               json_agg(
                   json_build_object('id', s.id, 'name', s.name, 'category', s.category)
                   ORDER BY s.category, s.name
               ) FILTER (WHERE s.id IS NOT NULL),
               '[]'
           ) AS skills
      FROM kantowork.jobs j
      JOIN kantowork.users u        ON u.id = j.client_id
      LEFT JOIN kantowork.job_skills js ON js.job_id = j.id
      LEFT JOIN kantowork.skills s      ON s.id = js.skill_id
`;

const GROUP_BY = ' GROUP BY j.id, u.name ';

/**
 * The conditions behind the board's filters, built once and used by both the
 * page query and the count so the two can never disagree about what is being
 * counted.
 *
 * Every value goes in as a parameter. The only strings this assembles are the
 * fragments below, which are fixed - nothing a caller sends becomes SQL.
 *
 * The skill tests are EXISTS subqueries rather than conditions on the join
 * above: that join is there to aggregate every skill a job has, and filtering
 * it would leave each job listing only the skills that were searched for.
 */
const buildJobFilters = ({skillIds, location, q, matchSkillIds}) => {
    const conditions = [`j.status = 'open'`];
    const params = [];

    if(skillIds && skillIds.length > 0){
        params.push(skillIds);
        conditions.push(`EXISTS (SELECT 1 FROM kantowork.job_skills f
                                  WHERE f.job_id = j.id AND f.skill_id = ANY($${params.length}::int[]))`);
    }

    // A worker asking for work they can do. Same shape as the filter above,
    // with the list coming from their own skills rather than from the form.
    if(matchSkillIds){
        params.push(matchSkillIds);
        conditions.push(`EXISTS (SELECT 1 FROM kantowork.job_skills m
                                  WHERE m.job_id = j.id AND m.skill_id = ANY($${params.length}::int[]))`);
    }

    if(location){
        params.push(`%${location}%`);
        conditions.push(`j.location ILIKE $${params.length}`);
    }

    if(q){
        params.push(`%${q}%`);
        conditions.push(`(j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`);
    }

    return {where: `WHERE ${conditions.join(' AND ')}`, params};
};

// The board: open jobs, newest first, narrowed by whatever was asked for.
const listOpen = ({limit, offset, ...filters}) => {
    const {where, params} = buildJobFilters(filters);
    return pool.query(
        `${SELECT_JOB} ${where} ${GROUP_BY}
          ORDER BY j.created_at DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
    );
};

// Counted through the same conditions, so "page 1 of 3" is 3 pages of the
// jobs actually being shown.
const countOpen = (filters = {}) => {
    const {where, params} = buildJobFilters(filters);
    return pool.query(
        `SELECT count(*)::int AS total FROM kantowork.jobs j ${where}`,
        params
    );
};

// A client's own jobs, every status - they need to see the cancelled ones too.
const listByClient = (clientId, {limit, offset}) => {
    return pool.query(
        `${SELECT_JOB} WHERE j.client_id = $1 ${GROUP_BY}
          ORDER BY j.created_at DESC
          LIMIT $2 OFFSET $3`,
        [clientId, limit, offset]
    );
};

const countByClient = (clientId) => {
    return pool.query(
        `SELECT count(*)::int AS total FROM kantowork.jobs WHERE client_id = $1`,
        [clientId]
    );
};

const findById = (id) => {
    return pool.query(`${SELECT_JOB} WHERE j.id = $1 ${GROUP_BY}`, [id]);
};

/**
 * A posting and the skills it asks for are one thing, so they are written in
 * one transaction: a job that exists with none of its requirements would be
 * a posting that lies about what it needs.
 */
const createWithSkills = async (clientId, fields, skillIds) => {
    const {title, description, location, budget_type, budget_min, budget_max, deadline} = fields;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO kantowork.jobs
                    (client_id, title, description, location, budget_type, budget_min, budget_max, deadline)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [clientId, title, description, location, budget_type, budget_min, budget_max, deadline]
        );
        const jobId = result.rows[0].id;
        if (skillIds.length > 0) {
            await client.query(
                `INSERT INTO kantowork.job_skills (job_id, skill_id)
                 SELECT $1, unnest($2::int[])`,
                [jobId, skillIds]
            );
        }
        await client.query('COMMIT');
        return jobId;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Same reasoning as the insert: the posting and its requirements change
// together or not at all.
const updateWithSkills = async (id, fields, skillIds) => {
    const {title, description, location, budget_type, budget_min, budget_max, deadline} = fields;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE kantowork.jobs
                SET title       = $2,
                    description = $3,
                    location    = $4,
                    budget_type = $5,
                    budget_min  = $6,
                    budget_max  = $7,
                    deadline    = $8,
                    updated_at  = now()
              WHERE id = $1`,
            [id, title, description, location, budget_type, budget_min, budget_max, deadline]
        );
        await client.query(`DELETE FROM kantowork.job_skills WHERE job_id = $1`, [id]);
        if (skillIds.length > 0) {
            await client.query(
                `INSERT INTO kantowork.job_skills (job_id, skill_id)
                 SELECT $1, unnest($2::int[])`,
                [id, skillIds]
            );
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateStatus = (id, status) => {
    return pool.query(
        `UPDATE kantowork.jobs SET status = $2, updated_at = now() WHERE id = $1`,
        [id, status]
    );
};

const remove = (id) => {
    return pool.query(`DELETE FROM kantowork.jobs WHERE id = $1`, [id]);
};

module.exports = {
    listOpen,
    countOpen,
    listByClient,
    countByClient,
    findById,
    createWithSkills,
    updateWithSkills,
    updateStatus,
    remove
};
