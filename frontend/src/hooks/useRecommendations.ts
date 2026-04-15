import { useState, useEffect, useCallback } from 'react';
import { Recommendation, RecommendationResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  generatedAt: string | null;
  loading: boolean;
  error: string | null;
  fetchRecommendations: () => Promise<void>;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    // FIX: Use the correct token key as used in the rest of the app
    return localStorage.getItem('merma_token');
  };

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const response = await fetch(`${API_URL}/api/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to fetch recommendations' }));
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
      const data: RecommendationResponse = await response.json();
      setRecommendations(data.recommendations || []);
      setGeneratedAt(data.generatedAt || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, generatedAt, loading, error, fetchRecommendations };
}
