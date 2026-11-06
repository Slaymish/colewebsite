import { HERO_ARTWORK, HERO_ILLUSTRATIONS, HERO_PHRASES } from '~/lib/hero';
import { labValues, onLabChange } from '~/lib/lab/state';

let cleanup = () => {};
document.addEventListener('astro:before-swap', () => cleanup());

export function setupHero() {
  cleanup();
  const hero = document.querySelector<HTMLElement>('[data-home-hero]');
  if (!hero) return;
  const controller = new AbortController();
  const { signal } = controller;
  const title = hero.querySelector('h1')!;
  const modifier = hero.querySelector<HTMLElement>('[data-hero-modifier]')!;
  const art = hero.querySelector<HTMLElement>('.hero__art')!;
  const pause = hero.querySelector<HTMLButtonElement>('[data-hero-pause]')!;
  const phrase =
    HERO_PHRASES[Math.floor(Math.random() * HERO_PHRASES.length)] ?? HERO_PHRASES[0];
  title.setAttribute('aria-label', phrase.label);
  modifier.textContent = phrase.modifier;

  const params = new URLSearchParams(location.search);
  const selected = HERO_ILLUSTRATIONS.findIndex(
    ({ id }) => id === params.get('illustration'),
  );
  let currentArtwork =
    selected >= 0 ? selected : Math.floor(Math.random() * HERO_ARTWORK.length);
  const showArtwork = () => {
    const artwork = HERO_ARTWORK[currentArtwork];
    if (artwork) art.style.setProperty('--hero-art', `url("${artwork}")`);
  };
  showArtwork();
  HERO_ARTWORK.forEach((url) => {
    const image = new Image();
    image.src = url;
  });

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = selected >= 0;
  let timer: number | undefined;
  let inView = true;
  const stop = () => {
    window.clearTimeout(timer);
  };
  const schedule = () => {
    stop();
    if (signal.aborted) return;
    const label = paused ? 'Resume illustrations' : 'Pause illustrations';
    pause.setAttribute('aria-label', label);
    pause.title = label;
    pause.setAttribute('aria-pressed', String(paused));
    const { interval: normal, reducedInterval } = labValues();
    const interval = motion.matches ? reducedInterval : normal;
    hero.dataset.rotationInterval = String(interval);
    if (paused || document.hidden || !inView || HERO_ARTWORK.length < 2) return;
    timer = window.setTimeout(() => {
      currentArtwork = (currentArtwork + 1) % HERO_ARTWORK.length;
      showArtwork();
      schedule();
    }, interval * 1000);
  };
  pause.addEventListener(
    'click',
    () => {
      paused = !paused;
      schedule();
    },
    { signal },
  );
  motion.addEventListener('change', schedule, { signal });
  document.addEventListener('visibilitychange', schedule, { signal });
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? false;
    schedule();
  });
  visibility.observe(hero);
  const unsubscribe = onLabChange((_, changed) => {
    if (changed.includes('interval') || changed.includes('reducedInterval')) schedule();
  });
  cleanup = () => {
    stop();
    controller.abort();
    visibility.disconnect();
    unsubscribe();
  };
  schedule();
}
