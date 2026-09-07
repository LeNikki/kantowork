-- Session store for connect-pg-simple.
-- Also created at boot by createTableIfMissing, so an existing volume is covered too.
CREATE TABLE IF NOT EXISTS kantowork.session (
    sid    varchar NOT NULL COLLATE "default" PRIMARY KEY,
    sess   json NOT NULL,
    expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON kantowork.session (expire);
