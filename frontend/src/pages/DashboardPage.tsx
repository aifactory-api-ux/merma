import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import InventoryOverviewComponent from '../components/InventoryOverview';
import DemandPredictions from '../components/DemandPredictions';
import Recommendations from '../components/Recommendations';
import Alerts from '../components/Alerts';

type TabType = 'overview' | 'predictions' | 'recommendations' | 'alerts';

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !localStorage.getItem('auth_token')) {
      window.location.href = '/login';
    }
  }, [authLoading]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="dashboard-error">
        <p>Authentication error: {authError}</p>
        <button onClick={() => window.location.href = '/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <InventoryOverviewComponent />;
      case 'predictions':
        return <DemandPredictions />;
      case 'recommendations':
        return <Recommendations />;
      case 'alerts':
        return <Alerts />;
      default:
        return <InventoryOverviewComponent />;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>Merma</h1>
          <button
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Inventory</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-label">Predictions</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            <span className="nav-icon">💡</span>
            <span className="nav-label">Recommendations</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Alerts</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-email">{user?.email}</p>
            <p className="user-role">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>
            {activeTab === 'overview' && 'Inventory Overview'}
            {activeTab === 'predictions' && 'Demand Predictions'}
            {activeTab === 'recommendations' && 'Recommendations'}
            {activeTab === 'alerts' && 'Alerts'}
          </h2>
        </header>
        <div className="dashboard-content">{renderContent()}</div>
      </main>
    </div>
  );
};

export default DashboardPage;
