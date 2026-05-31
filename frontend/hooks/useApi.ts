import { useState, useEffect, useCallback } from 'react';
import type { AxiosRequestConfig } from 'axios';
import api from '@/lib/api';

interface UseApiState<T> {
  data:      T | null;
  isLoading: boolean;
  error:     string | null;
}

/* Generic fetch hook */
export function useApi<T>(url: string, params?: object, deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, isLoading: true, error: null });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data } = await api.get<{ success: boolean; data: T }>(url, { params });
      setState({ data: data.data, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      setState({ data: null, isLoading: false, error: msg });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params), ...deps]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}

/* Mutation hook */
export function useMutation<TData, TPayload>(
  method: 'post' | 'put' | 'delete' | 'patch',
  url: string,
  config?: AxiosRequestConfig
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const mutate = useCallback(async (payload?: TPayload): Promise<TData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api[method]<{ success: boolean; data: TData }>(url, payload, config);
      return data.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [method, url, config]);

  return { mutate, isLoading, error };
}

/* Infinite scroll hook */
export function useInfiniteApi<T>(baseUrl: string, limit = 12) {
  const [items, setItems]     = useState<T[]>([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (p = 1, reset = false) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(baseUrl, { params: { page: p, limit } });
      const items = data.data as T[];
      setItems(prev => reset ? items : [...prev, ...items]);
      setHasMore(p < (data.pagination?.pages || 1));
      setPage(p);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, limit]);

  useEffect(() => { load(1, true); }, [load]);

  const loadMore = () => { if (hasMore && !isLoading) load(page + 1); };
  const reset    = () => { load(1, true); };

  return { items, isLoading, hasMore, loadMore, reset };
}
