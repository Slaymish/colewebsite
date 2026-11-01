import {
  HERO_ARTWORK,
  HERO_ILLUSTRATIONS,
  HERO_PHRASES,
  HERO_ROTATION,
} from '~/lib/hero';
import { applySiteTexture, readSiteTexture } from '~/lib/site-texture';

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

  const bounded = (key: string, fallback: number, min: number, max: number) => {
    const value = Number(params.get(key) ?? fallback);
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  };
  const panel = document.querySelector<HTMLDetailsElement>('[data-hero-panel]');
  const options = {
    ...readSiteTexture(),
    interval: panel
      ? bounded('heroInterval', HERO_ROTATION.interval, 0.25, 2)
      : HERO_ROTATION.interval,
    reducedInterval: panel
      ? bounded('heroReducedInterval', HERO_ROTATION.reducedInterval, 2, 10)
      : HERO_ROTATION.reducedInterval,
  };
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
    const interval = motion.matches ? options.reducedInterval : options.interval;
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
  cleanup = () => {
    stop();
    controller.abort();
    visibility.disconnect();
  };
  schedule();
  if (!panel) return;

  const save = () => {
    const url = new URL(location.href);
    ['heroMode', 'heroRate', 'heroRoughness', 'heroOpacity', 'heroNoiseScale'].forEach(
      (key) => url.searchParams.delete(key),
    );
    url.searchParams.set('heroInterval', String(options.interval));
    url.searchParams.set('heroReducedInterval', String(options.reducedInterval));
    url.searchParams.set('siteTexture', options.background);
    url.searchParams.set('siteTextureScale', String(options.backgroundScale));
    url.searchParams.set('siteTextureStrength', String(options.backgroundStrength));
    history.replaceState(history.state, '', url);
  };
  const background = panel.querySelector<HTMLSelectElement>('[name="background"]')!;
  background.value = options.background;
  background.addEventListener(
    'change',
    () => {
      options.background = background.value as typeof options.background;
      applySiteTexture(options);
      save();
    },
    { signal },
  );
  const keys = [
    'interval',
    'reducedInterval',
    'backgroundScale',
    'backgroundStrength',
  ] as const;
  keys.forEach((key) => {
    const input = panel.querySelector<HTMLInputElement>(`[name="${key}"]`)!;
    const output = panel.querySelector<HTMLOutputElement>(`output[for="hero-${key}"]`)!;
    input.value = String(options[key]);
    const updateOutput = () => {
      output.value = `${input.value}${key.endsWith('Interval') || key === 'interval' ? ' s' : key === 'backgroundScale' ? '×' : ''}`;
    };
    updateOutput();
    input.addEventListener(
      'input',
      () => {
        options[key] = Number(input.value);
        updateOutput();
        if (key === 'interval' || key === 'reducedInterval') schedule();
        else applySiteTexture(options);
        save();
      },
      { signal },
    );
  });
}
