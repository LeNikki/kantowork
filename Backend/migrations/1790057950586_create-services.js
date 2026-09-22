/**
 * The things a worker offers, priced. Distinct from their skills: a skill is
 * "I can do carpentry", a service is "fitted wardrobe, from 25,000".
 *
 * rate_unit carries the shape of the price, because trades quote differently -
 * by the job, by the hour or the day, by the square metre for tiling and
 * painting. A rate with no unit says half of what was meant.
 *
 * position is the worker's own ordering: the first thing in the list is what
 * they most want to be asked for, which is not the same as what they added
 * first.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.services (
        id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        worker_id   INTEGER NOT NULL REFERENCES kantowork.users(id) ON DELETE CASCADE,
        title       VARCHAR(140) NOT NULL,
        description TEXT,
        rate        NUMERIC(12, 2) CHECK (rate >= 0),
        rate_unit   VARCHAR(10) NOT NULL DEFAULT 'job'
                        CHECK (rate_unit IN ('job', 'hour', 'day', 'sqm')),
        position    SMALLINT NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX services_worker_id_idx ON kantowork.services (worker_id, position, id);
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.services;');
};
