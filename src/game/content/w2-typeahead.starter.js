// BOSS: debounced search that is immune to out-of-order responses.
//
// const search = createSearch(fetchResults, delay)
// search(query) → Promise
//   • waits `delay` ms; if search() is called again in the meantime,
//     the earlier promise resolves with null and fetchResults is NOT called for it
//   • then calls fetchResults(query) and resolves with its result
//   • if a NEWER search() was made while the request was in flight,
//     the old response is stale → resolve null instead of the old data
//   • if the latest request fails, reject with its error
function createSearch(fetchResults, delay) {

}
