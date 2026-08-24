/**
 * Turns the palette in `siteSettings` into a `<style>` block for the document.
 *
 * ---------------------------------------------------------------------------
 * WHY THE OVERRIDE LANDS ON `--cms-*` AND NOT ON THE SEMANTIC NAMES
 * ---------------------------------------------------------------------------
 * §2 of tokens.css uses `@theme inline`, and Tailwind compiles an inline theme
 * value straight into the utility: `.bg-page` becomes
 * `background-color: var(--raw-page)`, and `--color-page` is never emitted to
 * `:root` at all. So setting `--color-page` at runtime does nothing whatsoever,
 * with no error and nothing in the build output to notice. The raw layer is the
 * only override point there is.
 *
 * The raws in turn read `var(--cms-*, <default>)`, and nothing but this module
 * ever sets a `--cms-*`. That matters: overriding `--raw-*` here directly would
 * put two `:root` rules of equal specificity in play, and which one won would
 * depend on whether Astro's stylesheet link lands before or after this block —
 * true today, and not something the framework promises.
 */
import type { SiteTheme } from './content-types';

/** Which custom property each slot writes. Read tokens.css §1 alongside this. */
const CUSTOM_PROPERTY = {
  ground: '--cms-page',
  ink: '--cms-ink',
  accent: '--cms-accent',
  accentDeep: '--cms-accent-deep',
  accentWarm: '--cms-accent-warm',
} as const satisfies Record<keyof SiteTheme, string>;

const SLOTS = Object.keys(CUSTOM_PROPERTY) as (keyof SiteTheme)[];

/**
 * The stylesheet for a palette, or an empty string when Cole has set no colour —
 * in which case the caller renders no `<style>` element and tokens.css stands.
 *
 * Values reaching here are hex colours: `toHexColour` in contentful-map.ts is
 * what makes interpolating into CSS safe, and it is the only way a value gets in.
 */
export function themeStyle(theme: SiteTheme): string {
  const declarations = SLOTS.filter((slot) => theme[slot] !== null).map(
    (slot) => `${CUSTOM_PROPERTY[slot]}:${theme[slot]}`,
  );

  return declarations.length > 0 ? `:root{${declarations.join(';')}}` : '';
}
