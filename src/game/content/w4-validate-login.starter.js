// Goal: validate the login form BEFORE calling the API.
function validateLogin({ email = '', password = '' } = {}) {
  const errors = {};
  // email    → 'Email is required'  (after trimming spaces)
  //          → 'Enter a valid email' when it is not like name@host.tld
  // password → 'Password is required'
  //          → 'Password must be at least 8 characters'   (never trim passwords)
  return errors;
}
