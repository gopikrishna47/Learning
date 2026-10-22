const message = document.querySelector('#message');
message.textContent = 'Registered successfully!';   // safe: never parsed as HTML
message.classList.add('success');
message.setAttribute('role', 'alert');               // announced by screen readers

// Build a list with ONE DOM write instead of many
const fragment = document.createDocumentFragment();
['Goa', 'Munnar', 'Ooty'].forEach((place) => {
  const item = document.createElement('li');
  item.textContent = place;
  fragment.append(item);
});
document.querySelector('#places').append(fragment);

// Event delegation: one listener also covers items added later
document.querySelector('#places').addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (item) item.classList.toggle('visited');
});
