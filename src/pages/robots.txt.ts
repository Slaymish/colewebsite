import type { APIRoute } from 'astro';
import { SITE } from '~/lib/site';

/**
 * The test environment is behind basic auth and sends `X-Robots-Tag: noindex`
 * from CloudFront, but a robots.txt that invites crawling anyway is a mixed
 * signal — so the same flag that noindexes the pages disallows everything here.
 */
const noindex = import.meta.env.PUBLIC_NOINDEX === 'true';

export const GET: APIRoute = () => {
  const body = noindex
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', SITE.origin).href}\n`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
