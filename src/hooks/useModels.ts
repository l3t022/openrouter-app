import useSWR from 'swr';
import { CategorizedModels } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function useModels() {
  const { data, error, isLoading, mutate } = useSWR<CategorizedModels>(
    '/api/models',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      fallbackData: {
        all: [],
        free: [],
        vision: [],
        coding: [],
      },
    }
  );

  return {
    models: data || { all: [], free: [], vision: [], coding: [] },
    loading: isLoading,
    error,
    refresh: mutate,
  };
}