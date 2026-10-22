import { $, readForm, showMessage } from './utils/dom.js';
import { validateLogin } from './utils/validators.js';
import { post } from './services/api.js';
import { session } from './services/session.js';
import { notify } from './services/notify.js';
import User from './models/User.js';

const form = $('#login-form');
const message = $('#message');

function getRedirectTarget() {
  const target = new URLSearchParams(location.search).get('redirect');
  const isSafePath = target?.startsWith('/') && !target.startsWith('//');   // blocks open redirects
  return isSafePath ? target : '/home.html';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const credentials = readForm(form);
  const errors = validateLogin(credentials);
  if (errors.length > 0) {
    showMessage(message, errors.join('. '));
    return;
  }

  try {
    const user = new User(await post('/login', credentials));
    session.save(user);                         // toJSON() keeps secrets out of storage
    await notify('WayFar', 'Welcome back, ' + user.displayName);
    location.replace(getRedirectTarget());      // replace: Back does not return to login
  } catch (error) {
    showMessage(message, error.message);
  }
});
