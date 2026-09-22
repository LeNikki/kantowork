/**
 * A worker's application to a job - the row that connects the two sides.
 *
 * Two uniqueness rules, both in the database because both are about what is
 * true rather than about what any one request happens to do:
 *
 * - UNIQUE (job_id, worker_id): a worker applies to a job once. Changing
 *   their mind reuses the same row rather than adding another.
 * - One accepted application per job, as a partial unique index. Accepting is
 *   several statements in a transaction, and this is what makes "this job has
 *   one chosen worker" hold even if two clients press accept at the same
 *   instant on two different applications.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.applications (
        id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        job_id          INTEGER NOT NULL REFERENCES kantowork.jobs(id)  ON DELETE CASCADE,
        worker_id       INTEGER NOT NULL REFERENCES kantowork.users(id) ON DELETE CASCADE,
        cover_message   TEXT,
        proposed_amount NUMERIC(12, 2) CHECK (proposed_amount >= 0),
        status          VARCHAR(12) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT applications_one_per_worker_per_job UNIQUE (job_id, worker_id)
    );

    CREATE UNIQUE INDEX applications_one_accepted_per_job_idx
        ON kantowork.applications (job_id) WHERE status = 'accepted';

    -- "What have I applied for", which is the worker's own list.
    CREATE INDEX applications_worker_id_idx ON kantowork.applications (worker_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.applications;');
};
