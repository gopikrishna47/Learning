function createSearch(fetchResults, delay) {
  let timer = null;
  let latestId = 0;
  let cancelPending = null;

  return function search(query) {
    const id = ++latestId;
    clearTimeout(timer);
    if (cancelPending) cancelPending();
    return new Promise((resolve, reject) => {
      cancelPending = () => resolve(null);
      timer = setTimeout(async () => {
        cancelPending = null;
        try {
          const results = await fetchResults(query);
          resolve(id === latestId ? results : null);
        } catch (err) {
          if (id === latestId) reject(err);
          else resolve(null);
        }
      }, delay);
    });
  };
}
