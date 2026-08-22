/**
 * CloudFront Function, viewer-request. Secondary-domain distribution only.
 *
 * Permanently redirects the non-canonical domain to the canonical one, keeping the
 * path, so the two domains never serve duplicate content.
 */
var CANONICAL_ORIGIN = '__CANONICAL_ORIGIN__';

function handler(event) {
  var request = event.request;
  var query = '';
  var keys = Object.keys(request.querystring);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    query += (i === 0 ? '?' : '&') + key + '=' + request.querystring[key].value;
  }

  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: CANONICAL_ORIGIN + request.uri + query },
      'cache-control': { value: 'max-age=3600' },
    },
  };
}
