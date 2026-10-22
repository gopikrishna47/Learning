const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export const isValidEmail = (email) => EMAIL_PATTERN.test(email.trim());

/** @returns {string[]} error messages; an empty array means the data is valid */
export function validateLogin({ email, password }) {
  const errors = [];
  if (!isValidEmail(email)) errors.push('Enter a valid email address');
  if (!password) errors.push('Enter your password');
  return errors;
}

/** @returns {string[]} error messages; an empty array means the data is valid */
export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = [];
  if (name.trim().length < 2) errors.push('Enter your full name');
  if (!isValidEmail(email)) errors.push('Enter a valid email address');
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push('Password needs ' + MIN_PASSWORD_LENGTH + '+ characters');
  }
  if (!/\d/.test(password)) errors.push('Password needs at least one number');
  if (password !== confirmPassword) errors.push('Passwords do not match');
  return errors;
}
