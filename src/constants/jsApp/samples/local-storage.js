const STORAGE_KEY = 'wayfar.user';

export const session = {
  save(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));   // null if missing
    } catch {
      return null;                                             // corrupted value
    }
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

session.save({ name: 'Asha', email: 'asha@example.com' });    // never a password or secret
console.log(session.load()?.name);
session.clear();                                               // on logout
