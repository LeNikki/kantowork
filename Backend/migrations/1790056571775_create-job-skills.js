/**
 * What a job asks for, drawn from the same vocabulary a worker lists their
 * skills from. That shared table is the whole point: matching a worker to a
 * job is a join on skill_id, not a comparison of two pieces of free text.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.job_skills (
        job_id   INTEGER NOT NULL REFERENCES kantowork.jobs(id)   ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES kantowork.skills(id) ON DELETE CASCADE,
        PRIMARY KEY (job_id, skill_id)
    );

    -- The PK covers "what does this job need". This covers "which jobs need
    -- tiling", which is how a worker finds work.
    CREATE INDEX job_skills_skill_id_idx ON kantowork.job_skills (skill_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.job_skills;');
};
