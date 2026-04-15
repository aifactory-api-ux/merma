import React, { useEffect } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { Alert } from '../types';

const Alerts: React.FC = () => {
  const { alerts, loading, error, fetchAlerts, acknowledgeAlert } = useAlerts();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getSeverityColor = (severity: Alert['severity']): string => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: Alert['severity']): string => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getTypeLabel = (type: Alert['type']): string => {
    switch (type) {
      case 'risk':
        return 'Risk';
      case 'stockout':
        return 'Stock Out';
      case 'expiration':
        return 'Expiration';
      default:
        return type;
    }
  };

  const handleAcknowledge = async (id: number) => {
    await acknowledgeAlert(id);
  };

  if (loading) {
    return (
      <div className="alerts-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alerts-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => fetchAlerts()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged);

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>Alerts</h2>
        <button onClick={() => fetchAlerts()} className="refresh-button">
          Refresh
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <p>No alerts at this time.</p>
        </div>
      ) : (
        <>
          {unacknowledgedAlerts.length > 0 && (
            <div className="alerts-section">
              <h3>Active Alerts ({unacknowledgedAlerts.length})</h3>
              <div className="alerts-list">
                {unacknowledgedAlerts.map((alert: Alert) => (
                  <div
                    key={alert.id}
                    className={`alert-card alert-${alert.severity}`}
                  >
                    <div className="alert-header">
                      <span className="alert-icon">
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="alert-type">{getTypeLabel(alert.type)}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <p className="alert-date">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="acknowledge-button"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {acknowledgedAlerts.length > 0 && (
            <div className="alerts-section">
              <h3>Acknowledged ({acknowledgedAlerts.length})</h3>
              <div className="alerts-list">
                {acknowledgedAlerts.map((alert: Alert) => (
                  <div
                    key={alert.id}
                    className="alert-card acknowledged"
                  >
                    <div className="alert-header">
                      <span className="alert-icon">
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="alert-type">{getTypeLabel(alert.type)}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <p className="alert-date">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                    <span className="acknowledged-badge">Acknowledged</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Alerts;
