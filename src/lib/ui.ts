/**
 * Shared vocabulary for the UI primitives in src/components/ui/.
 *
 * Only things two or more primitives need to agree on live here. Variant class
 * maps stay inside the component that owns them — they are that component's
 * design, not shared vocabulary.
 */

/**
 * A piece of media with the dimensions a browser needs before it loads.
 *
 * Declared here rather than in content-types.ts because it is a shape, not a
 * content type: `Figure` takes one, and a primitive that imported from the
 * content model would be a primitive that knows about Cole.
 */
export interface ImageAsset {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/** A link that leaves the site, and so needs rel/target and an announcement. */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

/**
 * Astro builds in directory format, so Astro.url.pathname carries a trailing
 * slash ('/about/') that hrefs written by hand do not ('/about'). Comparing them
 * raw means aria-current never matches and the nav silently loses its current
 * state — no error, just a missing announcement for screen reader users.
 */
export function samePath(a: string, b: string): boolean {
  const strip = (p: string) => p.replace(/\/+$/, '') || '/';
  return strip(a) === strip(b);
}

/**
 * The crops the site uses, as names rather than ratios. A ratio is a design
 * decision on a site made of pictures, so it is a token in tokens.css §2 and a
 * name here — `Figure` and `Placeholder` both take one, which is why the type
 * lives in this file rather than in either of them.
 */
export type Ratio = 'portrait' | 'landscape' | 'wide' | 'square';

/**
 * Which ground a primitive is sitting on. The ink-grounded bands need different
 * neutrals for the same job — a hairline and an empty picture box both invert —
 * and passing a tone is how a primitive gets told, rather than every band
 * overriding three classes from the outside.
 */
export type Tone = 'page' | 'inverse';

/**
 * Pick from a fixed rhythm by position — the alternating column arrangements and
 * crops the index and the process band cycle through.
 *
 * The `?? first` is unreachable: `index % items.length` is in range for any
 * non-empty array, and the tuple type is what makes it non-empty. It is there
 * because `noUncheckedIndexedAccess` cannot see that, and it is cheaper than a
 * non-null assertion at every call site.
 */
export function cycle<T extends readonly [unknown, ...unknown[]]>(
  items: T,
  index: number,
): T[number] {
  const [first] = items;
  return items[index % items.length] ?? first;
}
