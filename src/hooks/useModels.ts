import { useState, useEffect } from 'react';
import { CategorizedModels } from '@/types';

export function useModels() {
  const [models, setModels] = useState<CategorizedModels>({
    all: [],
    free: [],
    vision: [],
    coding: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/models')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch models');
        return res.json();
      })
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { models, loading, error };
}