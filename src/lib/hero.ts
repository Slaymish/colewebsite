/** Edit this list to change the homepage's reload-by-reload wording. */
export const HERO_PHRASES = [
  { modifier: 'EXTREMLEY', label: 'I am extremley human' },
  { modifier: 'POSITIVELY', label: 'I am positively human' },
  { modifier: 'CERTIFIABLY', label: 'I am certifiably human' },
] as const;

/** Add hero_*.svg files to src/assets; Vite emits URLs, not the SVGs in the JS. */
export const HERO_ARTWORK = Object.values(
  import.meta.glob<string>('../assets/hero_*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
);
