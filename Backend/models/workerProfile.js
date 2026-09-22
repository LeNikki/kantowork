const {toNumber} = require('../lib/values');

/**
 * A worker's profile, joined onto their user row.
 *
 * A worker who has not saved yet has NULL for every profile column. The empty
 * string is kinder to a form than null, so text fields come back as ''. The
 * two numbers stay null: 0 years and no answer are different.
 */
class WorkerProfile {
    constructor(row){
        this.user_id          = row.user_id;
        this.name             = row.name;
        this.email            = row.email;
        this.headline         = row.headline ?? '';
        this.bio              = row.bio ?? '';
        this.location         = row.location ?? '';
        this.years_experience = row.years_experience ?? null;
        this.hourly_rate      = toNumber(row.hourly_rate);
        this.phone            = row.phone ?? '';
        this.skills           = [];
        // Filled in by the caller, and only for the public profile - the
        // worker's own edit pages fetch these separately, one form each.
        this.services         = [];
        this.portfolio        = [];
    }

    static fromRow(row){
        return new WorkerProfile(row);
    }

    withSkills(skills){
        this.skills = skills;
        return this;
    }

    withOfferings(offerings){
        this.services = offerings.map((o) => o.toPublic());
        return this;
    }

    withPortfolio(projects){
        this.portfolio = projects.map((p) => p.toPublic());
        return this;
    }

    /**
     * What a client browsing the platform may see. Deliberately narrower than
     * the worker's own view: no email and no phone. Contact details are the
     * worker's to give out once they are chosen for a job, not a field to be
     * scraped off a public page.
     */
    toPublic(){
        return {
            user_id:          this.user_id,
            name:             this.name,
            headline:         this.headline,
            bio:              this.bio,
            location:         this.location,
            years_experience: this.years_experience,
            hourly_rate:      this.hourly_rate,
            skills:           this.skills,
            services:         this.services,
            portfolio:        this.portfolio
        };
    }

    /**
     * The worker's own view: their contact details are theirs to see, but the
     * services and the portfolio are left out rather than sent empty. Only the
     * public profile gathers those, and an empty list here would read as "you
     * have none" when the truth is "nobody asked for them".
     */
    toOwn(){
        const {services, portfolio, ...profile} = this.toPublic();
        return {...profile, email: this.email, phone: this.phone};
    }
}

module.exports = WorkerProfile;
