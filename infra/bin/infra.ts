#!/usr/bin/env node
import { App, Environment } from 'aws-cdk-lib';
import { SiteStack } from '../lib/site-stack.js';
import { RedirectStack } from '../lib/redirect-stack.js';
import { ExternalDnsStack } from '../lib/external-dns-stack.js';
import { GithubOidcStack } from '../lib/github-oidc-stack.js';

const app = new App();

/**
 * Everything below is driven by CDK context so no account id, zone id or
 * credential is committed. Set them in cdk.context.json (gitignored) or pass
 * with -c on the command line. See infra/README.md.
 */
const required = (key: string): string => {
  const value = app.node.tryGetContext(key);
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required CDK context: ${key}`);
  }
  return value;
};

const optional = (key: string): string | undefined => {
  const value = app.node.tryGetContext(key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const env: Environment = {
  account: required('account'),
  region: app.node.tryGetContext('region') ?? 'ap-southeast-2',
};

new GithubOidcStack(app, 'ColeAndersonOidc', {
  env,
  repository: required('repository'),
  ownerId: optional('ownerId'),
  repositoryId: optional('repositoryId'),
  contentEnvironments: ['test', 'production'],
  infraEnvironments: ['infrastructure'],
  // This account already has a GitHub OIDC provider, created by the Beth Hurley
  // site. An account may hold only one per URL, so it is imported rather than
  // created — omitting this fails with EntityAlreadyExistsException.
  existingProviderArn: optional('oidcProviderArn'),
});

/**
 * The site stacks need a hosted zone and a certificate, which cannot exist until
 * the domain is registered and delegated. They are declared only once that
 * context is supplied, so the OIDC stack can deploy on its own in the meantime.
 * The domain exists now, the zone and certificate do not — see README.md,
 * "Before the first deploy".
 */
const zoneName = optional('zoneName');
const hostedZoneId = optional('hostedZoneId');
// One certificate covering the apex plus the wildcard, issued in us-east-1 and
// shared by every distribution below.
const certificateArn = optional('certificateArn');

if (!zoneName || !hostedZoneId || !certificateArn) {
  console.warn(
    'Skipping the site stacks: zoneName, hostedZoneId and certificateArn are ' +
      'not all set. The hosted zone and certificate do not exist yet.',
  );
} else {
  defineSiteStacks({ zoneName, hostedZoneId }, certificateArn);
}

function defineSiteStacks(
  hostedZone: { zoneName: string; hostedZoneId: string },
  certificateArn: string,
): void {
  /**
   * Cole's Adobe Portfolio serves the live domain, so the apex and www point at
   * its addresses while this site is still being built behind test.<domain>.
   *
   * Everything below stays deployed while that is true — only the records move.
   * Clear `externalApexIps` and redeploy to take both hostnames back; there is
   * nothing else to undo.
   */
  const externalApexIps = (optional('externalApexIps') ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter((address) => address.length > 0);
  const apexIsExternal = externalApexIps.length > 0;

  const prod = new SiteStack(app, 'ColeAndersonProd', {
    env,
    siteEnv: 'prod',
    domainName: hostedZone.zoneName,
    hostedZone,
    certificateArn,
    manageDns: !apexIsExternal,
  });

  new SiteStack(app, 'ColeAndersonTest', {
    env,
    siteEnv: 'test',
    domainName: `test.${hostedZone.zoneName}`,
    hostedZone,
    certificateArn,
    // Pass with: -c basicAuthHeader="Basic $(printf 'cole:pw' | base64)"
    basicAuthHeader: required('basicAuthHeader'),
    noindex: true,
  });

  // www 301s at the apex rather than serving it, so one hostname carries every
  // search signal. The wildcard half of the shared certificate already covers
  // www, so this needs no certificate of its own.
  const www = new RedirectStack(app, 'ColeAndersonWww', {
    env,
    fromDomain: `www.${hostedZone.zoneName}`,
    toOrigin: `https://${hostedZone.zoneName}`,
    hostedZone,
    certificateArn,
    // The external host serves www itself, so while the apex is theirs this
    // redirect has nothing to redirect and its records would fight theirs.
    manageDns: !apexIsExternal,
  });

  if (apexIsExternal) {
    const external = new ExternalDnsStack(app, 'ColeAndersonExternalDns', {
      env,
      hostedZone,
      domainNames: [hostedZone.zoneName, `www.${hostedZone.zoneName}`],
      addresses: externalApexIps,
    });
    // Route 53 refuses to put an A record over a name that still holds an alias
    // A, and reports it as "already exists" against this stack rather than
    // against the one still holding it. The two owners have to let go first, and
    // only a stack dependency orders the deploy that way.
    external.addStackDependency(prod, 'must release the apex records first');
    external.addStackDependency(www, 'must release the www records first');
  }

  const secondaryDomain = optional('secondaryDomain');
  if (secondaryDomain) {
    new RedirectStack(app, 'ColeAndersonRedirect', {
      env,
      fromDomain: secondaryDomain,
      toOrigin: `https://${hostedZone.zoneName}`,
      hostedZone: {
        zoneName: secondaryDomain,
        hostedZoneId: required('secondaryHostedZoneId'),
      },
      certificateArn: required('secondaryCertificateArn'),
    });
  }
}
