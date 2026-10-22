async function getUser(id) {
  try {
    const response = await fetch('/api/users/' + id);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Could not load user:', error.message);
    return null;
  }
}

// Sequential: the second request waits for the first (slow)
const first = await getUser(1);
const second = await getUser(2);

// Parallel: both requests start immediately (fast)
const [userOne, userTwo] = await Promise.all([getUser(1), getUser(2)]);
