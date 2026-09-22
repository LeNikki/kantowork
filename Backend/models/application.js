const {toNumber} = require('../lib/values');

// An application, carrying enough of its job and its worker to be shown
// without another lookup.
class Application {
    constructor(row){
        this.id              = row.id;
        this.job_id          = row.job_id;
        this.job_title       = row.job_title;
        this.job_status      = row.job_status;
        this.client_id       = row.client_id;
        this.worker_id       = row.worker_id;
        this.worker_name     = row.worker_name;
        this.worker_headline = row.worker_headline ?? '';
        this.cover_message   = row.cover_message ?? '';
        this.proposed_amount = toNumber(row.proposed_amount);
        this.status          = row.status;
        this.created_at      = row.created_at;
    }

    static fromRow(row){
        return new Application(row);
    }

    // client_id is carried for the ownership check and is of no use to anyone
    // reading the application, so it does not go over the wire.
    toPublic(){
        const {client_id, ...rest} = this;
        return rest;
    }
}

module.exports = Application;
