#!/usr/bin/env node
/**
 * Creates or updates the Contentful webhook that rebuilds the test site when
 * Cole publishes. Without it, publishing changes the CMS and nothing else.
 *
 *   GITHUB_DISPATCH_TOKEN=github_pat_... node scripts/setup-webhook.mjs
 *
 * It POSTs to GitHub's repository-dispatch endpoint with
 * `{"event_type":"contentful-publish"}`, which is the trigger `deploy.yml`
 * already listens for.
 *
 * Scoped to `master`, which is the only content environment. A repository_dispatch
 * run carries no workflow inputs, so `deploy.yml` falls through to a test deploy —
 * which reads master through the Preview API. Production never deploys on its own,
 * by design, so a publish updates the test site and nothing else.
 *
 * Idempotent: matches the existing webhook by name and updates it in place.
 */
const API = 'https://api.contentful.com';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const repository = flag('repo', 'Slaymish/colewebsite');
const cmsEnvironment = flag('env', 'master');
// The name is the identity this script matches on, so it must NOT vary with the
// environment: naming it per-environment meant a re-run with a different --env
// created a second webhook and left the first firing on nothing.
const name = flag('name', 'GitHub — rebuild site');

const space = process.env.CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const dispatchToken = process.env.GITHUB_DISPATCH_TOKEN;

if (!space || !token || !dispatchToken) {
  console.error(
    'Requires CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN (both in .env)\n' +
      'plus GITHUB_DISPATCH_TOKEN — a fine-grained PAT on ' +
      `${repository} with Contents: read and write.\n\n` +
      'Usage: GITHUB_DISPATCH_TOKEN=... node scripts/setup-webhook.mjs ' +
      '[--repo owner/name] [--env master]',
  );
  process.exit(1);
}

// Publishing is the trigger, not saving. The test site reads the Preview API, so
// a draft is already visible via the entry's preview button; rebuilding on every
// autosave would queue a deploy per keystroke.
const topics = [
  'Entry.publish',
  'Entry.unpublish',
  'Entry.delete',
  'Asset.publish',
  'Asset.unpublish',
  'Asset.delete',
];

const definition = {
  name,
  url: `https://api.github.com/repos/${repository}/dispatches`,
  topics,
  filters: [{ equals: [{ doc: 'sys.environment.sys.id' }, cmsEnvironment] }],
  headers: [
    { key: 'Accept', value: 'application/vnd.github+json' },
    { key: 'X-GitHub-Api-Version', value: '2022-11-28' },
    // Not optional. GitHub rejects any API request without a User-Agent as a 403
    // "forbidden by administrative rules", and Contentful sends none of its own.
    // curl supplies one automatically, so a hand-rolled test passes where the
    // webhook fails — this was found by publishing, not by probing.
    { key: 'User-Agent', value: 'contentful-webhook-coleanderson-site' },
    // `secret: true` stores it write-only — Contentful redacts it on read, so it
    // cannot be recovered from the webhook config later. Keep a copy elsewhere.
    { key: 'Authorization', value: `Bearer ${dispatchToken}`, secret: true },
  ],
  transformation: {
    method: 'POST',
    contentType: 'application/json',
    body: { event_type: 'contentful-publish' },
  },
};

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/vnd.contentful.management.v1+json',
};

const listResponse = await fetch(`${API}/spaces/${space}/webhook_definitions`, {
  headers,
});
if (!listResponse.ok) {
  console.error(`Could not list webhooks: ${listResponse.status}`);
  process.exit(1);
}

const { items = [] } = await listResponse.json();
const existing = items.find((item) => item.name === name);
const body = JSON.stringify(definition);

const response = existing
  ? await fetch(`${API}/spaces/${space}/webhook_definitions/${existing.sys.id}`, {
      method: 'PUT',
      headers: { ...headers, 'X-Contentful-Version': String(existing.sys.version) },
      body,
    })
  : await fetch(`${API}/spaces/${space}/webhook_definitions`, {
      method: 'POST',
      headers,
      body,
    });

if (!response.ok) {
  console.error(`Failed: ${response.status} ${await response.text()}`);
  process.exit(1);
}

const saved = await response.json();
console.warn(
  `${existing ? 'Updated' : 'Created'} webhook "${name}" (${saved.sys.id})\n` +
    `  ${definition.url}\n` +
    `  on ${topics.length} topics, filtered to the ${cmsEnvironment} environment\n\n` +
    'Publish something in Contentful to test it. Contentful logs every call under\n' +
    'Settings → Webhooks → this webhook → Activity log; a 204 is success.',
);
