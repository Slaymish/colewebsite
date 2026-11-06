import {
  LAB_CONTROLS,
  LAB_PALETTE,
  LAB_TABS,
  contrast,
  swatchHex,
  type LabKey,
  type LabValues,
} from '~/lib/lab/controls';
import { labUrl, labValues, onLabChange, resetLab, setLab } from '~/lib/lab/state';

const panelKey = 'cole-site-lab-panel';
type Tab = (typeof LAB_TABS)[number]['id'];

let cleanup = () => {};
document.addEventListener('astro:before-swap', () => cleanup());

function remembered(): { open?: boolean; tab?: Tab } {
  try {
    return JSON.parse(sessionStorage.getItem(panelKey) ?? '{}') ?? {};
  } catch {
    return {};
  }
}
function remember(state: { open: boolean; tab: Tab }) {
  try {
    sessionStorage.setItem(panelKey, JSON.stringify(state));
  } catch {
    /* Only the panel's own open state is lost. */
  }
}

export function setupLabPanel() {
  cleanup();
  const panel = document.querySelector<HTMLDetailsElement>('[data-lab-panel]');
  if (!panel) return;
  const controller = new AbortController();
  const { signal } = controller;
  const tabs = [...panel.querySelectorAll<HTMLButtonElement>('[data-lab-tab]')];
  const status = panel.querySelector<HTMLElement>('[data-lab-status]')!;
  const defaultStatus = status.textContent;
  let activeTab: Tab = 'type';

  const selectTab = (tab: Tab, focus = false) => {
    activeTab = tab;
    for (const button of tabs) {
      const selected = button.dataset.labTab === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    }
    panel.querySelectorAll<HTMLElement>('[data-lab-section]').forEach((section) => {
      section.hidden = section.dataset.labSection !== tab;
    });
    remember({ open: panel.open, tab });
  };

  const saved = remembered();
  if (saved.tab && LAB_TABS.some(({ id }) => id === saved.tab)) selectTab(saved.tab);
  if (saved.open) panel.open = true;
  panel.addEventListener('toggle', () => remember({ open: panel.open, tab: activeTab }), {
    signal,
  });

  tabs.forEach((button, index) => {
    button.addEventListener('click', () => selectTab(button.dataset.labTab as Tab), {
      signal,
    });
    button.addEventListener(
      'keydown',
      (event) => {
        const last = tabs.length - 1;
        const next =
          event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : event.key === 'ArrowLeft'
              ? (index + last) % tabs.length
              : event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? last
                  : undefined;
        if (next === undefined) return;
        event.preventDefault();
        selectTab(tabs[next]!.dataset.labTab as Tab, true);
      },
      { signal },
    );
  });

  const display = (key: LabKey, values: LabValues) => {
    const control = LAB_CONTROLS.find((candidate) => candidate.key === key)!;
    const value = values[key];
    if (control.kind === 'range') return `${value}${control.unit}`;
    if (control.kind === 'swatch')
      return LAB_PALETTE.find((swatch) => swatch.value === value)!.label;
    return '';
  };

  const sync = (values: LabValues) => {
    for (const control of LAB_CONTROLS) {
      const value = values[control.key];
      const row = panel.querySelector<HTMLElement>(
        `[data-lab-control="${control.key}"]`,
      )!;
      if (control.kind === 'swatch') {
        row
          .querySelectorAll<HTMLInputElement>('input[type="radio"]')
          .forEach((radio) => (radio.checked = radio.value === value));
      } else {
        const input = row.querySelector<HTMLInputElement | HTMLSelectElement>(
          `[name="${control.key}"]`,
        )!;
        if (input instanceof HTMLInputElement && input.type === 'checkbox')
          input.checked = value === true;
        else input.value = String(value);
      }
      const shown = row.querySelector<HTMLElement>('[data-lab-value]');
      if (shown) shown.textContent = display(control.key, values);
      const changed = value !== control.default;
      row.toggleAttribute('data-changed', changed);
      row.querySelector<HTMLButtonElement>('[data-lab-reset]')!.hidden = !changed;
    }
    for (const { id } of LAB_TABS) {
      const count = LAB_CONTROLS.filter(
        (control) => control.tab === id && values[control.key] !== control.default,
      ).length;
      const badge = panel.querySelector<HTMLElement>(`[data-lab-count="${id}"]`)!;
      badge.textContent = String(count);
      badge.hidden = count === 0;
      badge.setAttribute('aria-label', `${count} changed`);
    }
    const ratio = contrast(swatchHex(values.ground), swatchHex(values.ink));
    const grade =
      ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large only' : 'fails';
    panel.querySelector<HTMLElement>('[data-lab-contrast]')!.textContent =
      `Text on background: ${ratio.toFixed(2)}:1, ${grade}.`;
  };

  for (const control of LAB_CONTROLS) {
    const row = panel.querySelector<HTMLElement>(`[data-lab-control="${control.key}"]`)!;
    row.addEventListener(
      control.kind === 'range' ? 'input' : 'change',
      (event) => {
        const input = event.target as HTMLInputElement | HTMLSelectElement;
        if (input.name !== control.key) return;
        const value =
          control.kind === 'range'
            ? Number(input.value)
            : control.kind === 'toggle'
              ? (input as HTMLInputElement).checked
              : input.value;
        setLab({ [control.key]: value } as Partial<LabValues>);
      },
      { signal },
    );
    row
      .querySelector('[data-lab-reset]')!
      .addEventListener('click', () => resetLab([control.key]), { signal });
  }

  let statusTimer: number | undefined;
  const announce = (message: string) => {
    status.textContent = message;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => (status.textContent = defaultStatus), 2500);
  };
  panel.querySelector('[data-lab-copy]')!.addEventListener(
    'click',
    async () => {
      try {
        await navigator.clipboard.writeText(labUrl().href);
        announce('Link copied.');
      } catch {
        announce('Copy failed. Copy the address bar instead.');
      }
    },
    { signal },
  );
  panel.querySelector('[data-lab-reset-tab]')!.addEventListener(
    'click',
    () => {
      resetLab(
        LAB_CONTROLS.filter((control) => control.tab === activeTab).map(({ key }) => key),
      );
      announce(`${LAB_TABS.find(({ id }) => id === activeTab)!.label} reset.`);
    },
    { signal },
  );
  panel.querySelector('[data-lab-reset-all]')!.addEventListener(
    'click',
    () => {
      resetLab();
      announce('Everything reset.');
    },
    { signal },
  );

  const unsubscribe = onLabChange(sync);
  sync(labValues());
  cleanup = () => {
    controller.abort();
    unsubscribe();
    window.clearTimeout(statusTimer);
  };
}
