# Infrastructure

CDK app defining five stacks:

| Stack                  | What it is                                              |
| ---------------------- | ------------------------------------------------------- |
| `ColeAndersonOidc`     | The infra and content deploy roles, federated to GitHub |
| `ColeAndersonProd`     | Bucket, distribution and DNS for the canonical domain   |
| `ColeAndersonTest`     | Same, plus basic auth and `X-Robots-Tag: noindex`       |
| `ColeAndersonWww`      | 301s `www` at the apex, on the shared wildcard cert     |
| `ColeAndersonRedirect` | 301s a secondary domain at the canonical one            |

The site stacks need a hosted zone and a certificate, so `bin/infra.ts` declares
them only once `zoneName`, `hostedZoneId` and `certificateArn` are all supplied
and prints a line saying it skipped them otherwise. All three exist now, so the
whole app synthesises — but the certificate cannot validate until the domain is
delegated, so the site stacks cannot deploy yet. See "Before the first deploy".

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
`secondaryCertificateArn` to deploy the redirect stack.

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

## Before the first deploy

1. ~~Deploy `ColeAndersonOidc`, then put its two role ARNs into the repository
   secrets `AWS_INFRA_ROLE_ARN` and `AWS_CONTENT_ROLE_ARN`.~~ **Done** —
   `ColeAndersonOidc` is `CREATE_COMPLETE` and both secrets are set.
2. ~~Create the Route 53 hosted zone for `coleanderson.nz`~~ **Done** —
   `Z06561742DYXOK4WGBYM8`. **Still outstanding: replace the nameservers at
   domainsdirect.nz** — where the domain is registered — with the four the zone
   reports. It is still on the registrar's parking nameservers
   (`ns1.secureparkme.com`, `ns2.secureparkme.com`). Nothing after this works
   until that delegation has propagated: check with
   `dig NS coleanderson.nz @ns1.dns.net.nz` before moving on.
3. ~~Issue **one ACM certificate in us-east-1** covering the apex and the
   wildcard.~~ **Requested, not yet issued** —
   `arn:aws:acm:us-east-1:025513282486:certificate/12a7d52a-abb3-4e2c-8a23-83e5126700ae`.
   CloudFront will not accept a certificate from any other region, and every site
   stack shares this one. Validation is DNS and its CNAME is already in the zone,
   so the certificate issues on its own once step 2 propagates — an undelegated
   zone leaves it sitting at `PENDING_VALIDATION` with no error to read. **ACM
   gives up 72 hours after the request**, which was 2026-08-23 16:22 NZST; past
   that the request has to be made again.
4. ~~Set the repository variable `SITE_DOMAIN`, the variable `ZONE_NAME`, and the
   secrets `HOSTED_ZONE_ID`, `CERTIFICATE_ARN` and
   `TEST_BASIC_AUTH_HEADER`.~~ **Done.**
5. Run the Infrastructure workflow with `deploy`, once the certificate reads
   `ISSUED`.
6. Set an AWS Budgets alarm at US$10/month.

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
