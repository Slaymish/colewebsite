/**
 * CloudFront Function, viewer-request. Test environment only.
 *
 * Three ways in, checked in cost order:
 *   1. the preview cookie, set by basic-auth-cookie.js on the way out
 *   2. ?preview_key=<token>, which is how the Contentful editor's iframe gets in
 *   3. the Authorization header, i.e. the browser's own basic-auth prompt
 *
 * The key exists because a cross-site iframe is not reliably allowed to show a
 * basic-auth prompt, and a cookie set while browsing the site directly is not
 * reliably sent inside one. A URL that authenticates itself sidesteps both.
 *
 * CloudFront Functions cannot read Secrets Manager or make network calls, so the
 * credential is substituted into this source at synth time. Treat it as a lock on
 * a door, not a vault: it keeps the work-in-progress site away from search
 * engines and casual visitors, and nothing more.
 */
var EXPECTED = '__BASIC_AUTH_TOKEN__';
// The base64 half of "Basic dXNlcjpwYXNz" — the header itself has a space in it,
// which is not a legal cookie value.
var TOKEN = EXPECTED.indexOf(' ') > -1 ? EXPECTED.split(' ')[1] : EXPECTED;
var COOKIES = ['preview_auth', 'preview_auth_partitioned'];

function authorised(request) {
  var cookies = request.cookies || {};
  for (var i = 0; i < COOKIES.length; i++) {
    var cookie = cookies[COOKIES[i]];
    if (cookie && cookie.value === TOKEN) return true;
  }

  var key = request.querystring && request.querystring.preview_key;
  if (key && key.value === TOKEN) return true;

  var auth = request.headers.authorization;
  return !!auth && auth.value === EXPECTED;
}

function handler(event) {
  var request = event.request;

  if (!authorised(request)) {
    return {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': { value: 'Basic realm="Preview"' },
        'cache-control': { value: 'no-store' },
      },
    };
  }

  // The key deliberately stays on the request. basic-auth-cookie.js reads it
  // from this same object on the way out, and deleting it here meant the iframe
  // authenticated on every request and was never given a cookie. It does not
  // reach S3 regardless: the cache policy keeps query strings out of the cache
  // key, so CloudFront does not forward them to the origin.

  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }

  return request;
}
