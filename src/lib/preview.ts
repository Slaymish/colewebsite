/**
 * Inspector mode: click a piece of the rendered page inside Contentful's preview
 * pane and land on the field that produced it.
 *
 * Contentful finds those pieces by data attributes on the DOM, so entry ids have
 * to reach the templates. That is the one thing allowed through the boundary
 * `contentful-map.ts` draws — an opaque id and a field name, never a
 * Contentful-shaped object — which is why every mapped type carries `cmsId` and
 * templates spread `editable()` rather than touching an entry.
 *
 * It does nothing to how quickly an edit appears. The site is statically built,
 * so what Cole clicks is the last build's HTML; this is navigation from the page
 * to the field, not live content.
 */
import { CMS_LOCALE, type ContentTypeId, type FieldOf } from './content-model';
import { IS_PREVIEW } from './site';

/** Contentful reads these off the DOM; the names are the SDK's, not ours. */
interface EditableAttributes {
  'data-contentful-entry-id': string;
  'data-contentful-field-id': string;
  'data-contentful-locale': string;
}

export type EditableProps = EditableAttributes | Record<string, never>;

/**
 * Attributes marking an element as one field of one entry, or nothing at all —
 * on a production build, or for placeholder content, which has no entry behind
 * it. Spread it: `<h1 {...editable('project', project.cmsId, 'title')}>`.
 */
export function editable<K extends ContentTypeId>(
  // Never read at runtime: it is here to bind K, which is what narrows `field`
  // to the ids that content type actually has.
  _kind: K,
  cmsId: string,
  field: FieldOf<K>,
): EditableProps {
  if (!IS_PREVIEW || !cmsId) return {};

  return {
    'data-contentful-entry-id': cmsId,
    'data-contentful-field-id': field,
    'data-contentful-locale': CMS_LOCALE,
  };
}
