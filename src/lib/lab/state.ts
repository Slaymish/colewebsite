import {
  LAB_CONTROLS,
  LAB_DEFAULTS,
  LAB_ENABLED,
  LAB_PALETTE,
  labCustomProperties,
  type LabKey,
  type LabValues,
} from '~/lib/lab/controls';
import { textureImage } from '~/lib/site-texture';

/** Keep both keys in sync with public/scripts/lab-preference.js. */
const valuesKey = 'cole-site-lab';
const propertiesKey = 'cole-site-lab-properties';

let current: LabValues | undefined;
const listeners = new Set<(values: LabValues, changed: LabKey[]) => void>();

function parse(control: (typeof LAB_CONTROLS)[number], raw: unknown) {
  if (raw === null || raw === undefined) return undefined;
  switch (control.kind) {
    case 'range': {
      const value = Number(raw);
      if (!Number.isFinite(value)) return undefined;
      return Math.min(control.max, Math.max(control.min, value));
    }
    case 'toggle':
      return raw === true || raw === 'true' || raw === '1'
        ? true
        : raw === false || raw === 'false' || raw === '0'
          ? false
          : undefined;
    case 'swatch':
      return LAB_PALETTE.some(({ value }) => value === raw) ? raw : undefined;
    case 'select':
      return control.options.some(({ value }) => value === raw) ? raw : undefined;
  }
}

function read(): LabValues {
  if (!LAB_ENABLED) return { ...LAB_DEFAULTS };
  let saved: Record<string, unknown> = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(valuesKey) ?? '{}') ?? {};
  } catch {
    /* Storage can be disabled in private browsing. */
  }
  const params = new URLSearchParams(location.search);
  const values: Record<string, unknown> = { ...LAB_DEFAULTS };
  for (const control of LAB_CONTROLS) {
    values[control.key] =
      parse(control, params.get(control.param)) ??
      parse(control, saved[control.key]) ??
      control.default;
  }
  return values as LabValues;
}

export function labValues(): LabValues {
  current ??= read();
  return current;
}

export function onLabChange(listener: (values: LabValues, changed: LabKey[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function applyLab(root = document.documentElement) {
  const values = labValues();
  const properties = labCustomProperties(values);
  for (const [name, value] of Object.entries(properties))
    root.style.setProperty(name, value);
  root.style.setProperty(
    '--site-texture',
    values.background === 'none' ? 'none' : textureImage(values.background),
  );
  if (!LAB_ENABLED) return;
  try {
    sessionStorage.setItem(valuesKey, JSON.stringify(values));
    sessionStorage.setItem(propertiesKey, JSON.stringify(properties));
  } catch {
    /* The URL still shares settings if storage is unavailable. */
  }
}

/** Only changed values go in the URL, so a shared link names what was tried. */
export function labUrl() {
  const url = new URL(location.href);
  const values = labValues();
  for (const control of LAB_CONTROLS) {
    const value = values[control.key];
    if (value === control.default) url.searchParams.delete(control.param);
    else url.searchParams.set(control.param, String(value));
  }
  return url;
}

export function setLab(changes: Partial<LabValues>) {
  current = { ...labValues(), ...changes };
  applyLab();
  history.replaceState(history.state, '', labUrl());
  const changed = Object.keys(changes) as LabKey[];
  listeners.forEach((listener) => listener(current!, changed));
}

export function resetLab(keys: readonly LabKey[] = LAB_CONTROLS.map(({ key }) => key)) {
  setLab(Object.fromEntries(keys.map((key) => [key, LAB_DEFAULTS[key]])));
}
