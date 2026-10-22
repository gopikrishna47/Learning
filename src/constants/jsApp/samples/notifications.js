export async function notify(title, body) {
  if (!('Notification' in window)) return false;            // unsupported browser

  let permission = Notification.permission;                 // "default" | "granted" | "denied"
  if (permission === 'default') {
    permission = await Notification.requestPermission();    // call from a click handler
  }
  if (permission !== 'granted') return false;

  new Notification(title, { body, icon: '/icons/wayfar.png' });
  return true;
}

document.querySelector('#login-button').addEventListener('click', () => {
  notify('WayFar', 'Welcome back!');
});
