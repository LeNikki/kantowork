/**
 * A job a client has posted. Title and description are required - a posting
 * without either says nothing to a worker deciding whether to apply.
 *
 * Budget is a range with a type rather than one number: a client often knows
 * roughly what they will pay before they know exactly, and "400-600 an hour"
 * and "400-600 for the job" are very different offers. Leaving both bounds
 * null is allowed, and means the budget is open.
 *
 * assigned_worker_id stays null until a client accepts an application, which
 * is Phase 3. The two CHECKs are what keep status and that column honest:
 * an open job has nobody assigned, and an assigned job has somebody. A
 * cancelled or completed job may have either, since work may be called off
 * before or after someone was picked.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.jobs (
        id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        client_id          INTEGER NOT NULL REFERENCES kantowork.users(id) ON DELETE CASCADE,
        title              VARCHAR(140) NOT NULL,
        description        TEXT         NOT NULL,
        location           VARCHAR(120),
        budget_type        VARCHAR(10)  NOT NULL DEFAULT 'fixed'
                               CHECK (budget_type IN ('fixed', 'hourly')),
        budget_min         NUMERIC(12, 2) CHECK (budget_min >= 0),
        budget_max         NUMERIC(12, 2) CHECK (budget_max >= 0),
        status             VARCHAR(12)  NOT NULL DEFAULT 'open'
                               CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
        assigned_worker_id INTEGER REFERENCES kantowork.users(id) ON DELETE SET NULL,
        deadline           DATE,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT jobs_budget_order_check
            CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min),
        CONSTRAINT jobs_open_has_no_worker_check
            CHECK (status <> 'open' OR assigned_worker_id IS NULL),
        CONSTRAINT jobs_assigned_has_worker_check
            CHECK (status <> 'assigned' OR assigned_worker_id IS NOT NULL)
    );

    -- The board: open jobs, newest first.
    CREATE INDEX jobs_status_created_at_idx ON kantowork.jobs (status, created_at DESC);
    -- A client's own list.
    CREATE INDEX jobs_client_id_idx ON kantowork.jobs (client_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.jobs;');
};
