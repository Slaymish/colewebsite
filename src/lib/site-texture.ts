type Texture = 'film' | 'paper';

const cache = new Map<Texture, string>();

export function textureImage(type: Texture): string {
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
