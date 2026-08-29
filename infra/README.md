# Infrastructure

CDK app defining six stacks:

| Stack                     | What it is                                              |
| ------------------------- | ------------------------------------------------------- |
| `ColeAndersonOidc`        | The infra and content deploy roles, federated to GitHub |
| `ColeAndersonProd`        | Bucket, distribution and DNS for the canonical domain   |
| `ColeAndersonTest`        | Same, plus basic auth and `X-Robots-Tag: noindex`       |
| `ColeAndersonWww`         | 301s `www` at the apex, on the shared wildcard cert     |
| `ColeAndersonRedirect`    | 301s a secondary domain at the canonical one            |
| `ColeAndersonExternalDns` | Points the apex and `www` at a host that is not ours    |

The site stacks need a hosted zone and a certificate, so `bin/infra.ts` declares
them only once `zoneName`, `hostedZoneId` and `certificateArn` are all supplied
and prints a line saying it skipped them otherwise. All three exist and the site
stacks are deployed — see "Where this stands".

`ColeAndersonExternalDns` is declared only when `externalApexIps` is set, and
`ColeAndersonRedirect` only when `secondaryDomain` is. See "Who serves the apex".

## infra is its own pnpm project

`infra/pnpm-workspace.yaml` exists to stop pnpm walking up to the repo root. The
root carries a `pnpm-workspace.yaml` of its own (for `allowBuilds`), which makes
the root a workspace root — so `pnpm install` run from here would install the
**site's** dependencies, leave infra's untouched, and exit 0.

Install and type-check from inside this directory, and run the toolkit with
`pnpm exec cdk`, never `npx cdk`: npx answers a missing local binary by fetching
the toolkit from the registry and running on, which turns a broken install into a
confusing `Cannot find module 'aws-cdk-lib'`.

## Context

Nothing sensitive is committed. Every value comes from CDK context:

```bash
pnpm exec cdk diff \
  -c account=025513282486 \
  -c repository=Slaymish/colewebsite \
  -c oidcProviderArn=arn:aws:iam::025513282486:oidc-provider/token.actions.githubusercontent.com \
  -c zoneName=coleanderson.nz \
  -c hostedZoneId=Z0123456789ABCDEFGHIJ \
  -c certificateArn=arn:aws:acm:us-east-1:025513282486:certificate/... \
  -c basicAuthHeader="Basic $(printf 'cole:somepassword' | base64)"
```

Add `-c secondaryDomain=...` with its own `secondaryHostedZoneId` and
`secondaryCertificateArn` to deploy the redirect stack, and
`-c externalApexIps=1.2.3.4,5.6.7.8` to park the apex elsewhere.

## What is already true of this AWS account

Account `025513282486` (the `personal` CLI profile) hosts the Beth Hurley site,
so two things are already done and must not be repeated:

- **`ap-southeast-2` is bootstrapped** (CDKToolkit, bootstrap version 32). No
  `cdk bootstrap` is needed. The certificate is imported by ARN rather than
  created, so there is no us-east-1 stack and nothing to bootstrap there either.
- **A GitHub OIDC provider exists.** An account may hold only one per URL, so it
  must be imported rather than created — omit `oidcProviderArn` and the deploy
  fails with `EntityAlreadyExistsException`. The one to pass is:

  ```
  arn:aws:iam::025513282486:oidc-provider/token.actions.githubusercontent.com
  ```

  Verified by synthesising both ways: without it CDK plans a second
  `Custom::AWSCDKOpenIdConnectProvider`; with it, none.

The two IAM role names are suffixed `-coleanderson` for the same reason. Role
names are account-global, and the Beth site already holds `github-infra-deploy`
and `github-content-deploy`.

## Where this stands

Every step below is done and the site stacks are deployed. Kept as a record of
what had to happen and in what order, because none of it is visible from the code.

1. `ColeAndersonOidc` deployed, its two role ARNs in the repository secrets
   `AWS_INFRA_ROLE_ARN` and `AWS_CONTENT_ROLE_ARN`.
2. Route 53 hosted zone `Z06561742DYXOK4WGBYM8` created, and the four nameservers
   it reports put in at domainsdirect.nz in place of the registrar's parking pair
   (`ns1.secureparkme.com`, `ns2.secureparkme.com`). Nothing before this
   delegation propagated worked at all; `dig NS coleanderson.nz @ns1.dns.net.nz`
   is how it was confirmed.
3. **One ACM certificate in us-east-1** covering the apex and the wildcard —
   `arn:aws:acm:us-east-1:025513282486:certificate/12a7d52a-abb3-4e2c-8a23-83e5126700ae`,
   now `ISSUED`. CloudFront will not accept a certificate from any other region,
   and every site stack shares this one. Validation is DNS, and **its CNAME must
   stay in the zone** — ACM re-validates through it at renewal, and renewal is
   silent until it fails. It is in there as
   `_eeedda439c2ffe5e6e6c7a03088008ce.coleanderson.nz`.
4. Repository variables `SITE_DOMAIN` and `ZONE_NAME`, secrets `HOSTED_ZONE_ID`,
   `CERTIFICATE_ARN` and `TEST_BASIC_AUTH_HEADER`.
5. Infrastructure workflow run with `deploy`.

Still outstanding: an AWS Budgets alarm scoped to this site. The account carries
an `account-monthly-cost` budget at US$20 covering everything in it.

## Who serves the apex

`coleanderson.nz` and `www.coleanderson.nz` are served by **Cole's Adobe
Portfolio**, not by this site, and will be until this one is ready to replace it.
`test.coleanderson.nz` is this site.

That is one setting: the repository variable `EXTERNAL_APEX_IPS`, passed to the
app as `externalApexIps`. Non-empty, and `ColeAndersonProd` and `ColeAndersonWww`
build everything except their Route 53 records, while `ColeAndersonExternalDns`
points both hostnames at the addresses given. Empty it and redeploy to take the
two names back — nothing else has to change, because nothing else was undone.

Four things about this that are easy to get wrong:

- **The distributions stay up with no DNS pointing at them.** That is deliberate.
  CloudFront does not require an alternate domain name to resolve to it, and
  holding the name here stops any other distribution, in any account, from
  claiming it while we are not using it.
- **No AAAA record.** Adobe published IPv4 only, and the alias records these
  replaced answered AAAA too. An AAAA left behind would keep sending every
  IPv6-capable visitor — most of them — to CloudFront, and silently.
- **`ColeAndersonExternalDns` depends on the other two stacks.** Route 53 refuses
  to put an A record over a name that still holds an alias A, and reports it as
  "already exists" against the stack trying to create it rather than the one
  still holding it. The dependency is what makes the two owners let go first.
- **The apex still sends HSTS from before the switch.** `max-age` is a year with
  `includeSubdomains`, so anyone who loaded the CloudFront placeholder has the
  name pinned to HTTPS with no click-through. Adobe serves HTTPS on custom
  domains, so this is only a problem in the window before their certificate
  issues — the fix is to wait for it, not to retry over HTTP.

The production content deploy is untouched by this and still uploads to the prod
bucket, where nothing serves it. It is manual-dispatch only, so it will not
happen by accident, and leaving it working is what makes the switch back a DNS
change on its own.

## The test gate, and the Contentful iframe

`test.<domain>` is behind basic auth, and the Contentful editor shows the preview
in an iframe on `app.contentful.com`. Three pieces make that work, and each
exists because the obvious version fails:

- **The test environment is framable, production is not.** Production sends
  `X-Frame-Options: DENY` and `frame-ancestors 'none'`; the test policy drops the
  header (it has no allow-list — `ALLOW-FROM` is dead) and names
  `https://app.contentful.com` in CSP instead. Without this the preview pane is
  blank and nothing reports why.
- **`?preview_key=` on every preview URL.** A cross-site iframe cannot be relied
  on to show a basic-auth prompt, and a cookie set while browsing the site
  directly is not necessarily sent inside one. `pnpm cf:preview -- --key ...`
  writes the key into the preview URLs so the frame authenticates itself.
- **The cookie is set from a viewer-_response_ function.** Doing it with a 302
  and `Set-Cookie` from the request function loops forever in the one case that
  matters — a browser that rejects the cookie but replays the cached
  `Authorization` header. Two cookies go out, one `SameSite=None` and one
  additionally `Partitioned`, because no single set of attributes is honoured by
  every browser.

Treat the credential as a lock on a door, not a vault. It is substituted into the
CloudFront Function source at synth time, because those functions cannot read
Secrets Manager or make network calls.

## Two things not to change without reading why

**`PRICE_CLASS_ALL`.** Australia and New Zealand edge locations are excluded from
the cheaper price classes. Every visitor to this site is in New Zealand, so a
"cost optimisation" here would route all of them through the United States.

**The 404 behaviour.** A 404 returns a real 404 with `/404.html`, not a 200 with
`index.html`. The second is an SPA pattern and it poisons search indexing for a
site whose entire job is being found.
