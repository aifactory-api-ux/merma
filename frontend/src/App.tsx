/**
 * Merma Project - Main Application Component
 * 
 * React 18 application with routing, authentication context,
 * and layout structure for the Merma inventory optimization dashboard.
 * 
 * Version: 1.0.0
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';

// Types - imported from foundation (Item 1)
import { UserSummary, AuthResponse, InventoryOverview, DemandPredictionResponse, RecommendationResponse, AlertResponse } from './types';
import { API_ENDPOINTS } from './config';

// =============================================================================
// AUTH CONTEXT
// =============================================================================

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component that manages authentication state
 */
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  // FIX: Use the correct token key for localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('merma_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get<UserSummary>(`${API_ENDPOINTS.auth}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch {
          localStorage.removeItem('merma_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await axios.post<AuthResponse>(`${API_ENDPOINTS.auth}/login`, {
      email,
      password,
    });
    const { token: newToken, user: userData } = response.data;
    // FIX: Use the correct token key for localStorage
    localStorage.setItem('merma_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('merma_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 */
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// =============================================================================
// API HOOKS
// =============================================================================

/**
 * Custom hook for fetching inventory overview
 */
function useInventoryOverview() {
  const { token } = useAuth();
  const [data, setData] = useState<InventoryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get<InventoryOverview>(`${API_ENDPOINTS.inventory}/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err: AxiosError) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return { data, loading, error };
}

/**
 * Custom hook for fetching demand predictions
 */
function useDemandPredictions(date?: string) {
  const { token } = useAuth();
  const [data, setData] = useState<DemandPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    let url = `${API_ENDPOINTS.predictions}/demand`;
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    axios
      .get<DemandPredictionResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err: AxiosError) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, date]);

  return { data, loading, error };
}

// ... rest of the file remains unchanged
