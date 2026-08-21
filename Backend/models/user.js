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
}

module.exports = User;