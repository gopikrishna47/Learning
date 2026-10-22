const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rules = {
  email: (value) => (EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email'),
  password: (value) => (value.length >= 8 ? '' : 'Use at least 8 characters'),
};

export function validate(values) {
  return Object.entries(rules)
    .map(([field, check]) => ({ field, message: check(values[field] ?? '') }))
    .filter(({ message }) => message);            // keep only the failures
}

// Built-in browser validation: HTML attributes + Constraint Validation API
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;             // shows the browser's own messages
  console.log(validate(Object.fromEntries(new FormData(form))));
});

const email = document.querySelector('#email');
email.addEventListener('input', () => {
  email.setCustomValidity(email.validity.typeMismatch ? 'Enter a valid email' : '');
});
