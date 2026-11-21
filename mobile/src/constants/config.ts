// Atur lewat file .env (EXPO_PUBLIC_API_URL). Default untuk emulator Android.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1';

// Alamat server tanpa "/api/v1", dipakai untuk file statis seperti foto profil (/uploads/...)
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export const assetUrl = (path?: string | null): string | null => (path ? `${API_ORIGIN}${path}` : null);
