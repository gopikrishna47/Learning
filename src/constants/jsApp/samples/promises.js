const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === 'secret123') resolve({ email });
      else reject(new Error('Invalid credentials'));
    }, 500);
  });
}

loginUser('asha@example.com', 'secret123')
  .then((user) => console.log('Welcome', user.email))   // fulfilled
  .catch((error) => console.error(error.message))       // rejected
  .finally(() => console.log('Hide the loader'));       // always runs

// Run independent work together; rejects as soon as one fails
Promise.all([loginUser('asha@example.com', 'secret123'), wait(200)])
  .then(([user]) => console.log(user.email));

// Wait for everything, success or failure
Promise.allSettled([loginUser('a@b.com', 'wrong'), wait(100)])
  .then((results) => console.log(results.map((result) => result.status)));
