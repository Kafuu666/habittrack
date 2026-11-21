import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../services/api';

/**
 * Memuat data setiap layar mendapat fokus (atau saat `deps` berubah).
 * - loading   : hanya true pada pemuatan pertama (belum ada data)
 * - refreshing: untuk pull-to-refresh
 * - error     : pesan error terakhir; data lama tetap dipertahankan
 */
export function useFocusLoad<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const hasData = useRef(false);

  const load = useCallback(async (mode: 'silent' | 'refresh' = 'silent') => {
    if (mode === 'refresh') setRefreshing(true);
    else if (!hasData.current) setLoading(true);
    try {
      const result = await loaderRef.current();
      hasData.current = true;
      setData(result);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const depsKey = JSON.stringify(deps);
  useFocusEffect(
    useCallback(() => {
      void load('silent');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, depsKey])
  );

  return {
    data,
    loading,
    refreshing,
    error,
    reload: () => load('silent'),
    refresh: () => load('refresh'),
  };
}
