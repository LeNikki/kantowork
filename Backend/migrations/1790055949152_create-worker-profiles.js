/**
 * The worker's side of a user. One row per worker at most, so user_id is the
 * primary key - there is no separate profile id to carry around.
 *
 * The row is created on first save rather than at signup, so every column is
 * nullable: a worker who has only just signed up has a profile that is simply
 * empty, not one that is missing.
 *
 * Nothing here can enforce that the user is a worker and not a client - that
 * is a different row. The /api/workers/me routes are gated by requireRole.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.worker_profiles (
        user_id          INTEGER PRIMARY KEY REFERENCES kantowork.users(id) ON DELETE CASCADE,
        headline         VARCHAR(120),
        bio              TEXT,
        location         VARCHAR(120),
        years_experience SMALLINT CHECK (years_experience >= 0 AND years_experience <= 80),
        hourly_rate      NUMERIC(10, 2) CHECK (hourly_rate >= 0),
        phone            VARCHAR(30),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.worker_profiles;');
};
