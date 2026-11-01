/** Edit this list to change the homepage's reload-by-reload wording. */
export const HERO_PHRASES = [
  { modifier: 'EXTREMLEY', label: 'I am extremley human' },
  { modifier: 'POSITIVELY', label: 'I am positively human' },
  { modifier: 'CERTIFIABLY', label: 'I am certifiably human' },
] as const;

/** Add hero_*.svg files to src/assets; Vite emits URLs, not the SVGs in the JS. */
export const HERO_ILLUSTRATIONS = Object.entries(
  import.meta.glob<string>('../assets/hero_*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, url]) => ({ id: path.split('/').pop()!.replace('.svg', ''), url }));

export const HERO_ARTWORK = HERO_ILLUSTRATIONS.map(({ url }) => url);
export const HERO_ROTATION = { interval: 0.65, reducedInterval: 4 } as const;
