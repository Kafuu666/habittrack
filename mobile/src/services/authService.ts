import { AuthResult, User } from '../types';
import { api, unwrap } from './api';

export interface PickedPhoto {
  uri: string;
  mimeType?: string | null;
}

export const authService = {
  register: (payload: { name: string; email: string; password: string }) =>
    unwrap<AuthResult>(api.post('/auth/register', payload)),
  login: (payload: { email: string; password: string }) => unwrap<AuthResult>(api.post('/auth/login', payload)),
  me: () => unwrap<User>(api.get('/auth/me')),
  logout: () => unwrap<null>(api.post('/auth/logout')),

  updateProfile: (payload: { name: string }) => unwrap<User>(api.put('/auth/me', payload)),

  uploadPhoto: (photo: PickedPhoto) => {
    const type = photo.mimeType ?? 'image/jpeg';
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    const form = new FormData();
    // React Native mengirim objek {uri, name, type} sebagai file pada FormData
    form.append('photo', { uri: photo.uri, name: `photo.${ext}`, type } as unknown as Blob);
    // Content-Type harus multipart; header bawaan (application/json) akan mengubah FormData menjadi JSON
    return unwrap<User>(
      api.put('/auth/me/photo', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 })
    );
  },

  removePhoto: () => unwrap<User>(api.delete('/auth/me/photo')),
};
