// Goal: neutralise user input before it goes into HTML (stops XSS).
function escapeHtml(value) {
  // replace & < > " '  with their HTML entities:  &amp; &lt; &gt; &quot; &#39;
  // careful with the ORDER — & must be replaced first!
  // null / undefined → '' ; other types → String(value)
}
