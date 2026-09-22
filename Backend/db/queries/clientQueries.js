const pool = require('../../db');

// LEFT JOIN for the same reason as the worker's: no saved row yet is an empty
// profile, not a missing user.
const findProfileByUserId = (userId) => {
    return pool.query(
        `SELECT u.id AS user_id,
                u.name,
                u.email,
                p.company,
                p.about,
                p.location,
                p.phone
           FROM kantowork.users u
           LEFT JOIN kantowork.client_profiles p ON p.user_id = u.id
          WHERE u.id = $1`,
        [userId]
    );
};

const upsertProfile = (userId, {company, about, location, phone}) => {
    return pool.query(
        `INSERT INTO kantowork.client_profiles
                (user_id, company, about, location, phone, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (user_id) DO UPDATE
            SET company    = EXCLUDED.company,
                about      = EXCLUDED.about,
                location   = EXCLUDED.location,
                phone      = EXCLUDED.phone,
                updated_at = now()
         RETURNING *`,
        [userId, company, about, location, phone]
    );
};

module.exports = {findProfileByUserId, upsertProfile};
