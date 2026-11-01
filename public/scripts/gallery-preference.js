// Runs before first paint. Keep the key in sync with src/lib/gallery-state.ts.
(() => {
  let state = {};
  try {
    state = JSON.parse(sessionStorage.getItem('cole-illustration-gallery') || '{}') || {};
  } catch {
    /* Use the default if browser storage is unavailable. */
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const view = reduced || state.view === 'grid' ? 'grid' : 'flight';
  document.documentElement.dataset.galleryView = view;
  const progress = Number(state.flightProgress);
  if (Number.isFinite(progress) && progress >= 0) {
    document.documentElement.style.setProperty('--gallery-progress', String(progress));
  }
})();
