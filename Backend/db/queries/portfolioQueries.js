const pool = require('../../db');

/**
 * A project always comes back with its images, aggregated in SQL - a portfolio
 * of ten projects should be one round trip rather than eleven.
 *
 * The FILTER keeps a project with no images from getting a list holding one
 * null, which is what the LEFT JOIN's row of nulls would otherwise aggregate
 * into.
 */
const SELECT_PROJECT = `
    SELECT p.id,
           p.worker_id,
           p.title,
           p.description,
           p.completed_on,
           p.position,
           COALESCE(
               json_agg(
                   json_build_object('id', i.id, 'url', i.url, 'caption', i.caption)
                   ORDER BY i.position, i.id
               ) FILTER (WHERE i.id IS NOT NULL),
               '[]'
           ) AS images
      FROM kantowork.portfolio_projects p
      LEFT JOIN kantowork.portfolio_images i ON i.project_id = p.id
`;

const GROUP_BY = ' GROUP BY p.id ';

const listByWorker = (workerId) => {
    return pool.query(
        `${SELECT_PROJECT} WHERE p.worker_id = $1 ${GROUP_BY} ORDER BY p.position, p.id`,
        [workerId]
    );
};

const findById = (id) => {
    return pool.query(`${SELECT_PROJECT} WHERE p.id = $1 ${GROUP_BY}`, [id]);
};

/**
 * A project and its images are written together, for the same reason a job and
 * its skills are: a project that exists with none of its pictures is not what
 * the worker asked to save.
 */
const createWithImages = async (workerId, fields, images) => {
    const {title, description, completed_on, position} = fields;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO kantowork.portfolio_projects
                    (worker_id, title, description, completed_on, position)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [workerId, title, description, completed_on, position]
        );
        const projectId = result.rows[0].id;
        await insertImages(client, projectId, images);
        await client.query('COMMIT');
        return projectId;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateWithImages = async (id, fields, images) => {
    const {title, description, completed_on, position} = fields;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE kantowork.portfolio_projects
                SET title = $2, description = $3, completed_on = $4,
                    position = $5, updated_at = now()
              WHERE id = $1`,
            [id, title, description, completed_on, position]
        );
        // The request states the whole set of images, so the old ones go.
        await client.query(`DELETE FROM kantowork.portfolio_images WHERE project_id = $1`, [id]);
        await insertImages(client, id, images);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Position comes from the order they arrived in: the worker arranged them in
// the form, and that arrangement is the answer.
const insertImages = async (client, projectId, images) => {
    if (images.length === 0) return;
    const values = images.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3}, ${i})`).join(', ');
    const params = [projectId, ...images.flatMap((img) => [img.url, img.caption ?? null])];
    await client.query(
        `INSERT INTO kantowork.portfolio_images (project_id, url, caption, position)
         VALUES ${values}`,
        params
    );
};

const remove = (id) => {
    return pool.query(`DELETE FROM kantowork.portfolio_projects WHERE id = $1`, [id]);
};

module.exports = {listByWorker, findById, createWithImages, updateWithImages, remove};
