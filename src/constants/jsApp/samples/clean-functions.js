// ❌ One function validates, calls the server, edits the DOM and redirects.
//    It cannot be unit-tested and every change risks breaking something else.

// ✅ Small functions, each with ONE job
const readForm = (form) => Object.fromEntries(new FormData(form));    // DOM in, data out

const validateLogin = ({ email, password }) => {                      // pure: same input, same output
  const errors = [];
  if (!email.includes('@')) errors.push('Enter a valid email');
  if (!password) errors.push('Enter your password');
  return errors;
};

const showErrors = (errors) => {                                       // DOM only
  document.querySelector('#message').textContent = errors.join('. ');
};

async function onSubmit(event) {                                       // orchestrates, never does the work
  event.preventDefault();
  const credentials = readForm(event.currentTarget);
  const errors = validateLogin(credentials);
  if (errors.length > 0) return showErrors(errors);                    // early return, no deep nesting
  await submitLogin(credentials);
}
