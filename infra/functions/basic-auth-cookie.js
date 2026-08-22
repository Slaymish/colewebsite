/**
 * CloudFront Function, viewer-response. Test environment only.
 *
 * Turns one successful sign-in into a cookie, so Cole is asked for the password
 * once rather than every time his browser forgets it.
 *
 * This is a *response* function on purpose. The obvious alternative — a 302 with
 * Set-Cookie from the request function — loops forever in exactly the case that
 * matters: a browser that refuses the cookie but keeps replaying the cached
 * Authorization header would be redirected, re-authorised and redirected again.
 * Setting the cookie on the way out cannot loop, because nothing is retried.
 *
 * Two cookies, because no single set of attributes works everywhere:
 *   preview_auth              SameSite=None — sent in an iframe by browsers that
 *                             still allow third-party cookies at all
 *   preview_auth_partitioned  the same, plus Partitioned (CHIPS) — the supported
 *                             route for embedded content, but keyed to the
 *                             embedding site, so it only exists in the partition
 *                             where it was set
 *
 * Whichever the browser honours, the request function accepts.
 */
var EXPECTED = '__BASIC_AUTH_TOKEN__';
var TOKEN = EXPECTED.indexOf(' ') > -1 ? EXPECTED.split(' ')[1] : EXPECTED;
var MAX_AGE = 7776000; // 90 days
var BASE = 'Path=/; Secure; HttpOnly; SameSite=None; Max-Age=' + MAX_AGE;

function alreadyHeld(request) {
  var cookie = (request.cookies || {}).preview_auth;
  return !!cookie && cookie.value === TOKEN;
}

function signedIn(request) {
  var key = request.querystring && request.querystring.preview_key;
  if (key && key.value === TOKEN) return true;
  var auth = request.headers.authorization;
  return !!auth && auth.value === EXPECTED;
}

function handler(event) {
  var request = event.request;
  var response = event.response;

  if (signedIn(request) && !alreadyHeld(request)) {
    response.cookies = response.cookies || {};
    response.cookies.preview_auth = { value: TOKEN, attributes: BASE };
    response.cookies.preview_auth_partitioned = {
      value: TOKEN,
      attributes: BASE + '; Partitioned',
    };
  }

  return response;
}
