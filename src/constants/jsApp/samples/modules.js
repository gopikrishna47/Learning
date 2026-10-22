// utils/validators.js: NAMED exports for many small helpers
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isStrongPassword = (password) => password.length >= 8;

// models/User.js: DEFAULT export for the one main thing a file provides
export default class User { /* ... */ }

// login.js: the entry point only wires the pieces together
import User from './models/User.js';
import { isValidEmail, isStrongPassword } from './utils/validators.js';

// Load heavy code only when it is needed (returns a promise)
const { default: renderMap } = await import('./map.js');

// login.html loads the entry file as a module (deferred, strict mode, own scope):
// <script type="module" src="js/login.js"></script>
