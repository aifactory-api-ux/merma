import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  acknowledgeAlert: (id: number) => Promise<boolean>;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    // FIX: Use the correct token key as used in the rest of the app
    return localStorage.getItem('merma_token');
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const response = await fetch(`${API_URL}/api/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to fetch alerts' }));
        throw new Error(data.error || 'Failed to fetch alerts');
      }
      const data: AlertResponse = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (id: number): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return false;
      }
      const response = await fetch(`${API_URL}/api/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // API contract: no body required for acknowledge
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to acknowledge alert' }));
        throw new Error(data.error || 'Failed to acknowledge alert');
      }
      await fetchAlerts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
      return false;
    }
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, error, fetchAlerts, acknowledgeAlert };
}
