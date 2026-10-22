console.log(location.href);        // "https://wayfar.app/login.html?redirect=/trips#top"
console.log(location.pathname);    // "/login.html"
console.log(location.search);      // "?redirect=/trips"

const params = new URLSearchParams(location.search);
const redirectTo = params.get('redirect') ?? '/home.html';

location.assign(redirectTo);       // adds a history entry: Back returns to login
location.replace('/home.html');    // replaces the entry: Back skips the login page
location.reload();                 // refresh the current page
