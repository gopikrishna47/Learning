const form = document.querySelector('#login-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();                  // stop the page reload
  console.log(event.type);                 // "submit"
  console.log(event.target === form);      // true: the form fired it

  const formData = new FormData(event.currentTarget);
  console.log(formData.get('email'));
});

// Bubbling: a click on <li> also reaches the <ul> listener
document.querySelector('ul').addEventListener('click', (event) => {
  console.log(event.target);               // the <li> that was clicked
  console.log(event.currentTarget);        // the <ul> handling it right now
});

// Remove the listener automatically after the first run
window.addEventListener('resize', () => console.log('resized once'), { once: true });
