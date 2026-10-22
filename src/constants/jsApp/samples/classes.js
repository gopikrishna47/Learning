export default class User {
  #createdAt = new Date();             // private field: unreachable from outside

  constructor({ name, email }) {
    this.name = name;
    this.email = email;
  }

  get displayName() {
    return this.name.toUpperCase();
  }

  get memberSince() {
    return this.#createdAt.getFullYear();
  }

  toJSON() {                           // JSON.stringify(user) controls what is saved
    return { name: this.name, email: this.email };
  }

  static fromForm(formData) {          // static: belongs to the class, not an instance
    return new User({ name: formData.get('name'), email: formData.get('email') });
  }
}

class Admin extends User {
  constructor(details) {
    super(details);                    // must run before "this" is used
    this.role = 'admin';
  }
}

const asha = new User({ name: 'Asha', email: 'asha@example.com' });
console.log(asha.displayName, asha instanceof User);   // "ASHA" true
