/**
 * Previous work, which is what a client is really buying on.
 *
 * Images are URLs, not files: nothing here uploads or stores an image, so a
 * worker points at one hosted elsewhere. Moving to real uploads later changes
 * what fills this column, not the column - it stays the address of an image.
 *
 * The images are a separate table rather than an array so each one can carry
 * its own caption and its own place in the order. They belong to the project
 * and are meaningless without it, hence ON DELETE CASCADE.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.portfolio_projects (
        id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        worker_id    INTEGER NOT NULL REFERENCES kantowork.users(id) ON DELETE CASCADE,
        title        VARCHAR(140) NOT NULL,
        description  TEXT,
        completed_on DATE,
        position     SMALLINT NOT NULL DEFAULT 0,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX portfolio_projects_worker_id_idx
        ON kantowork.portfolio_projects (worker_id, position, id);

    CREATE TABLE kantowork.portfolio_images (
        id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES kantowork.portfolio_projects(id) ON DELETE CASCADE,
        url        TEXT NOT NULL,
        caption    VARCHAR(200),
        position   SMALLINT NOT NULL DEFAULT 0
    );

    CREATE INDEX portfolio_images_project_id_idx
        ON kantowork.portfolio_images (project_id, position, id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS kantowork.portfolio_images;
    DROP TABLE IF EXISTS kantowork.portfolio_projects;
  `);
};
