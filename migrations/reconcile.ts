/**
 * Makes the `contentful-migration` DSL idempotent.
 *
 * Definitions in `./definitions` are authored as *desired state*: each one
 * declares a content type and every field it should have. `contentful-migration`
 * is forward-only on its own — `createContentType`/`createField` throw when the
 * target already exists — so re-running a definition, or editing one and running
 * it again, fails.
 *
 * This wraps the DSL in a Proxy that consults a snapshot of the live model and
 * rewrites calls:
 *
 *   createContentType → editContentType   when the type already exists
 *   editContentType   → createContentType when it does not (a fresh space)
 *   createField       → editField         when the field already exists
 *   editField         → createField       when it does not
 *   deleteField / moveField / changeFieldId → skipped when the field is absent
 *
 * So every definition can run any number of times against any environment, and
 * drives it toward what the definition declares. It never removes a field on its
 * own: fields dropped from a definition are reported as orphans, and pruning
 * them is the explicit `--prune` path in run.ts, because deleting a field
 * deletes Cole's content in it.
 *
 * Ported from the Beth Hurley site, which took it from the Alphero 2026 site,
 * trimmed to what a three-type space needs.
 */
import type {
  MigrationFunction,
  IContentTypeOptions,
  IFieldOptions,
} from 'contentful-migration';

export interface ContentfulConfig {
  spaceId: string;
  environmentId: string;
  accessToken: string;
}

/** Content-type id → the field ids that exist in the CMS right now. */
export type ModelState = Map<string, Set<string>>;

/**
 * Snapshot the live content model. A type exists if `state.has(id)`; its current
 * fields are `state.get(id)`.
 */
export async function fetchModelState(config: ContentfulConfig): Promise<ModelState> {
  const { createClient } = await import('contentful-management');
  const client = createClient({ accessToken: config.accessToken });

  const { items } = await client.contentType.getMany({
    spaceId: config.spaceId,
    environmentId: config.environmentId,
    query: { limit: 1000 },
  });

  const state: ModelState = new Map();
  for (const contentType of items) {
    state.set(
      contentType.sys.id,
      new Set(contentType.fields.map((field: { id: string }) => field.id)),
    );
  }
  return state;
}

// moveField on a field that does not exist yet would throw. Hand back an inert
// movement so a definition that orders its fields still runs on a fresh space.
const NOOP_MOVEMENT = {
  toTheTop() {},
  toTheBottom() {},
  beforeField() {},
  afterField() {},
};

function bindMember(target: object, prop: string | symbol) {
  const value = Reflect.get(target, prop);
  return typeof value === 'function' ? value.bind(target) : value;
}

/**
 * Wrap one content type. `existing` is its live field set — empty for a type
 * being created — and `declaredFields` collects every field the definition asks
 * for, which is what orphan detection later compares against.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- the migration DSL is untyped
   at the object level; the Proxy hands back whatever the SDK gave us. */
function wrapContentType(
  realContentType: any,
  existing: Set<string>,
  declaredFields: Set<string>,
): any {
  return new Proxy(realContentType, {
    get(target, prop) {
      switch (prop) {
        case 'createField':
        case 'editField':
          return (id: string, opts: IFieldOptions) => {
            declaredFields.add(id);
            return existing.has(id)
              ? target.editField(id, opts)
              : target.createField(id, opts);
          };
        case 'deleteField':
          return (id: string) => {
            declaredFields.delete(id);
            if (!existing.has(id)) return; // already gone
            return target.deleteField(id);
          };
        case 'moveField':
          return (id: string) =>
            existing.has(id) || declaredFields.has(id)
              ? target.moveField(id)
              : NOOP_MOVEMENT;
        case 'changeFieldId':
          return (oldId: string, newId: string) => {
            if (!existing.has(oldId)) return; // source gone
            declaredFields.delete(oldId);
            declaredFields.add(newId);
            return target.changeFieldId(oldId, newId);
          };
        default:
          return bindMember(target, prop);
      }
    },
  });
}

/**
 * Wrap a definition so its create/edit calls reconcile against `state`.
 * `declared` is shared across the whole run and accumulates the desired schema.
 */
export function createReconcilingMigration(
  realMigration: MigrationFunction,
  state: ModelState,
  declared: Map<string, Set<string>>,
): MigrationFunction {
  return (migration, context) => {
    const proxy = new Proxy(migration, {
      get(target, prop) {
        switch (prop) {
          case 'createContentType':
          case 'editContentType':
            return (id: string, opts: IContentTypeOptions) => {
              const declaredFields = declared.get(id) ?? new Set<string>();
              declared.set(id, declaredFields);
              const existing = state.get(id) ?? new Set<string>();
              const realContentType = state.has(id)
                ? target.editContentType(id, opts)
                : target.createContentType(id, opts);
              return wrapContentType(realContentType, existing, declaredFields);
            };
          case 'deleteContentType':
            return (id: string) => {
              declared.delete(id);
              return target.deleteContentType(id);
            };
          default:
            return bindMember(target, prop);
        }
      },
    });

    return realMigration(proxy as never, context);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Fields in the CMS that no definition asked for. Only declared content types
 * are considered, so anything Cole adds by hand to a type we do not manage is
 * left alone.
 */
export function findOrphans(
  finalState: ModelState,
  declared: Map<string, Set<string>>,
): Map<string, string[]> {
  const orphans = new Map<string, string[]>();
  for (const [contentTypeId, declaredFields] of declared) {
    const current = finalState.get(contentTypeId);
    if (!current) continue;
    const extra = [...current].filter((id) => !declaredFields.has(id));
    if (extra.length > 0) orphans.set(contentTypeId, extra);
  }
  return orphans;
}

/**
 * A synthetic migration that deletes the given orphaned fields. Destructive:
 * `deleteField` omits, publishes, then deletes, discarding whatever Cole wrote
 * in that field.
 */
export function createPruneMigration(orphans: Map<string, string[]>): MigrationFunction {
  return (migration) => {
    for (const [contentTypeId, fieldIds] of orphans) {
      const contentType = migration.editContentType(contentTypeId);
      for (const fieldId of fieldIds) contentType.deleteField(fieldId);
    }
  };
}
