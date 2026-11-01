// Also used by the blocking first-paint bootstrap in public/scripts/gallery-preference.js.
const key = 'cole-illustration-gallery';
export interface GalleryState {
  view: 'flight' | 'grid';
  flightProgress: number;
  gridProgress: number;
}
export const GALLERY_OFFSETS = [
  [-23, -10],
  [24, 12],
  [-18, 16],
  [22, -16],
  [-25, 5],
  [19, 18],
];
export function readGalleryState(): GalleryState {
  let saved: Partial<GalleryState> = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(key) ?? '{}') ?? {};
  } catch {
    /* Defaults remain usable without storage. */
  }
  const number = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
  return {
    view: saved.view === 'grid' ? 'grid' : 'flight',
    flightProgress: number(saved.flightProgress),
    gridProgress: number(saved.gridProgress),
  };
}
export function saveGalleryState(state: GalleryState) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* The current view still works without storage. */
  }
}
export function applyGalleryPreference(root = document.documentElement) {
  const state = readGalleryState();
  root.dataset.galleryView = matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'grid'
    : state.view;
  root.style.setProperty('--gallery-progress', String(state.flightProgress));
}
