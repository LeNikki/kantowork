/**
 * Which skills a worker claims. The composite primary key is the constraint
 * that matters: a worker cannot list the same skill twice.
 *
 * ON DELETE CASCADE on both sides - dropping a skill from the vocabulary
 * should not leave rows pointing at nothing.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.worker_skills (
        worker_id INTEGER NOT NULL REFERENCES kantowork.users(id)  ON DELETE CASCADE,
        skill_id  INTEGER NOT NULL REFERENCES kantowork.skills(id) ON DELETE CASCADE,
        PRIMARY KEY (worker_id, skill_id)
    );

    -- The PK covers lookups by worker. This covers the other direction,
    -- for "who can do tiling".
    CREATE INDEX worker_skills_skill_id_idx ON kantowork.worker_skills (skill_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.worker_skills;');
};
