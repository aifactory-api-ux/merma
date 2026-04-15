/**
 * Merma Project - Inventory Overview Component
 * 
 * Dashboard component displaying inventory overview with metrics,
 * low stock items, and expiring soon items.
 * 
 * Version: 1.0.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InventoryOverview as InventoryOverviewType, InventoryItem } from '../types';
import { API_ENDPOINTS } from '../config';
import axios from 'axios';

/**
 * Inventory Overview Component
 * 
 * Displays key inventory metrics and alerts for low stock and expiring items.
 * Requires authentication to fetch data from the inventory service.
 */
export default function InventoryOverview() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<InventoryOverviewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get<InventoryOverviewType>(
          `${API_ENDPOINTS.inventory}/overview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOverview(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch inventory overview');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [token]);

  if (isLoading) {
    return (
      <div className="inventory-overview loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading inventory overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-overview error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="inventory-overview empty">
        <p>No inventory data available</p>
      </div>
    );
  }

  return (
    <div className="inventory-overview">
      <div className="overview-header">
        <h2>Inventory Overview</h2>
      </div>

      <div className="overview-metrics">
        <div className="metric-card total-items">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <span className="metric-value">{overview.totalItems}</span>
            <span className="metric-label">Total Items</span>
          </div>
        </div>

        <div className="metric-card total-value">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <span className="metric-value">
              {overview.currency}{overview.totalValue.toLocaleString()}
            </span>
            <span className="metric-label">Total Value</span>
          </div>
        </div>

        <div className="metric-card low-stock">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <span className="metric-value">{overview.lowStockItems.length}</span>
            <span className="metric-label">Low Stock Items</span>
          </div>
        </div>

        <div className="metric-card expiring-soon">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <span className="metric-value">{overview.expiringSoonItems.length}</span>
            <span className="metric-label">Expiring Soon</span>
          </div>
        </div>
      </div>

      <div className="overview-sections">
        {overview.lowStockItems.length > 0 && (
          <div className="overview-section low-stock-section">
            <h3>Low Stock Items</h3>
            <div className="items-list">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.lowStockItems.map((item: InventoryItem) => (
                    <tr key={item.id} className="low-stock-row">
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td className="quantity-cell">{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {overview.expiringSoonItems.length > 0 && (
          <div className="overview-section expiring-soon-section">
            <h3>Expiring Soon Items</h3>
            <div className="items-list">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Expiration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.expiringSoonItems.map((item: InventoryItem) => (
                    <tr key={item.id} className="expiring-soon-row">
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td className="quantity-cell">{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
