import type { TransitionDirectionalAnimations } from 'astro';
import { jumpTo } from '~/lib/scroll';

const duration = '650ms';
const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
const animation = (name: string) => ({ name, duration, easing, fillMode: 'both' });
export const panelTransition: TransitionDirectionalAnimations = {
  forwards: { old: animation('panel-exit'), new: animation('panel-enter') },
  backwards: { old: animation('panel-leave'), new: animation('panel-return') },
};
const route = (path: string) => path.replace(/\/$/, '') || '/';
const parents = new Map([
  ['/illustrations', { path: '/', section: 'hero' }],
  ['/design', { path: '/', section: 'design' }],
  ['/photography', { path: '/', section: 'photography' }],
  ['/contact', { path: '/', section: 'contact' }],
]);
function parentFor(path: string) {
  if (path.startsWith('/work/')) return { path: '/design', section: 'work-cloud' };
  if (path.startsWith('/photography/'))
    return { path: '/photography', section: 'photo-sets' };
  return parents.get(path);
}
const alignment = (section: HTMLElement) => {
  const rect = section.getBoundingClientRect();
  return rect.top + rect.height / 2 - window.innerHeight / 2;
};
const setOffset = (root: HTMLElement, pixels: number) =>
  root.style.setProperty('--panel-offset-y', `${pixels}px`);
interface Journey {
  direction: 'out' | 'home';
  section: string;
  offset: number;
}

export function setupPanelNavigation() {
  let journey: Journey | undefined;
  let keyboard = false;
  document.addEventListener(
    'pointerdown',
    () => {
      keyboard = false;
    },
    { capture: true },
  );
  document.addEventListener(
    'keydown',
    () => {
      keyboard = true;
    },
    { capture: true },
  );
  document.addEventListener('astro:before-preparation', (event) => {
    journey = undefined;
    const from = route(event.from.pathname);
    const to = route(event.to.pathname);
    const targetParent = parentFor(to);
    const sourceParent = parentFor(from);
    if (targetParent?.path === from) {
      const section = document.getElementById(targetParent.section);
      if (section) {
        event.direction = 'forward';
        journey = {
          direction: 'out',
          section: targetParent.section,
          offset: alignment(section),
        };
      }
    } else if (sourceParent?.path === to) {
      event.direction = 'back';
      journey = { direction: 'home', section: sourceParent.section, offset: 0 };
    }
    setOffset(
      document.documentElement,
      journey?.direction === 'out' ? journey.offset : 0,
    );
  });
  document.addEventListener('astro:before-swap', (event) => {
    setOffset(
      event.newDocument.documentElement,
      journey?.direction === 'out' ? journey.offset : 0,
    );
  });
  document.addEventListener('astro:after-swap', () => {
    if (journey?.direction === 'home') {
      const section = document.getElementById(journey.section);
      if (section) {
        // Back always lands squarely on the parent, regardless of its old scroll
        // position. This happens before the incoming snapshot is captured.
        jumpTo(section.offsetTop + section.offsetHeight / 2 - innerHeight / 2);
        history.replaceState(
          { ...history.state, scrollX: scrollX, scrollY: scrollY },
          '',
        );
        if (keyboard) {
          const focus = section.matches('a,button')
            ? section
            : section.querySelector<HTMLElement>('a,button');
          focus?.focus({ preventScroll: true });
        }
      }
      setOffset(document.documentElement, 0);
    } else if (journey?.direction === 'out')
      setOffset(document.documentElement, journey.offset + window.scrollY);
    if (!keyboard && document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    journey = undefined;
  });
}
