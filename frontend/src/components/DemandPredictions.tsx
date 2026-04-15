import React, { useEffect, useState } from 'react';
import { usePredictions } from '../hooks/usePredictions';
import { DemandPrediction } from '../types';

const DemandPredictions: React.FC = () => {
  const { predictions, generatedAt, loading, error, fetchPredictions } = usePredictions();
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchPredictions(date);
    } else {
      fetchPredictions();
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#22c55e';
    if (confidence >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="predictions-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictions-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => fetchPredictions()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-container">
      <div className="predictions-header">
        <h2>Demand Predictions</h2>
        <div className="date-filter">
          <label htmlFor="prediction-date">Filter by Date:</label>
          <input
            type="date"
            id="prediction-date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-input"
          />
        </div>
      </div>

      {generatedAt && (
        <p className="generated-at">
          Last updated: {new Date(generatedAt).toLocaleString()}
        </p>
      )}

      {predictions.length === 0 ? (
        <div className="empty-state">
          <p>No predictions available.</p>
        </div>
      ) : (
        <div className="predictions-grid">
          {predictions.map((prediction: DemandPrediction) => (
            <div key={prediction.itemId} className="prediction-card">
              <div className="prediction-header">
                <h3>{prediction.itemName}</h3>
                <span
                  className="confidence-badge"
                  style={{ backgroundColor: getConfidenceColor(prediction.confidence) }}
                >
                  {getConfidenceLabel(prediction.confidence)}
                </span>
              </div>
              <div className="prediction-details">
                <div className="prediction-stat">
                  <label>Predicted Demand:</label>
                  <span className="stat-value">{prediction.predictedDemand}</span>
                </div>
                <div className="prediction-stat">
                  <label>Prediction Date:</label>
                  <span className="stat-value">
                    {new Date(prediction.predictionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="prediction-stat">
                  <label>Confidence:</label>
                  <span className="stat-value">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemandPredictions;
