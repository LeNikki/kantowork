/**
 * The client's side of a user - the counterpart of worker_profiles, and empty
 * until first saved for the same reason. A client posts jobs rather than being
 * browsed, so it holds less: who they are and how to reach them.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.client_profiles (
        user_id    INTEGER PRIMARY KEY REFERENCES kantowork.users(id) ON DELETE CASCADE,
        company    VARCHAR(120),
        about      TEXT,
        location   VARCHAR(120),
        phone      VARCHAR(30),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.client_profiles;');
};
