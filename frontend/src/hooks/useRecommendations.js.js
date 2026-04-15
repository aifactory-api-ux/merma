import { useState } from 'react';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    // Simulate fetch
    setTimeout(() => {
      setRecommendations([
        { id: 1, itemId: 101, action: 'order_more', reason: 'Stock below threshold', createdAt: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 500);
  };

  return { recommendations, loading, error, fetchRecommendations };
}
