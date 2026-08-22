/**
 * CloudFront Function, viewer-request.
 *
 * S3 as a plain origin (not a website endpoint) will not resolve /about on its
 * own, and Astro builds with `format: 'directory'`, so map clean URLs onto the
 * index.html files that actually exist.
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }

  return request;
}
