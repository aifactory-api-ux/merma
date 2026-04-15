import { useState } from 'react';

export function usePredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    // Simulate fetch
    setTimeout(() => {
      setPredictions([
        { id: 1, itemId: 101, predictedDemand: 20, date: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 500);
  };

  return { predictions, loading, error, fetchPredictions };
}
