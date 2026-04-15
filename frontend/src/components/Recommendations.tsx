import React, { useEffect } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { Recommendation } from '../types';

const Recommendations: React.FC = () => {
  const { recommendations, generatedAt, loading, error, fetchRecommendations } = useRecommendations();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const getActionColor = (action: Recommendation['action']): string => {
    switch (action) {
      case 'order_more':
        return '#3b82f6';
      case 'reduce_stock':
        return '#f59e0b';
      case 'promote_sale':
        return '#22c55e';
      case 'monitor':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getActionLabel = (action: Recommendation['action']): string => {
    switch (action) {
      case 'order_more':
        return 'Order More';
      case 'reduce_stock':
        return 'Reduce Stock';
      case 'promote_sale':
        return 'Promote Sale';
      case 'monitor':
        return 'Monitor';
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => fetchRecommendations()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Recommendations</h2>
        <button onClick={() => fetchRecommendations()} className="refresh-button">
          Refresh
        </button>
      </div>

      {generatedAt && (
        <p className="generated-at">
          Generated: {new Date(generatedAt).toLocaleString()}
        </p>
      )}

      {recommendations.length === 0 ? (
        <div className="empty-state">
          <p>No recommendations available.</p>
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec: Recommendation) => (
            <div key={rec.id} className="recommendation-card">
              <div className="recommendation-header">
                <h3>{rec.itemName}</h3>
                <span
                  className="action-badge"
                  style={{ backgroundColor: getActionColor(rec.action) }}
                >
                  {getActionLabel(rec.action)}
                </span>
              </div>
              <p className="recommendation-reason">{rec.reason}</p>
              <p className="recommendation-date">
                Created: {new Date(rec.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
