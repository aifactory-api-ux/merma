import { useState } from 'react';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    // Simulate fetch
    setTimeout(() => {
      setAlerts([
        { id: 1, message: 'Low stock: Tomatoes', type: 'warning' },
      ]);
      setLoading(false);
    }, 500);
  };

  return { alerts, loading, error, fetchAlerts };
}
