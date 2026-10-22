// ❌ Unclear names and magic numbers
function f(a, b) {
  if (a.length > 7 && b === 1) return true;
  return false;
}

// ✅ Intention-revealing names and named constants
const MIN_PASSWORD_LENGTH = 8;
const ROLE_ADMIN = 'admin';

const isStrongPassword = (password) => password.length >= MIN_PASSWORD_LENGTH;
const isAdmin = (user) => user.role === ROLE_ADMIN;   // booleans read as questions: is / has / can

// Conventions: camelCase variables and functions, PascalCase classes,
// UPPER_SNAKE_CASE constants, verbs for functions, nouns for data.
