/**
 * Merma Project - Main App Component
 * 
 * Root React component for the dashboard application.
 * Handles routing and global state.
 * 
 * Version: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.js.js';
import { useAlerts } from './hooks/useAlerts.js.js';
import { useRecommendations } from './hooks/useRecommendations.js.js';
import { usePredictions } from './hooks/usePredictions.js.js';
import { useInventory } from './hooks/useInventory.js.js';
import DashboardPage from './pages/DashboardPage.js.jsx';
import LoginPage from './pages/LoginPage.js.jsx';

/**
 * Main App Component
 */
function App() {
  // State for authentication
  const { isAuthenticated, isLoading: authLoading, login, logout, token } = useAuth();
  
  // State for dashboard data
  const { alerts, loading: alertsLoading, error: alertsError, fetchAlerts } = useAlerts();
  const { recommendations, loading: recLoading, error: recError, fetchRecommendations } = useRecommendations();
  const { predictions, loading: predLoading, error: predError, fetchPredictions } = usePredictions();
  const { inventory, loading: invLoading, error: invError, fetchInventory } = useInventory();

  // Loading state for initial data fetch
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      setIsDataLoading(true);
      
      // Fetch all dashboard data
      Promise.all([
        fetchAlerts(),
        fetchRecommendations(),
        fetchPredictions(),
        fetchInventory(),
      ])
        .finally(() => {
          setIsDataLoading(false);
        });
    }
  }, [isAuthenticated, token]);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Refresh dashboard data
  const refreshData = async () => {
    setIsDataLoading(true);
    try {
      await Promise.all([
        fetchAlerts(),
        fetchRecommendations(),
        fetchPredictions(),
        fetchInventory(),
      ]);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        isLoading={authLoading}
      />
    );
  }

  // Show dashboard
  return (
    <DashboardPage
      token={token || ''}
      user={{
        email: 'user@example.com',
        role: 'manager',
      }}
      alerts={alerts}
      recommendations={recommendations}
      predictions={predictions}
      inventory={inventory}
      alertsLoading={alertsLoading || isDataLoading}
      recommendationsLoading={recLoading || isDataLoading}
      predictionsLoading={predLoading || isDataLoading}
      inventoryLoading={invLoading || isDataLoading}
      alertsError={alertsError}
      recommendationsError={recError}
      predictionsError={predError}
      inventoryError={invError}
      onLogout={handleLogout}
      onRefresh={refreshData}
    />
  );
}

export default App;
