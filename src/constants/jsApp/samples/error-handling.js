const hideLoader = () => document.querySelector('#loader')?.setAttribute('hidden', '');

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function loadTrips() {
  try {
    const response = await fetch('/api/trips');
    if (!response.ok) throw new ApiError('Could not load trips', response.status);
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      location.assign('/login.html');     // handle what you can...
      return [];
    }
    throw error;                          // ...rethrow what you cannot
  } finally {
    hideLoader();                         // always runs, even after return/throw
  }
}

// Safety net for any rejected promise nobody caught
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
