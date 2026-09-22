/**
 * `role` started as free text and every signup wrote the literal 'user'. The
 * platform has two real sides, so the column becomes a closed set.
 *
 * 'admin' is in the set but is deliberately not assignable over HTTP - see the
 * signup validator. It exists so an admin can be made by hand, in SQL.
 */
exports.up = (pgm) => {
  pgm.sql(`
    UPDATE kantowork.users SET role = 'client' WHERE role = 'user';

    ALTER TABLE kantowork.users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('worker', 'client', 'admin'));

    ALTER TABLE kantowork.users
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  `);
};

/**
 * The backfill is not undone. Rolling back would have to turn every client
 * into a 'user', including the ones who signed up as clients for real - it
 * cannot tell them apart. Dropping the constraint is enough to make the old
 * code work again.
 */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE kantowork.users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE kantowork.users DROP COLUMN IF EXISTS created_at;
  `);
};
