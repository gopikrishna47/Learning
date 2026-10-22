import { $, readForm, showMessage } from './utils/dom.js';
import { validateRegistration } from './utils/validators.js';
import { post } from './services/api.js';
import { notify } from './services/notify.js';
import User from './models/User.js';

const form = $('#register-form');
const message = $('#message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const values = readForm(form);
  const errors = validateRegistration(values);
  if (errors.length > 0) {
    showMessage(message, errors.join('. '));
    return;
  }

  try {
    const user = new User(await post('/register', values));
    showMessage(message, 'Welcome, ' + user.displayName + '!', 'success');
    await notify('WayFar', 'Registration successful');
    location.assign('/login.html');
  } catch (error) {
    showMessage(message, error.message);
  }
});
