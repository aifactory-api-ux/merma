/**
 * Merma Project - Alert Service Shared Models
 * 
 * Local copy of shared models for the alert service.
 * Provides type definitions for alerts and related entities.
 * 
 * Version: 1.0.0
 */

/**
 * Alert types in the system
 */
export enum AlertType {
  RISK = 'risk',
  STOCKOUT = 'stockout',
  EXPIRATION = 'expiration',
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Alert interface
 */
export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId: number | null;
  createdAt: string;
  acknowledged: boolean;
}

/**
 * Alert response interface
 */
export interface AlertResponse {
  alerts: Alert[];
}

/**
 * Alert creation request interface
 */
export interface CreateAlertRequest {
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId?: number;
}

/**
 * Alert update request interface
 */
export interface UpdateAlertRequest {
  acknowledged?: boolean;
}

/**
 * Alert filter options
 */
export interface AlertFilter {
  acknowledged?: boolean;
  severity?: AlertSeverity;
  type?: AlertType;
}

/**
 * Alert statistics interface
 */
export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unacknowledged: number;
}

export default {
  AlertType,
  AlertSeverity,
  Alert,
  AlertResponse,
  CreateAlertRequest,
  UpdateAlertRequest,
  AlertFilter,
  AlertStats,
};
