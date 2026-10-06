/**
 * Real device media helpers via Capacitor.
 * On web (dev) falls back to HTML input; on Android uses native pickers/camera.
 */
import { Capacitor } from '@capacitor/core';

export interface CapturedMedia {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  size: number;
  source: 'camera' | 'gallery' | 'file';
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export async function takePhoto(): Promise<CapturedMedia | null> {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        correctOrientation: true,
      });
      if (!photo.dataUrl) return null;
      const mime = photo.format === 'png' ? 'image/png' : 'image/jpeg';
      return {
        dataUrl: photo.dataUrl,
        mimeType: mime,
        fileName: `photo_${Date.now()}.${photo.format || 'jpg'}`,
        size: Math.round((photo.dataUrl.length * 3) / 4),
        source: 'camera',
      };
    } catch (e) {
      console.error('Camera error', e);
      return null;
    }
  }
  return pickFileViaInput('image/*');
}

export async function pickFromGallery(): Promise<CapturedMedia | null> {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        correctOrientation: true,
      });
      if (!photo.dataUrl) return null;
      const mime = photo.format === 'png' ? 'image/png' : 'image/jpeg';
      return {
        dataUrl: photo.dataUrl,
        mimeType: mime,
        fileName: `gallery_${Date.now()}.${photo.format || 'jpg'}`,
        size: Math.round((photo.dataUrl.length * 3) / 4),
        source: 'gallery',
      };
    } catch (e) {
      console.error('Gallery error', e);
      return null;
    }
  }
  return pickFileViaInput('image/*');
}

export async function pickFile(
  accept = 'image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt'
): Promise<CapturedMedia | null> {
  return pickFileViaInput(accept);
}

function pickFileViaInput(accept: string): Promise<CapturedMedia | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name,
          size: file.size,
          source: 'file',
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };
    input.click();
  });
}

export async function scanDocument(): Promise<CapturedMedia | null> {
  const photo = await takePhoto();
  if (!photo) return null;
  return {
    ...photo,
    fileName: `scan_${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
  };
}
