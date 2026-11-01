import {
  applyGalleryPreference,
  GALLERY_OFFSETS,
  readGalleryState,
  saveGalleryState,
} from '~/lib/gallery-state';
import { glideTo, jumpTo, onScrollFrame } from '~/lib/scroll';

let cleanup = () => {};
let activeGallery: HTMLElement | null = null;
document.addEventListener('astro:before-swap', () => cleanup());

export function setupIllustrationGallery() {
  const gallery = document.querySelector<HTMLElement>('[data-illustration-gallery]');
  if (gallery && gallery === activeGallery) return;
  cleanup();
  activeGallery = gallery;
  if (!gallery) return;
  const controller = new AbortController();
  const { signal } = controller;
  const state = readGalleryState();
  const cards = [...gallery.querySelectorAll<HTMLElement>('[data-illustration-index]')];
  const toggle = gallery.querySelector<HTMLButtonElement>('[data-gallery-view]')!;
  const next = gallery.querySelector<HTMLButtonElement>('[data-gallery-next]')!;
  const instructions = gallery.querySelector<HTMLElement>('[data-gallery-instructions]')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let flight = !motion.matches && state.view === 'flight';
  let frame = 0;
  let saveTimer: number | undefined;
  let pointerFocus = false;
  let lastProgress = NaN;
  let disposed = false;
  const progress = () =>
    Math.max(0, window.scrollY - gallery.offsetTop) / (innerHeight * 0.7);
  const remember = () => {
    if (flight) state.flightProgress = progress();
    else state.gridProgress = window.scrollY / innerHeight;
    saveGalleryState(state);
  };
  const render = () => {
    frame = 0;
    if (!flight || signal.aborted) return;
    const position = progress();
    if (position === lastProgress) return;
    lastProgress = position;
    document.documentElement.style.setProperty('--gallery-progress', String(position));
    cards.forEach((card, index) => {
      const depth = (position - index) * 650;
      const [x = 0, y = 0] = GALLERY_OFFSETS[index % GALLERY_OFFSETS.length] ?? [];
      card.style.transform = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, ${depth}px) rotate(${index % 2 ? 7 : -6}deg)`;
      card.style.visibility = depth > 600 ? 'hidden' : 'visible';
      card.style.opacity = String(
        Math.min(1, Math.max(0.18, 1 + depth / 4000), Math.max(0, (600 - depth) / 150)),
      );
    });
    next.disabled = position >= cards.length - 1 - 0.01;
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(render);
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(remember, 150);
  };
  const setView = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastProgress = NaN;
    const view = flight ? 'flight' : 'grid';
    gallery.dataset.view = view;
    document.documentElement.dataset.galleryView = view;
    const label = flight ? 'View all illustrations' : 'Fly through illustrations';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.hidden = motion.matches;
    instructions.hidden = !flight;
    cards.forEach((card) => {
      card.style.transform = '';
      card.style.visibility = '';
      card.style.opacity = '';
    });
    jumpTo(
      flight
        ? Math.min(state.flightProgress, Math.max(0, cards.length - 1)) *
            innerHeight *
            0.7
        : state.gridProgress * innerHeight,
    );
    render();
  };
  toggle.addEventListener(
    'click',
    () => {
      remember();
      flight = !flight;
      state.view = flight ? 'flight' : 'grid';
      saveGalleryState(state);
      setView();
    },
    { signal },
  );
  next.addEventListener(
    'click',
    () =>
      glideTo(
        gallery.offsetTop +
          Math.min(cards.length - 1, Math.floor(progress() + 0.05) + 1) *
            innerHeight *
            0.7,
      ),
    { signal },
  );
  gallery.addEventListener(
    'pointerdown',
    () => {
      pointerFocus = true;
    },
    { signal, capture: true },
  );
  gallery.addEventListener(
    'keydown',
    () => {
      pointerFocus = false;
    },
    { signal, capture: true },
  );
  cards.forEach((card, index) =>
    card.addEventListener(
      'focus',
      () => {
        // Pointer focus must not move the camera just before selecting an image.
        if (flight && !pointerFocus && card.matches(':focus-visible'))
          glideTo(gallery.offsetTop + index * innerHeight * 0.7);
      },
      { signal },
    ),
  );
  window.addEventListener('scroll', queue, { passive: true, signal });
  window.addEventListener('resize', queue, { signal });
  window.addEventListener('pagehide', remember, { signal });
  const unsubscribe = onScrollFrame(render);
  motion.addEventListener(
    'change',
    () => {
      remember();
      flight = !motion.matches && state.view === 'flight';
      setView();
    },
    { signal },
  );
  cleanup = () => {
    if (disposed) return;
    disposed = true;
    remember();
    controller.abort();
    cancelAnimationFrame(frame);
    window.clearTimeout(saveTimer);
    unsubscribe();
  };
  setView();
}

document.addEventListener('astro:before-swap', (event) =>
  applyGalleryPreference(event.newDocument.documentElement),
);
