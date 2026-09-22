// A client's profile, joined onto their user row. Text columns come back as ''
// rather than null for the same reason as the worker's - it is a form on the
// other end.
class ClientProfile {
    constructor(row){
        this.user_id  = row.user_id;
        this.name     = row.name;
        this.email    = row.email;
        this.company  = row.company  ?? '';
        this.about    = row.about    ?? '';
        this.location = row.location ?? '';
        this.phone    = row.phone    ?? '';
    }

    static fromRow(row){
        return new ClientProfile(row);
    }

    // Only ever returned to the client themselves, so far - nothing browses
    // clients. If that changes, this needs the same split the worker has.
    toOwn(){
        return {
            user_id:  this.user_id,
            name:     this.name,
            email:    this.email,
            company:  this.company,
            about:    this.about,
            location: this.location,
            phone:    this.phone
        };
    }
}

module.exports = ClientProfile;
