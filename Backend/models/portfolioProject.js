const {toDateString} = require('../lib/values');

// A previous job, with its pictures. completed_on is a plain day, so it is
// sent as YYYY-MM-DD - see lib/values.
class PortfolioProject {
    constructor(row){
        this.id           = row.id;
        this.worker_id    = row.worker_id;
        this.title        = row.title;
        this.description  = row.description ?? '';
        this.completed_on = toDateString(row.completed_on);
        this.position     = row.position;
        this.images       = (row.images ?? []).map((i) => ({
            id:      i.id,
            url:     i.url,
            caption: i.caption ?? ''
        }));
    }

    static fromRow(row){
        return new PortfolioProject(row);
    }

    toPublic(){
        return {...this};
    }
}

module.exports = PortfolioProject;
