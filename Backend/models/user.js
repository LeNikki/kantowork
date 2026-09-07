class User{
    constructor({id, name, email, password_hash, role}){
        this.id = id;
        this.name = name;
        this.email = email;
        this.password_hash = password_hash;
        this.role = role;
    }

    static fromRow(row){
        return new User(row);
    }

    // Never send password_hash over the wire.
    toPublic(){
        return {id: this.id, name: this.name, email: this.email, role: this.role};
    }
}

module.exports = User;
