import axios, { AxiosResponse } from 'axios';

import { API_URL } from '../constants/config';
import { ApiResponse } from '../types';
import { todayStr } from '../utils/date';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  if (authToken) config.headers.set('Authorization', `Bearer ${authToken}`);
  // Tanggal lokal perangkat, dipakai backend untuk menentukan "hari ini" milik pengguna
  config.headers.set('X-Client-Date', todayStr());
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token kedaluwarsa/tidak valid -> keluarkan pengguna
    if (axios.isAxiosError(error) && error.response?.status === 401 && authToken) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await request;
  return response.data.data;
}

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'Permintaan terlalu lama. Silakan coba lagi.'
        : 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }
    const data = error.response.data as Partial<ApiResponse<unknown>> | undefined;
    return data?.details?.[0]?.message ?? data?.message ?? fallback;
  }
  return fallback;
}
