// Goal: rebuild Promise.all — without using Promise.all (the tests disable it 😉).
function promiseAll(items) {
  // - returns a Promise
  // - items can be promises OR plain values (Promise.resolve helps)
  // - resolves with an array of results in the ORIGINAL order
  // - rejects as soon as the first one rejects
  // - an empty array resolves immediately with []
}
