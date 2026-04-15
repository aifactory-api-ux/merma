import { useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsAuthenticated(true);
      setToken('mock-token');
      setIsLoading(false);
    }, 500);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
  };

  return { isAuthenticated, isLoading, login, logout, token };
}
