/**
 * A job's budget_type and a service's rate_unit are the same idea - the shape
 * of a price - spelled two different ways, and the job side was the poorer of
 * the two. A worker could offer tiling at 800 per square metre; a client could
 * not post a tiling job with a per-square-metre budget, because a budget could
 * only be 'fixed' or 'hourly'. The trades that quote by area - tiling,
 * painting, plastering - were the ones this shut out.
 *
 * So budget_type takes the vocabulary services already use, and the two sides
 * share one list: config/rateUnits.js. 'fixed' becomes 'job' and 'hourly'
 * becomes 'hour' - the same two meanings under the names the other side
 * already gave them - and 'day' and 'sqm' are newly sayable.
 *
 * The constraint is dropped before the rows are rewritten: the new spellings
 * violate the old CHECK, which is still watching until it goes.
 */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE kantowork.jobs DROP CONSTRAINT IF EXISTS jobs_budget_type_check;

    UPDATE kantowork.jobs SET budget_type = 'job'  WHERE budget_type = 'fixed';
    UPDATE kantowork.jobs SET budget_type = 'hour' WHERE budget_type = 'hourly';

    ALTER TABLE kantowork.jobs ALTER COLUMN budget_type SET DEFAULT 'job';

    ALTER TABLE kantowork.jobs
      ADD CONSTRAINT jobs_budget_type_check
      CHECK (budget_type IN ('job', 'hour', 'day', 'sqm'));
  `);
};

/**
 * The two renames reverse exactly: 'job' is 'fixed' again and 'hour' is
 * 'hourly'.
 *
 * A job quoted by the day or the square metre has no old spelling to go back
 * to, and leaving those rows alone would only make the old constraint refuse
 * to be added. They become 'fixed': of the two values the old schema had, a
 * price for the job is the honest reading of an amount whose unit has been
 * dropped, where 'hourly' would quietly multiply the client's number by every
 * hour worked. The unit itself is lost - a rollback cannot keep what the old
 * column had no way to hold - so a job that read "800 per m²" reads "800 for
 * the job" afterwards, and a client who wrote one would have to say it again.
 */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE kantowork.jobs DROP CONSTRAINT IF EXISTS jobs_budget_type_check;

    UPDATE kantowork.jobs SET budget_type = 'hourly' WHERE budget_type = 'hour';
    UPDATE kantowork.jobs SET budget_type = 'fixed'  WHERE budget_type IN ('job', 'day', 'sqm');

    ALTER TABLE kantowork.jobs ALTER COLUMN budget_type SET DEFAULT 'fixed';

    ALTER TABLE kantowork.jobs
      ADD CONSTRAINT jobs_budget_type_check
      CHECK (budget_type IN ('fixed', 'hourly'));
  `);
};
