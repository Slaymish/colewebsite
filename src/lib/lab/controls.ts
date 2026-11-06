import { HERO_ROTATION } from '~/lib/hero';

export const LAB_ENABLED =
  import.meta.env.DEV || import.meta.env.PUBLIC_NOINDEX === 'true';

export const LAB_TABS = [
  { id: 'type', label: 'Type' },
  { id: 'colour', label: 'Colour' },
  { id: 'layout', label: 'Layout' },
  { id: 'motion', label: 'Motion' },
  { id: 'texture', label: 'Texture' },
] as const;
type Tab = (typeof LAB_TABS)[number]['id'];

/** Cole's palette, docs/design/brief.md. Roles may only pick from these. */
export const LAB_PALETTE = [
  { value: 'ground', label: 'Ground', hex: '#f2f0f0' },
  { value: 'ink', label: 'Ink', hex: '#262626' },
  { value: 'accent', label: 'Blue', hex: '#0f5c8c' },
  { value: 'accentDeep', label: 'Deep blue', hex: '#0d518c' },
  { value: 'accentWarm', label: 'Rusty orange', hex: '#bf3706' },
] as const;
type Swatch = (typeof LAB_PALETTE)[number]['value'];

/** Local fonts only, so nothing loads for visitors; each stack falls back off macOS. */
export const LAB_FONTS = [
  {
    value: 'arial-black',
    label: 'Arial Black',
    stack: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
  },
  {
    value: 'helvetica',
    label: 'Helvetica Neue',
    stack: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  { value: 'futura', label: 'Futura', stack: "Futura, 'Century Gothic', sans-serif" },
  {
    value: 'avenir',
    label: 'Avenir Next',
    stack: "'Avenir Next', Avenir, 'Segoe UI', sans-serif",
  },
  {
    value: 'gill-sans',
    label: 'Gill Sans',
    stack: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
  },
  {
    value: 'impact',
    label: 'Impact',
    stack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  },
  { value: 'system', label: 'System UI', stack: 'system-ui, sans-serif' },
  { value: 'georgia', label: 'Georgia', stack: 'Georgia, serif' },
  { value: 'didot', label: 'Didot', stack: "Didot, 'Bodoni 72', 'Bodoni MT', serif" },
  { value: 'times', label: 'Times', stack: "'Times New Roman', Times, serif" },
  { value: 'mono', label: 'Menlo', stack: 'Menlo, Consolas, monospace' },
] as const;

const EASINGS = [
  { value: 'expo', label: 'Ease out (current)', css: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  { value: 'ease', label: 'Ease', css: 'ease' },
  { value: 'ease-in-out', label: 'Ease in-out', css: 'ease-in-out' },
  { value: 'overshoot', label: 'Overshoot', css: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { value: 'linear', label: 'Linear', css: 'linear' },
] as const;

const WRAPS = [
  { value: 'nowrap', label: 'Never wrap' },
  { value: 'balance', label: 'Balance' },
  { value: 'pretty', label: 'Pretty' },
  { value: 'wrap', label: 'Wrap' },
] as const;

interface Base {
  key: string;
  /** Existing param names are kept so links shared before the tabs still work. */
  param: string;
  tab: Tab;
  group: string;
  label: string;
  hint?: string;
}
interface Range extends Base {
  kind: 'range';
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
}
interface Select extends Base {
  kind: 'select';
  options: readonly { value: string; label: string }[];
  default: string;
}
interface Swatches extends Base {
  kind: 'swatch';
  default: Swatch;
}
interface Toggle extends Base {
  kind: 'toggle';
  default: boolean;
}
export type LabControl = Range | Select | Swatches | Toggle;

export const LAB_CONTROLS = [
  {
    kind: 'select',
    key: 'displayFont',
    param: 'font',
    tab: 'type',
    group: 'Display face',
    label: 'Family',
    hint: 'Hero and section words. Local fonts, so check on more than one machine.',
    options: LAB_FONTS,
    default: 'arial-black',
  },
  {
    kind: 'range',
    key: 'displayWeight',
    param: 'fontWeight',
    tab: 'type',
    group: 'Display face',
    label: 'Weight',
    min: 100,
    max: 900,
    step: 100,
    default: 900,
    unit: '',
  },
  {
    kind: 'range',
    key: 'displayTracking',
    param: 'tracking',
    tab: 'type',
    group: 'Display face',
    label: 'Letter spacing',
    min: -0.1,
    max: 0.1,
    step: 0.005,
    default: -0.045,
    unit: 'em',
  },
  {
    kind: 'range',
    key: 'heroSize',
    param: 'heroSize',
    tab: 'type',
    group: 'Hero headline',
    label: 'Size',
    min: 0.5,
    max: 1.5,
    step: 0.05,
    default: 1,
    unit: '×',
  },
  {
    kind: 'range',
    key: 'heroLineHeight',
    param: 'heroLineHeight',
    tab: 'type',
    group: 'Hero headline',
    label: 'Line height',
    hint: 'Shows once a line wraps or the lines flow.',
    min: 0.7,
    max: 1.6,
    step: 0.05,
    default: 1,
    unit: '',
  },
  {
    kind: 'select',
    key: 'heroLayout',
    param: 'heroLayout',
    tab: 'type',
    group: 'Hero headline',
    label: 'Lines',
    options: [
      { value: 'stacked', label: 'Stacked, spread to fill' },
      { value: 'flowing', label: 'Flowing text' },
    ],
    default: 'stacked',
  },
  {
    kind: 'select',
    key: 'heroWrap',
    param: 'heroWrap',
    tab: 'type',
    group: 'Hero headline',
    label: 'Wrapping',
    options: WRAPS,
    default: 'nowrap',
  },
  {
    kind: 'toggle',
    key: 'heroHyphens',
    param: 'heroHyphens',
    tab: 'type',
    group: 'Hero headline',
    label: 'Hyphenate long words',
    default: false,
  },
  {
    kind: 'toggle',
    key: 'heroUppercase',
    param: 'heroUppercase',
    tab: 'type',
    group: 'Hero headline',
    label: 'Uppercase',
    default: true,
  },
  {
    kind: 'range',
    key: 'wordSize',
    param: 'wordSize',
    tab: 'type',
    group: 'Section words',
    label: 'Size',
    min: 0.5,
    max: 1.5,
    step: 0.05,
    default: 1,
    unit: '×',
  },
  {
    kind: 'swatch',
    key: 'ground',
    param: 'ground',
    tab: 'colour',
    group: 'Roles',
    label: 'Background',
    default: 'ground',
  },
  {
    kind: 'swatch',
    key: 'ink',
    param: 'ink',
    tab: 'colour',
    group: 'Roles',
    label: 'Text',
    default: 'ink',
  },
  {
    kind: 'swatch',
    key: 'illustration',
    param: 'illustration',
    tab: 'colour',
    group: 'Roles',
    label: 'Illustrations',
    default: 'accent',
  },
  {
    kind: 'swatch',
    key: 'illustrationHover',
    param: 'illustrationHover',
    tab: 'colour',
    group: 'Roles',
    label: 'Illustration hover',
    default: 'accentDeep',
  },
  {
    kind: 'swatch',
    key: 'accent',
    param: 'accent',
    tab: 'colour',
    group: 'Roles',
    label: 'Hover and focus',
    default: 'accent',
  },
  {
    kind: 'range',
    key: 'heroArtWidth',
    param: 'heroArtWidth',
    tab: 'layout',
    group: 'Hero, landscape',
    label: 'Illustration column',
    min: 20,
    max: 50,
    step: 1,
    default: 33,
    unit: '%',
  },
  {
    kind: 'range',
    key: 'heroTitleTop',
    param: 'heroTitleTop',
    tab: 'layout',
    group: 'Hero, landscape',
    label: 'Headline top and bottom margin',
    min: 0,
    max: 30,
    step: 0.5,
    default: 15.5,
    unit: '%',
  },
  {
    kind: 'range',
    key: 'heroTitleLeft',
    param: 'heroTitleLeft',
    tab: 'layout',
    group: 'Hero, landscape',
    label: 'Headline left margin',
    min: 0,
    max: 15,
    step: 0.5,
    default: 3.5,
    unit: '%',
  },
  {
    kind: 'range',
    key: 'heroArtPadding',
    param: 'heroArtPadding',
    tab: 'layout',
    group: 'Hero, every orientation',
    label: 'Illustration padding',
    min: 0,
    max: 20,
    step: 0.5,
    default: 5,
    unit: '%',
  },
  {
    kind: 'range',
    key: 'sectionPadding',
    param: 'sectionPadding',
    tab: 'layout',
    group: 'Section words',
    label: 'Padding',
    min: 0,
    max: 12,
    step: 0.5,
    default: 4,
    unit: 'vw',
  },
  {
    kind: 'range',
    key: 'interval',
    param: 'heroInterval',
    tab: 'motion',
    group: 'Illustration rotation',
    label: 'Normal speed',
    min: 0.25,
    max: 2,
    step: 0.05,
    default: HERO_ROTATION.interval,
    unit: ' s',
  },
  {
    kind: 'range',
    key: 'reducedInterval',
    param: 'heroReducedInterval',
    tab: 'motion',
    group: 'Illustration rotation',
    label: 'Reduced motion speed',
    min: 2,
    max: 10,
    step: 0.5,
    default: HERO_ROTATION.reducedInterval,
    unit: ' s',
  },
  {
    kind: 'range',
    key: 'transitionDuration',
    param: 'transitionDuration',
    tab: 'motion',
    group: 'Page transition',
    label: 'Duration',
    hint: 'Navigate between pages to see it.',
    min: 0,
    max: 1500,
    step: 50,
    default: 650,
    unit: ' ms',
  },
  {
    kind: 'select',
    key: 'transitionEasing',
    param: 'transitionEasing',
    tab: 'motion',
    group: 'Page transition',
    label: 'Easing',
    options: EASINGS,
    default: 'expo',
  },
  {
    kind: 'toggle',
    key: 'smoothScroll',
    param: 'smoothScroll',
    tab: 'motion',
    group: 'Scrolling',
    label: 'Smooth scrolling',
    default: true,
  },
  {
    kind: 'range',
    key: 'scrollLerp',
    param: 'scrollLerp',
    tab: 'motion',
    group: 'Scrolling',
    label: 'Catch-up',
    hint: 'Lower feels floatier.',
    min: 0.02,
    max: 0.3,
    step: 0.01,
    default: 0.1,
    unit: '',
  },
  {
    kind: 'select',
    key: 'background',
    param: 'siteTexture',
    tab: 'texture',
    group: 'Site background',
    label: 'Texture',
    options: [
      { value: 'film', label: 'Film grain' },
      { value: 'paper', label: 'Paper fibres' },
      { value: 'none', label: 'None' },
    ],
    default: 'paper',
  },
  {
    kind: 'range',
    key: 'backgroundScale',
    param: 'siteTextureScale',
    tab: 'texture',
    group: 'Site background',
    label: 'Scale',
    min: 0.25,
    max: 4,
    step: 0.05,
    default: 1,
    unit: '×',
  },
  {
    kind: 'range',
    key: 'backgroundStrength',
    param: 'siteTextureStrength',
    tab: 'texture',
    group: 'Site background',
    label: 'Strength',
    min: 0.03,
    max: 0.6,
    step: 0.01,
    default: 0.18,
    unit: '',
  },
  {
    kind: 'select',
    key: 'backgroundBlend',
    param: 'siteTextureBlend',
    tab: 'texture',
    group: 'Site background',
    label: 'Blend',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'multiply', label: 'Multiply' },
      { value: 'overlay', label: 'Overlay' },
      { value: 'soft-light', label: 'Soft light' },
      { value: 'screen', label: 'Screen' },
    ],
    default: 'normal',
  },
] as const satisfies readonly LabControl[];

type Control = (typeof LAB_CONTROLS)[number];
type ValueOf<C> = C extends { kind: 'range' }
  ? number
  : C extends { kind: 'toggle' }
    ? boolean
    : C extends { kind: 'swatch' }
      ? Swatch
      : C extends { options: readonly { value: infer V }[] }
        ? V
        : never;
export type LabValues = { [C in Control as C['key']]: ValueOf<C> };
export type LabKey = keyof LabValues;

export const LAB_DEFAULTS = Object.fromEntries(
  LAB_CONTROLS.map((control) => [control.key, control.default]),
) as LabValues;

export const swatchHex = (swatch: Swatch) =>
  LAB_PALETTE.find(({ value }) => value === swatch)!.hex;

/** Every CSS custom property the lab owns, so the pre-paint script can replay them. */
export function labCustomProperties(values: LabValues): Record<string, string> {
  const wraps = values.heroWrap !== 'nowrap';
  return {
    '--display-font': LAB_FONTS.find(({ value }) => value === values.displayFont)!.stack,
    '--lab-display-weight': String(values.displayWeight),
    '--lab-display-tracking': `${values.displayTracking}em`,
    '--lab-hero-scale': String(values.heroSize),
    '--lab-hero-line-height': String(values.heroLineHeight),
    '--lab-hero-display': values.heroLayout === 'stacked' ? 'flex' : 'block',
    '--lab-hero-span-display': values.heroLayout === 'stacked' ? 'block' : 'inline',
    '--lab-hero-white-space': wraps ? 'normal' : 'nowrap',
    '--lab-hero-text-wrap': wraps ? values.heroWrap : 'wrap',
    '--lab-hero-hyphens': values.heroHyphens ? 'auto' : 'manual',
    '--lab-hero-transform': values.heroUppercase ? 'uppercase' : 'none',
    '--lab-word-scale': String(values.wordSize),
    '--lab-ground': swatchHex(values.ground),
    '--lab-ink': swatchHex(values.ink),
    '--lab-illustration': swatchHex(values.illustration),
    '--lab-illustration-hover': swatchHex(values.illustrationHover),
    '--lab-accent': swatchHex(values.accent),
    '--lab-hero-art-width': `${values.heroArtWidth}%`,
    '--lab-hero-title-top': `${values.heroTitleTop}%`,
    '--lab-hero-title-left': `${values.heroTitleLeft}%`,
    '--lab-hero-art-padding': `${values.heroArtPadding}%`,
    '--lab-section-padding': `${values.sectionPadding}vw`,
    '--lab-transition-duration': `${values.transitionDuration}ms`,
    '--lab-transition-easing': EASINGS.find(
      ({ value }) => value === values.transitionEasing,
    )!.css,
    '--site-texture-size': `${256 * values.backgroundScale}px`,
    '--site-texture-strength': String(values.backgroundStrength),
    '--lab-texture-blend': values.backgroundBlend,
  };
}

/** WCAG 2 contrast ratio between two hex colours. */
export function contrast(a: string, b: string) {
  const luminance = (colour: string) => {
    const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((index) => {
      const channel = parseInt(colour.slice(index, index + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
