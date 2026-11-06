// Runs before first paint. Keep the key in sync with src/lib/lab/state.ts.
(() => {
  let properties = {};
  try {
    properties =
      JSON.parse(sessionStorage.getItem('cole-site-lab-properties') || '{}') || {};
  } catch {
    /* The lab applies itself again once its module loads. */
  }
  for (const [name, value] of Object.entries(properties)) {
    if (name.startsWith('--') && typeof value === 'string')
      document.documentElement.style.setProperty(name, value);
  }
})();
