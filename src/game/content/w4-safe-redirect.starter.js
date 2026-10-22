// Goal: after login we send the user to ?redirect=... — but only inside OUR site.
// An open redirect lets attackers bounce victims to a phishing page.
function isSafeRedirect(url) {
  // true only for same-site paths such as "/dashboard" or "/profile?tab=2#x"
  // watch out for:  //evil.com   /\evil.com   https://evil.com   javascript:alert(1)
  // and control characters / whitespace that browsers silently strip
}
