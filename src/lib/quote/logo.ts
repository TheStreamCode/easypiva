export const ALLOWED_LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

const SAFE_LOGO_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i;

export function isSafeLogoDataUrl(value: string) {
  return value === '' || SAFE_LOGO_DATA_URL.test(value);
}
