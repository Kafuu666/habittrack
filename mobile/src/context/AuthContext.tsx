import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import { authService } from '../services/authService';
import { cancelAllReminders, resyncReminders } from '../services/notificationService';
import { User } from '../types';
import { tokenStorage } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Memperbarui data pengguna di memori setelah nama/foto diubah (semua layar ikut berubah)
  updateUser: (next: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await tokenStorage.clear().catch(() => undefined);
    await cancelAllReminders().catch(() => undefined);
    setUser(null);
  }, []);

  // Respons 401 dari API (token kedaluwarsa) otomatis mengeluarkan pengguna
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Splash: periksa sesi tersimpan
  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.get();
        if (token) {
          setAuthToken(token);
          setUser(await authService.me());
          void resyncReminders();
        }
      } catch {
        setAuthToken(null); // token tidak valid atau server tidak terjangkau -> tampilkan login
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startSession = useCallback(async (nextUser: User, token: string) => {
    await tokenStorage.set(token);
    setAuthToken(token);
    setUser(nextUser);
    void resyncReminders();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email: email.trim().toLowerCase(), password });
      await startSession(result.user, result.token);
    },
    [startSession]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authService.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      await startSession(result.user, result.token);
    },
    [startSession]
  );

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // logout tetap dilanjutkan di perangkat walau server tidak terjangkau
    }
    await clearSession();
  }, [clearSession]);

  const updateUser = useCallback((next: User) => setUser(next), []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, updateUser }),
    [user, loading, signIn, signUp, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
