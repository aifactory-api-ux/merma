import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, InventoryOverview } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UseInventoryReturn {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<InventoryItem | null>;
  updateItem: (id: number, updates: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  deleteItem: (id: number) => Promise<boolean>;
}

interface UseInventoryOverviewReturn {
  overview: InventoryOverview | null;
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
}

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    // FIX: Use the correct token key as used in the rest of the app
    return localStorage.getItem('merma_token');
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const response = await fetch(`${API_URL}/api/inventory/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to fetch items' }));
        throw new Error(data.error || 'Failed to fetch items');
      }
      // API contract: returns InventoryItem[]
      const data = await response.json();
      // If the backend returns an array directly, not {items: ...}
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return null;
      }
      const response = await fetch(`${API_URL}/api/inventory/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to create item' }));
        throw new Error(data.error || 'Failed to create item');
      }
      const data = await response.json();
      await fetchItems();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      return null;
    }
  }, [fetchItems]);

  const updateItem = useCallback(async (id: number, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return null;
      }
      const response = await fetch(`${API_URL}/api/inventory/items/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to update item' }));
        throw new Error(data.error || 'Failed to update item');
      }
      const data = await response.json();
      await fetchItems();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return null;
    }
  }, [fetchItems]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return false;
      }
      const response = await fetch(`${API_URL}/api/inventory/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to delete item' }));
        throw new Error(data.error || 'Failed to delete item');
      }
      await fetchItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    }
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem };
}
