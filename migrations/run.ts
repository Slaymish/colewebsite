#!/usr/bin/env tsx
/**
 * Applies the content model in `./definitions` to one Contentful environment.
 *
 * Definitions declare desired state and the runner reconciles the space toward
 * it, so **runs are idempotent**. Changing a field means editing the definition
 * that owns it and running this again — not adding a numbered file. There is no
 * ledger to keep because a re-run is a no-op by construction, which is the whole
 * reason this replaced the append-only runner it grew out of.
 *
 *   pnpm cf:migrate                          # the whole model, on master
 *   pnpm cf:migrate -- --env test            # somewhere safe to rehearse
 *   pnpm cf:migrate -- work                  # only definitions matching "work"
 *   pnpm cf:migrate -- --prune               # report fields no definition claims
 *   pnpm cf:migrate -- --prune --apply       # ...and delete them (destructive)
 *
 * Removing a field from a definition does not remove it from Contentful. It is
 * reported as an orphan and left alone, because deleting a field deletes what
 * Cole wrote in it. `--prune --apply` is the only path that deletes, and it says
 * so twice before doing it.
 */
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { runMigration } from 'contentful-migration';
import type { MigrationFunction } from 'contentful-migration';
import {
  fetchModelState,
  createReconcilingMigration,
  createPruneMigration,
  findOrphans,
  type ContentfulConfig,
} from './reconcile';

const here = import.meta.dirname;

// Node reads .env for `astro dev` but not for a script run directly, and the
// missing token is otherwise an error three steps later.
try {
  process.loadEnvFile(path.resolve(here, '../.env'));
} catch {
  // No .env — the variables may already be exported, so let the check below rule.
}

interface Cli {
  environmentId: string;
  filter?: string;
  yes: boolean;
  prune: boolean;
  apply: boolean;
}

function parseArgs(argv: string[]): Cli {
  const flagValue = (name: string) => {
    const index = argv.indexOf(`--${name}`);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  return {
    environmentId: flagValue('env') ?? 'master',
    filter: argv.find((arg, i) => !arg.startsWith('--') && argv[i - 1] !== '--env'),
    yes: argv.includes('--yes'),
    prune: argv.includes('--prune'),
    apply: argv.includes('--apply'),
  };
}

/**
 * Every missing variable at once. Being told about the space id, fixing it, and
 * then being told about the token is two round trips for one mistake.
 */
function loadConfig(cli: Cli): ContentfulConfig {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

  const missing = [
    spaceId ? null : 'CONTENTFUL_SPACE_ID',
    accessToken
      ? null
      : 'CONTENTFUL_MANAGEMENT_TOKEN (a management token, not a delivery one)',
  ].filter((name): name is string => name !== null);

  if (missing.length > 0) {
    throw new Error(
      `Set these in .env or the environment:\n${missing.map((n) => `  - ${n}`).join('\n')}`,
    );
  }

  return {
    spaceId: spaceId as string,
    accessToken: accessToken as string,
    environmentId: cli.environmentId,
  };
}

const DEFINITION_FILE = /^\d{2}-.*\.ts$/;

async function loadDefinition(file: string, dir: string): Promise<MigrationFunction> {
  const module: { default?: MigrationFunction } = await import(
    pathToFileURL(path.join(dir, file)).href
  );
  if (typeof module.default !== 'function') {
    throw new Error(`${file} has no default-exported migration function`);
  }
  return module.default;
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));

  // master is the only content environment and holds Cole's live entries.
  if (cli.environmentId === 'master' && !cli.yes) {
    throw new Error(
      'Refusing to touch master without --yes. It is the only content environment ' +
        "and holds Cole's live entries — rehearse anything non-trivial on a " +
        'throwaway environment first (--env test).',
    );
  }

  const config = loadConfig(cli);
  const definitionsDir = path.resolve(here, 'definitions');
  const files = (await readdir(definitionsDir))
    .filter((file) => DEFINITION_FILE.test(file))
    .sort()
    .filter((file) => !cli.filter || file.includes(cli.filter));

  if (files.length === 0) {
    throw new Error(
      cli.filter ? `No definitions matched "${cli.filter}".` : 'No definitions found.',
    );
  }

  console.warn(
    `Reconciling ${files.length} definition(s) against ${config.spaceId} / ${config.environmentId}\n`,
  );

  // The desired schema, accumulated across the run: content type → field ids.
  const declared = new Map<string, Set<string>>();

  for (const file of files) {
    // Re-snapshot per file so a definition that edits a type created earlier in
    // this same run resolves against what now exists.
    const state = await fetchModelState(config);
    const migrationFunction = createReconcilingMigration(
      await loadDefinition(file, definitionsDir),
      state,
      declared,
    );

    console.warn(`→ ${file}`);
    await runMigration({
      migrationFunction,
      spaceId: config.spaceId,
      environmentId: config.environmentId,
      accessToken: config.accessToken,
      yes: true,
    });
  }

  const orphans = findOrphans(await fetchModelState(config), declared);

  if (orphans.size === 0) {
    console.warn(`\nDone. ${config.environmentId} matches the definitions.`);
    return;
  }

  console.warn('\nFields in Contentful that no definition claims:');
  for (const [contentTypeId, fields] of orphans) {
    console.warn(`  ${contentTypeId}: ${fields.join(', ')}`);
  }

  if (!cli.prune) {
    console.warn('\nLeft in place. `--prune` reports what removing them would do.');
    return;
  }

  if (!cli.apply) {
    console.warn(
      '\nDRY RUN — nothing deleted. Re-run with `--prune --apply` to delete these ' +
        'fields and everything Cole has written in them.',
    );
    return;
  }

  console.warn('\nDeleting those fields and their content...');
  await runMigration({
    migrationFunction: createPruneMigration(orphans),
    spaceId: config.spaceId,
    environmentId: config.environmentId,
    accessToken: config.accessToken,
    yes: true,
  });
  console.warn(`Done. ${config.environmentId} now matches the definitions exactly.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
