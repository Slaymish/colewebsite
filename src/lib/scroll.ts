import Lenis from 'lenis';
import { labValues, onLabChange } from '~/lib/lab/state';

let engine: Lenis | undefined;
const listeners = new Set<() => void>();
export function onScrollFrame(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function jumpTo(top: number) {
  if (engine) {
    engine.resize();
    engine.scrollTo(top, { immediate: true, force: true });
  } else window.scrollTo({ top, left: 0, behavior: 'instant' });
}
export function glideTo(top: number) {
  if (engine) engine.scrollTo(top, { duration: 1, force: true });
  else
    window.scrollTo({
      top,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
}
export function setupSmoothScroll() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const destroy = () => {
    engine?.destroy();
    engine = undefined;
  };
  const start = () => {
    const { smoothScroll, scrollLerp } = labValues();
    if (motion.matches || !smoothScroll) {
      destroy();
      return;
    }
    if (!engine) {
      engine = new Lenis({
        autoRaf: true,
        lerp: scrollLerp,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        respectReducedMotion: true,
      });
      engine.on('scroll', () => listeners.forEach((listener) => listener()));
    }
    engine.resize();
    engine.scrollTo(window.scrollY, { immediate: true, force: true });
  };
  // Destroy before capture instead of setting overflow:hidden: the viewport and
  // font widths must not change while a page transition is being photographed.
  document.addEventListener('astro:before-preparation', destroy);
  document.addEventListener('astro:page-load', start);
  motion.addEventListener('change', start);
  onLabChange((_, changed) => {
    if (!changed.includes('smoothScroll') && !changed.includes('scrollLerp')) return;
    destroy();
    start();
  });
  document.addEventListener(
    'click',
    (event) => {
      if (
        event.defaultPrevented ||
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href]')
          : null;
      if (!link || link.target || link.download) return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return;
      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      glideTo(target.getBoundingClientRect().top + window.scrollY);
      history.replaceState(history.state, '', url);
    },
    { capture: true },
  );
}
