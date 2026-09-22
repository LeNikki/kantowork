const pool = require('../../db');

// A worker who has never saved a profile has no row, so this is a LEFT JOIN
// off users: the reply is the user with empty profile fields, not nothing.
const findProfileByUserId = (userId) => {
    return pool.query(
        `SELECT u.id      AS user_id,
                u.name,
                u.email,
                p.headline,
                p.bio,
                p.location,
                p.years_experience,
                p.hourly_rate,
                p.phone
           FROM kantowork.users u
           LEFT JOIN kantowork.worker_profiles p ON p.user_id = u.id
          WHERE u.id = $1`,
        [userId]
    );
};

/**
 * Creates the row on first save and overwrites it after that. A PUT replaces
 * the whole profile, so a field left out is cleared rather than kept - the
 * column list here is the full set on purpose.
 */
const upsertProfile = (userId, {headline, bio, location, years_experience, hourly_rate, phone}) => {
    return pool.query(
        `INSERT INTO kantowork.worker_profiles
                (user_id, headline, bio, location, years_experience, hourly_rate, phone, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         ON CONFLICT (user_id) DO UPDATE
            SET headline         = EXCLUDED.headline,
                bio              = EXCLUDED.bio,
                location         = EXCLUDED.location,
                years_experience = EXCLUDED.years_experience,
                hourly_rate      = EXCLUDED.hourly_rate,
                phone            = EXCLUDED.phone,
                updated_at       = now()
         RETURNING *`,
        [userId, headline, bio, location, years_experience, hourly_rate, phone]
    );
};

const findSkillsByWorkerId = (workerId) => {
    return pool.query(
        `SELECT s.id, s.name, s.category
           FROM kantowork.worker_skills ws
           JOIN kantowork.skills s ON s.id = ws.skill_id
          WHERE ws.worker_id = $1
          ORDER BY s.category, s.name`,
        [workerId]
    );
};

/**
 * Replaces a worker's skill set wholesale: the request says which skills they
 * have, not which to add.
 *
 * Both statements run on one connection inside a transaction, so a failure
 * half way cannot leave the worker with their skills deleted and none added
 * back. Nothing else in the codebase needs a transaction yet, hence the
 * explicit connect/release here rather than a shared helper.
 */
const replaceSkills = async (workerId, skillIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `DELETE FROM kantowork.worker_skills WHERE worker_id = $1`,
            [workerId]
        );
        if (skillIds.length > 0) {
            // One INSERT for the lot: unnest turns the array into rows.
            await client.query(
                `INSERT INTO kantowork.worker_skills (worker_id, skill_id)
                 SELECT $1, unnest($2::int[])`,
                [workerId, skillIds]
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

// Only ever returns a worker. Asking for a client's id here is a 404, not a
// profile with every field blank.
const findPublicProfileById = (id) => {
    return pool.query(
        `SELECT u.id      AS user_id,
                u.name,
                p.headline,
                p.bio,
                p.location,
                p.years_experience,
                p.hourly_rate
           FROM kantowork.users u
           LEFT JOIN kantowork.worker_profiles p ON p.user_id = u.id
          WHERE u.id = $1 AND u.role = 'worker'`,
        [id]
    );
};

/**
 * The directory: workers, narrowed by whatever a client searched for.
 *
 * Same shape as the job board's filters and the same reasoning - values go in
 * as parameters, only fixed fragments are assembled, and the skill test is an
 * EXISTS subquery so it cannot interfere with the skills each worker lists.
 */
const buildWorkerFilters = ({skillIds, location, q}) => {
    const conditions = [`u.role = 'worker'`];
    const params = [];

    if(skillIds && skillIds.length > 0){
        params.push(skillIds);
        conditions.push(`EXISTS (SELECT 1 FROM kantowork.worker_skills f
                                  WHERE f.worker_id = u.id AND f.skill_id = ANY($${params.length}::int[]))`);
    }

    if(location){
        params.push(`%${location}%`);
        conditions.push(`p.location ILIKE $${params.length}`);
    }

    if(q){
        params.push(`%${q}%`);
        conditions.push(`(u.name ILIKE $${params.length} OR p.headline ILIKE $${params.length}
                          OR p.bio ILIKE $${params.length})`);
    }

    return {where: `WHERE ${conditions.join(' AND ')}`, params};
};

const SELECT_WORKER_SUMMARY = `
    SELECT u.id AS user_id,
           u.name,
           p.headline,
           p.location,
           p.years_experience,
           p.hourly_rate,
           COALESCE(
               json_agg(
                   json_build_object('id', s.id, 'name', s.name, 'category', s.category)
                   ORDER BY s.category, s.name
               ) FILTER (WHERE s.id IS NOT NULL),
               '[]'
           ) AS skills
      FROM kantowork.users u
      LEFT JOIN kantowork.worker_profiles p ON p.user_id = u.id
      LEFT JOIN kantowork.worker_skills ws  ON ws.worker_id = u.id
      LEFT JOIN kantowork.skills s          ON s.id = ws.skill_id
`;

/**
 * Workers who have said something about themselves come first: a page of
 * blank names helps nobody decide. After that it is alphabetical, which at
 * least does not change between refreshes.
 */
const listWorkers = ({limit, offset, ...filters}) => {
    const {where, params} = buildWorkerFilters(filters);
    return pool.query(
        `${SELECT_WORKER_SUMMARY} ${where}
          GROUP BY u.id, u.name, p.headline, p.location, p.years_experience, p.hourly_rate
          ORDER BY (p.headline IS NULL OR p.headline = ''), u.name
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
    );
};

const countWorkers = (filters = {}) => {
    const {where, params} = buildWorkerFilters(filters);
    return pool.query(
        `SELECT count(DISTINCT u.id)::int AS total
           FROM kantowork.users u
           LEFT JOIN kantowork.worker_profiles p ON p.user_id = u.id
           ${where}`,
        params
    );
};

module.exports = {
    listWorkers,
    countWorkers,
    findProfileByUserId,
    upsertProfile,
    findSkillsByWorkerId,
    replaceSkills,
    findPublicProfileById
};
