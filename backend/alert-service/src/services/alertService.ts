/**
 * Alert Service - Business Logic
 * 
 * Contains core business logic for alert operations
 * 
 * Version: 1.0.0
 */

import { getDataSource } from '../../shared/db.js';
import { AlertEntity, Alert, AlertType, AlertSeverity, AlertResponse } from '../../shared/models.js';

/**
 * Validation error class for alert operations
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Input data for creating a new alert
 */
export interface CreateAlertInput {
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId?: number | null;
}

/**
 * Fetch all alerts from the database
 * 
 * @returns Promise<Alert[]> - Array of alert objects
 * @throws Error if database connection is not initialized
 */
export async function findAll(): Promise<Alert[]> {
  const dataSource = getDataSource();
  
  if (!dataSource.isInitialized) {
    throw new Error('Database connection not initialized');
  }
  
  const alertRepository = dataSource.getRepository(AlertEntity);
  
  const alertEntities = await alertRepository.find({
    order: {
      createdAt: 'DESC'
    }
  });
  
  const alerts: Alert[] = alertEntities.map(entity => ({
    id: entity.id,
    type: entity.type as AlertType,
    message: entity.message,
    severity: entity.severity as AlertSeverity,
    relatedItemId: entity.relatedItemId,
    createdAt: entity.createdAt.toISOString(),
    acknowledged: entity.acknowledged
  }));
  
  return alerts;
}

/**
 * Fetch all alerts (alias for findAll)
 * 
 * @returns Promise<Alert[]>
 */
export async function getAlerts(): Promise<Alert[]> {
  return findAll();
}

/**
 * Find an alert by its ID
 * 
 * @param id - The alert ID to search for
 * @returns Promise<Alert | null> - Alert object if found, null otherwise
 */
export async function findById(id: number): Promise<Alert | null> {
  const dataSource = getDataSource();
  
  if (!dataSource.isInitialized) {
    throw new Error('Database connection not initialized');
  }
  
  const alertRepository = dataSource.getRepository(AlertEntity);
  
  const entity = await alertRepository.findOne({
    where: { id }
  });
  
  if (!entity) {
    return null;
  }
  
  return {
    id: entity.id,
    type: entity.type as AlertType,
    message: entity.message,
    severity: entity.severity as AlertSeverity,
    relatedItemId: entity.relatedItemId,
    createdAt: entity.createdAt.toISOString(),
    acknowledged: entity.acknowledged
  };
}

/**
 * Create a new alert
 * 
 * @param input - Alert data to create
 * @returns Promise<Alert> - Created alert object
 * @throws ValidationError if required fields are missing
 */
export async function create(input: CreateAlertInput): Promise<Alert> {
  // Validate required fields
  if (!input.type) {
    throw new ValidationError('Alert type is required');
  }
  
  if (!input.message) {
    throw new ValidationError('Alert message is required');
  }
  
  if (!input.severity) {
    throw new ValidationError('Alert severity is required');
  }
  
  // Validate enum values
  const validTypes = Object.values(AlertType);
  if (!validTypes.includes(input.type)) {
    throw new ValidationError(`Invalid alert type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  const validSeverities = Object.values(AlertSeverity);
  if (!validSeverities.includes(input.severity)) {
    throw new ValidationError(`Invalid alert severity. Must be one of: ${validSeverities.join(', ')}`);
  }
  
  const dataSource = getDataSource();
  
  if (!dataSource.isInitialized) {
    throw new Error('Database connection not initialized');
  }
  
  const alertRepository = dataSource.getRepository(AlertEntity);
  
  const newAlert = alertRepository.create({
    type: input.type,
    message: input.message,
    severity: input.severity,
    relatedItemId: input.relatedItemId ?? null,
    acknowledged: false
  });
  
  const savedAlert = await alertRepository.save(newAlert);
  
  return {
    id: savedAlert.id,
    type: savedAlert.type as AlertType,
    message: savedAlert.message,
    severity: savedAlert.severity as AlertSeverity,
    relatedItemId: savedAlert.relatedItemId,
    createdAt: savedAlert.createdAt.toISOString(),
    acknowledged: savedAlert.acknowledged
  };
}

/**
 * Delete an alert by its ID
 * 
 * @param id - The alert ID to delete
 * @returns Promise<boolean> - true if deleted successfully, false if not found
 */
export async function remove(id: number): Promise<boolean> {
  const dataSource = getDataSource();
  
  if (!dataSource.isInitialized) {
    throw new Error('Database connection not initialized');
  }
  
  const alertRepository = dataSource.getRepository(AlertEntity);
  
  const alert = await alertRepository.findOne({
    where: { id }
  });
  
  if (!alert) {
    return false;
  }
  
  await alertRepository.remove(alert);
  
  return true;
}

/**
 * Acknowledge an alert by setting acknowledged to true
 * 
 * @param alertId - The ID of the alert to acknowledge
 * @returns Promise<boolean> - true if successful, false if not found
 */
export async function acknowledgeAlert(alertId: number): Promise<boolean> {
  const dataSource = getDataSource();
  
  if (!dataSource.isInitialized) {
    throw new Error('Database connection not initialized');
  }
  
  const alertRepository = dataSource.getRepository(AlertEntity);
  
  const alert = await alertRepository.findOne({
    where: { id: alertId }
  });
  
  if (!alert) {
    return false;
  }
  
  alert.acknowledged = true;
  await alertRepository.save(alert);
  
  return true;
}
