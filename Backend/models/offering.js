const {toNumber} = require('../lib/values');

/**
 * One thing a worker offers, priced.
 *
 * The table and the API call these "services", which is the word a worker
 * would use. In the code they are offerings, because services/ is already
 * this application's own layer and `workerServiceService` is nobody's idea
 * of a readable filename.
 */
class Offering {
    constructor(row){
        this.id          = row.id;
        this.worker_id   = row.worker_id;
        this.title       = row.title;
        this.description = row.description ?? '';
        this.rate        = toNumber(row.rate);
        this.rate_unit   = row.rate_unit;
        this.position    = row.position;
    }

    static fromRow(row){
        return new Offering(row);
    }

    // Written to be read by clients, so there is nothing to hold back and the
    // public view is the whole of it.
    toPublic(){
        return {...this};
    }
}

module.exports = Offering;
