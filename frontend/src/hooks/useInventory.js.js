import { useState } from 'react';

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    // Simulate fetch
    setTimeout(() => {
      setInventory([
        { id: 101, name: 'Tomatoes', quantity: 12, unit: 'kg', expirationDate: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 500);
  };

  return { inventory, loading, error, fetchInventory };
}
