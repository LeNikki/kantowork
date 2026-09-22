/**
 * A job posting.
 *
 * The two budget bounds get the same treatment the worker's hourly rate does:
 * pg hands NUMERIC back as a string to protect precision, and an amount this
 * size is safe as a number. A null bound stays null - it means the client did
 * not say, which is different from zero.
 *
 * deadline is a DATE, and pg turns it into a JS Date in the server's zone.
 * Sent on as an ISO date string, the day cannot drift a step either way when
 * the client and server sit in different zones.
 */
const toNumber = (value) => (value === null || value === undefined ? null : Number(value));
const toDateString = (value) => {
    if (!value) return null;
    // A Date from pg for a DATE column is midnight local, so the local parts
    // are the date that was stored - reading them in UTC could be yesterday.
    const pad = (n) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

class Job {
    constructor(row){
        this.id                 = row.id;
        this.client_id          = row.client_id;
        this.client_name        = row.client_name;
        this.title              = row.title;
        this.description        = row.description;
        this.location           = row.location ?? '';
        this.budget_type        = row.budget_type;
        this.budget_min         = toNumber(row.budget_min);
        this.budget_max         = toNumber(row.budget_max);
        this.status             = row.status;
        this.assigned_worker_id = row.assigned_worker_id ?? null;
        this.deadline           = toDateString(row.deadline);
        this.created_at         = row.created_at;
        this.skills             = row.skills ?? [];
    }

    static fromRow(row){
        return new Job(row);
    }

    // A posting is written to be read by workers, so there is nothing here to
    // hold back. The client's contact details are not part of it - a worker
    // gets those by being chosen, the same way round as the worker's own.
    toPublic(){
        return {...this};
    }
}

module.exports = Job;
