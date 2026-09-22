const {toNumber, toDateString} = require('../lib/values');

// A job posting. Its budget bounds and its deadline are both normalised on
// the way out - lib/values says why each one needs it.

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
