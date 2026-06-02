/**
 * Generic Supabase data-fetching hooks.
 * These replace the previous Express-API-based hooks.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseState<T> {
  data:      T | null;
  isLoading: boolean;
  error:     string | null;
}

/** Fetch a list of rows from a Supabase table. */
export function useTable<T>(
  table: string,
  opts: { limit?: number; match?: Record<string, unknown>; order?: string } = {}
) {
  const [state, setState] = useState<UseSupabaseState<T[]>>({
    data: null, isLoading: true, error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase.from(table).select('*');
      if (opts.match) {
        Object.entries(opts.match).forEach(([col, val]) => { q = q.eq(col, val); });
      }
      if (opts.order) q = q.order(opts.order, { ascending: false });
      if (opts.limit)  q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      setState({ data: data as T[], isLoading: false, error: null });
    } catch (err: unknown) {
      setState({ data: null, isLoading: false, error: (err as Error).message || 'Erreur' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, JSON.stringify(opts)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}

/** Simple mutation: insert/update/delete a row in a Supabase table. */
export function useSupabaseMutation<TPayload extends object>(table: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const insert = useCallback(async (payload: TPayload) => {
    setIsLoading(true); setError(null);
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    setIsLoading(false);
    if (error) { setError(error.message); return null; }
    return data;
  }, [table]);

  const update = useCallback(async (id: string, payload: Partial<TPayload>) => {
    setIsLoading(true); setError(null);
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    setIsLoading(false);
    if (error) { setError(error.message); return null; }
    return data;
  }, [table]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true); setError(null);
    const { error } = await supabase.from(table).delete().eq('id', id);
    setIsLoading(false);
    if (error) { setError(error.message); return false; }
    return true;
  }, [table]);

  return { insert, update, remove, isLoading, error };
}
