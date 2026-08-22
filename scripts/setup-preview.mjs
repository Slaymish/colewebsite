#!/usr/bin/env node
/**
 * Creates or updates a Contentful content preview, which is what puts the
 * "Open preview" button on an entry. One of these does more for making the CMS
 * feel intuitive than any written guide, because it closes the loop between
 * editing and seeing.
 *
 *   node scripts/setup-preview.mjs --name "Test site" --base https://test.example.nz \
 *     --key "$(printf 'cole:somepassword' | base64)"
 *
 * --key is the base64 half of the test site's basic-auth credential. It is
 * appended to every preview URL as ?preview_key=, which is how the editor's
 * iframe gets past the gate: a cross-site frame cannot rely on a basic-auth
 * prompt appearing, nor on a cookie set elsewhere being sent. The URL carries
 * its own way in, and basic-auth-cookie.js turns that into a cookie so the key
 * is only needed for the first request of a session.
 *
 * Previews are space-level, so one configuration serves every environment.
 */
const API = 'https://api.contentful.com';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const name = flag('name');
const base = flag('base');
const key = flag('key');
const description = flag('description', `Opens this entry on ${base}.`);

const space = process.env.CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!name || !base || !space || !token) {
  console.error(
    'Usage: --name "Test site" --base https://test.example.nz\n' +
      'Requires CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN.',
  );
  process.exit(1);
}

// Only content types with a page of their own get a preview URL. Site settings
// has none: it is configuration that every page reads.
const suffix = key ? `?preview_key=${encodeURIComponent(key)}` : '';
const configurations = [
  { contentType: 'project', url: `${base}/project/{entry.fields.slug}${suffix}` },
  { contentType: 'about', url: `${base}/about${suffix}` },
].map((c) => ({ ...c, enabled: true }));

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/vnd.contentful.management.v1+json',
};

const listResponse = await fetch(`${API}/spaces/${space}/preview_environments`, {
  headers,
});
if (!listResponse.ok) {
  console.error(`Could not list previews: ${listResponse.status}`);
  process.exit(1);
}

const { items = [] } = await listResponse.json();
const existing = items.find((item) => item.name === name);
const body = JSON.stringify({ name, description, configurations });

const response = existing
  ? await fetch(`${API}/spaces/${space}/preview_environments/${existing.sys.id}`, {
      method: 'PUT',
      headers: { ...headers, 'X-Contentful-Version': String(existing.sys.version) },
      body,
    })
  : await fetch(`${API}/spaces/${space}/preview_environments`, {
      method: 'POST',
      headers,
      body,
    });

if (!response.ok) {
  console.error(`Failed: ${response.status} ${await response.text()}`);
  process.exit(1);
}

console.warn(`${existing ? 'Updated' : 'Created'} preview "${name}" → ${base}`);
