import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'habittrack.token';

// Token JWT disimpan terenkripsi di Android Keystore melalui expo-secure-store
export const tokenStorage = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};
