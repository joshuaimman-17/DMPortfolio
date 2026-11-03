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

  // 4. Check if it's a raw Drive ID (typically 20 to 60 chars of alphanumeric, dashes, underscores)
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 20 && trimmed.length <= 60 && /^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w${width}`;
  }

  // 5. Any other URL (Unsplash, local asset, Firebase Storage, HTTP/HTTPS) is returned untouched
  return trimmed;
}
