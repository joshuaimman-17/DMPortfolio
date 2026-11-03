import { auth } from './firebase';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

export interface DriveFileInfo {
  id: string;
  name: string;
  url: string;
  viewUrl?: string;
  thumbnail?: string;
}

/**
 * Sends a POST payload to Google Apps Script web app with text/plain to prevent CORS preflight.
 * Includes a strict 10-second timeout.
 */
export async function postToScript(payload: any): Promise<any> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Google Apps Script URL is not configured. Please set VITE_APPS_SCRIPT_URL in your environment.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Google Apps Script HTTP error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response received from Google Apps Script web app.');
    }

    if (data && data.ok === false) {
      throw new Error(data.error || data.message || 'Operation failed in Google Apps Script.');
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Google Apps Script request timed out after 10 seconds.');
    }
    throw err;
  }
}

/**
 * Resizes an image client-side to max 2000px width, compresses to WebP or JPEG (0.85 quality),
 * converts to raw base64, attaches current user ID token, and sends to Drive via Apps Script.
 */
export async function uploadImage(
  file: File,
  category: string
): Promise<{ id: string; url: string; viewUrl?: string }> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }

  // Ensure user is signed in
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in as an administrator to upload images to Google Drive.');
  }

  const idToken = await currentUser.getIdToken();

  // Resize and compress via Canvas
  const { base64, mimeType } = await resizeAndCompressImage(file, 2000, 0.85);

  const payload = {
    action: 'upload',
    idToken,
    category,
    filename: file.name,
    mimeType,
    base64,
  };

  const response = await postToScript(payload);

  const driveId = response.id || response.fileId || '';
  const url = response.url || (driveId ? driveImageUrl(driveId, 1600) : '');
  const viewUrl = response.viewUrl || (driveId ? `https://drive.google.com/file/d/${driveId}/view` : url);

  return {
    id: driveId,
    url,
    viewUrl,
  };
}

/**
 * Lists existing images from Google Drive matching the category folder.
 */
export async function listDriveImages(category: string): Promise<DriveFileInfo[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in to view Google Drive files.');
  }

  const idToken = await currentUser.getIdToken();

  const response = await postToScript({
    action: 'listFiles',
    idToken,
    category,
  });

  const files = response.files || response.data || [];
  return files.map((f: any) => ({
    id: f.id,
    name: f.name || 'Untitled Image',
    url: f.url || driveImageUrl(f.id, 1600),
    viewUrl: f.viewUrl || `https://drive.google.com/file/d/${f.id}/view`,
    thumbnail: driveImageUrl(f.id, 600),
  }));
}

/**
 * Submits form data to Google Sheets & Gmail via Apps Script.
 */
export async function submitForm(
  type: 'audit' | 'contact' | 'newsletter',
  data: {
    name?: string;
    email: string;
    companyUrl?: string;
    challenge?: string;
    budget?: string;
    slot?: string;
    service?: string;
    message?: string;
    [key: string]: any;
  },
  honeypot = ''
): Promise<{ success: boolean; message?: string }> {
  const payload = {
    action: 'submitForm',
    type,
    page: window.location.hash || '/',
    website: honeypot,
    data,
  };

  try {
    const res = await postToScript(payload);
    return { success: true, message: res?.message || 'Successfully synced with Google Sheets and Gmail.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Apps Script sync failed.' };
  }
}

/**
 * Normalizes Drive file IDs and Drive links to https://drive.google.com/thumbnail?id=ID&sz=w{width}.
 * Leaves any non-Drive URL completely unchanged.
 */
export function driveImageUrl(idOrUrl: string | undefined | null, width = 600): string {
  if (!idOrUrl || typeof idOrUrl !== 'string') return '';
  const trimmed = idOrUrl.trim();
  if (!trimmed) return '';

  // 1. Check if it's already a Google Drive thumbnail URL
  const thumbMatch = trimmed.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (thumbMatch && thumbMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${thumbMatch[1]}&sz=w${width}`;
  }

  // 2. Check for drive.google.com/file/d/FILE_ID
  const fileDMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w${width}`;
  }

  // 3. Check for drive.google.com/open?id=FILE_ID or uc?id=FILE_ID or id=FILE_ID
  const idParamMatch = trimmed.match(/drive\.google\.com\/[a-zA-Z?&=_.-]*[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w${width}`;
  }

  // 4. Check if it's a raw Drive ID (typically 25 to 50 chars of alphanumeric, dashes, underscores, without slashes or dots)
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 20 && trimmed.length <= 60 && /^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w${width}`;
  }

  // 5. Any other URL (Unsplash, local asset, Firebase Storage, HTTP/HTTPS) is returned untouched
  return trimmed;
}

/**
 * Helper to resize image client-side to a max width and compress to WebP or JPEG
 */
function resizeAndCompressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer image/webp if supported, otherwise image/jpeg
        const targetMime = file.type === 'image/png' ? 'image/webp' : (file.type || 'image/jpeg');
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL(targetMime, quality);
          // Fallback if browser doesn't support webp export
          if (!dataUrl.startsWith('data:image/webp') && targetMime === 'image/webp') {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Extract base64 part
        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64 = parts[1] || '';

        resolve({ base64, mimeType });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
