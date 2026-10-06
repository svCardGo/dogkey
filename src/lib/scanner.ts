/**
 * Document scan pipeline: capture → canvas crop → contrast enhance → save.
 */
import { takePhoto, type CapturedMedia } from './media';

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function enhanceCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  let min = 255, max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      d[i + c] = Math.min(255, Math.max(0, ((d[i + c] - min) / range) * 255));
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

export async function scanDocumentPipeline(crop?: {
  x: number; y: number; w: number; h: number;
}): Promise<CapturedMedia | null> {
  const photo = await takePhoto();
  if (!photo?.dataUrl) return null;

  const img = await loadImage(photo.dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return photo;

  const cx = crop?.x ?? 0.05;
  const cy = crop?.y ?? 0.05;
  const cw = crop?.w ?? 0.9;
  const ch = crop?.h ?? 0.9;
  const sx = Math.floor(img.width * cx);
  const sy = Math.floor(img.height * cy);
  const sw = Math.floor(img.width * cw);
  const sh = Math.floor(img.height * ch);

  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  enhanceCanvas(ctx, sw, sh);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return {
    dataUrl,
    mimeType: 'image/jpeg',
    fileName: `scan_${Date.now()}.jpg`,
    size: Math.round((dataUrl.length * 3) / 4),
    source: 'camera',
  };
}
