// Goal: a debounce you can cancel (React cleanup!) or flush (run now).
function debounceWithCancel(fn, wait) {
  // debounced(...args)  → like a normal debounce
  // debounced.cancel()  → forget the pending call
  // debounced.flush()   → if a call is pending, run it NOW with the latest args
}
