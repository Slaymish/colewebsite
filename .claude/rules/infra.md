---
description: CDK infrastructure and deployment workflows
paths:
  - "infra/**"
  - ".github/workflows/**"
---

# Infrastructure

`infra/` is a **separate pnpm project** — its own lockfile, its own tsconfig, its
own node_modules. Install and run everything from inside it, and use
`pnpm exec cdk`, never `npx cdk`: npx answers a broken local install by fetching
the toolkit from the registry, so the app then dies on a missing `aws-cdk-lib`
rather than on the install that actually failed.

Read `infra/README.md` before changing a stack. The price class, the real-404
behaviour, the OIDC provider import and the role-name suffixes are each recorded
there with the reason they exist.

## Things that are conditional on purpose

- The site stacks declare themselves only when `zoneName`, `hostedZoneId` and
  `certificateArn` are all in context. With none of them, `bin/infra.ts`
  synthesises the OIDC stack alone. That is the correct state until the domain
  exists — do not hardcode a domain to "fix" a stack that will not synthesise.
- `OIDC_PROVIDER_ARN` is required: the account already holds a GitHub OIDC
  provider, one per URL is the limit, and without it CDK plans a second one and
  the deploy fails.
- `infra/functions/*.js` are CloudFront Functions on their own runtime. `handler`
  is a global entrypoint, never referenced in-file, which is why eslint's
  unused-vars rule is off for that directory.

## Deploys

Nothing deploys from a laptop. `deploy.yml` builds and ships content on push to
`main`, on a Contentful `repository_dispatch`, or by manual dispatch for
production; `infra.yml` is manual-only for `cdk diff` / `cdk deploy`. Running
`cdk diff` or `cdk synth` locally is fine and encouraged.

The upload is two passes and the order matters: hashed immutable assets first,
then HTML with `--delete`, so no freshly deployed page can reference an asset that
is not there yet. A CSP change in `site-stack.ts` constrains `astro.config.mjs` —
both environments send `script-src 'self'` with no `'unsafe-inline'`, which is why
`assetsInlineLimit` is 0.

`cdk diff` diffs every stack already; `--all` is deploy-only and earns
"Unknown option(s): --all" anywhere else.
