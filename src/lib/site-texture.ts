export const SITE_TEXTURES = [
  { id: 'film', label: 'Film grain' },
  { id: 'paper', label: 'Paper fibres' },
] as const;

type Texture = (typeof SITE_TEXTURES)[number]['id'];
export interface SiteTextureOptions {
  background: Texture;
  backgroundScale: number;
  backgroundStrength: number;
}

const cache = new Map<Texture, string>();
const storageKey = 'cole-site-texture';

function textureImage(type: Texture): string {
  const cached = cache.get(type);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return 'none';
  let seed = 521;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pixels = context.createImageData(256, 256);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const light = random() > 0.5;
    pixels.data[index] = light ? 255 : 38;
    pixels.data[index + 1] = light ? 255 : 38;
    pixels.data[index + 2] = light ? 255 : 38;
    pixels.data[index + 3] = Math.floor(random() * (type === 'film' ? 190 : 55));
  }
  context.putImageData(pixels, 0, 0);
  if (type === 'paper') {
    for (let index = 0; index < 1200; index++) {
      const x = random() * 256;
      const y = random() * 256;
      const length = 3 + random() * 15;
      const angle = random() * Math.PI * 2;
      context.strokeStyle = index % 2 ? 'rgba(90,72,53,0.2)' : 'rgba(255,255,255,0.6)';
      context.lineWidth = 0.4 + random() * 0.8;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(
        x + length * 0.5,
        y + random() * 3,
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length,
      );
      context.stroke();
    }
  }
  const url = `url("${canvas.toDataURL('image/png')}")`;
  cache.set(type, url);
  return url;
}

export function readSiteTexture(): SiteTextureOptions {
  let saved: Partial<SiteTextureOptions> = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey) ?? '{}') ?? {};
  } catch {
    /* Storage can be disabled in private browsing. */
  }
  const params = new URLSearchParams(location.search);
  const candidate = params.get('siteTexture') ?? saved.background;
  const bounded = (key: string, fallback: number, min: number, max: number) => {
    const value = Number(params.get(key) ?? fallback);
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  };
  return {
    background: SITE_TEXTURES.find(({ id }) => id === candidate)?.id ?? 'paper',
    backgroundScale: bounded('siteTextureScale', saved.backgroundScale ?? 1, 0.25, 4),
    backgroundStrength: bounded(
      'siteTextureStrength',
      saved.backgroundStrength ?? 0.18,
      0.03,
      0.6,
    ),
  };
}

export function applySiteTexture(options: SiteTextureOptions) {
  const root = document.documentElement;
  root.style.setProperty('--site-texture', textureImage(options.background));
  root.style.setProperty('--site-texture-size', `${256 * options.backgroundScale}px`);
  root.style.setProperty('--site-texture-strength', String(options.backgroundStrength));
  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        background: options.background,
        backgroundScale: options.backgroundScale,
        backgroundStrength: options.backgroundStrength,
      }),
    );
  } catch {
    /* The URL still shares settings if storage is unavailable. */
  }
}

export function setupSiteTexture() {
  applySiteTexture(readSiteTexture());
}
