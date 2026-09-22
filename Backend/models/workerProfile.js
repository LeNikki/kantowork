/**
 * A worker's profile, joined onto their user row.
 *
 * Two things are normalised here rather than in the queries:
 *
 * - pg hands back NUMERIC as a string, to avoid silently losing precision on
 *   values that do not fit a float. An hourly rate is small enough to be safe
 *   as a number, and the frontend would otherwise have to parse it.
 * - A worker who has not saved yet has NULL for every profile column. The
 *   empty string is kinder to a form than null, so text fields come back as
 *   ''. The two numbers stay null: 0 years and no answer are different.
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
        this.hourly_rate      = row.hourly_rate === null || row.hourly_rate === undefined
            ? null
            : Number(row.hourly_rate);
        this.phone            = row.phone ?? '';
        this.skills           = [];
    }

    static fromRow(row){
        return new WorkerProfile(row);
    }

    withSkills(skills){
        this.skills = skills;
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
            skills:           this.skills
        };
    }

    // The worker's own view of their profile - everything, contact details
    // included, since it is theirs.
    toOwn(){
        return {...this.toPublic(), email: this.email, phone: this.phone};
    }
}

module.exports = WorkerProfile;
