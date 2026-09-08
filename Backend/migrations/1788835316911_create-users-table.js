/**
 * Baseline. The table already exists on machines set up before node-pg-migrate,
 * so this is written to be a no-op there and to build it from scratch elsewhere.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE SCHEMA IF NOT EXISTS kantowork;

    CREATE TABLE IF NOT EXISTS kantowork.users (
        id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name          VARCHAR(50)  NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role          VARCHAR(50)  NOT NULL
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.users;');
};
