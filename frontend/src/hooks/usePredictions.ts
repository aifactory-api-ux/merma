import { useState, useEffect, useCallback } from 'react';
import { DemandPrediction, DemandPredictionResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UsePredictionsReturn {
  predictions: DemandPrediction[];
  generatedAt: string | null;
  loading: boolean;
  error: string | null;
  fetchPredictions: (date?: string) => Promise<void>;
}

export function usePredictions(): UsePredictionsReturn {
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    // FIX: Use the correct token key as used in the rest of the app
    return localStorage.getItem('merma_token');
  };

  const fetchPredictions = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      let url = `${API_URL}/api/predictions/demand`;
      if (date) {
        url += `?date=${encodeURIComponent(date)}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to fetch predictions' }));
        throw new Error(data.error || 'Failed to fetch predictions');
      }
      const data: DemandPredictionResponse = await response.json();
      setPredictions(data.predictions || []);
      setGeneratedAt(data.generatedAt || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, generatedAt, loading, error, fetchPredictions };
}
