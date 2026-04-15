/**
 * Merma Project - Auth Service Shared DB
 *
 * Provides database configuration and data source utilities for Auth Service.
 * This file is required for compatibility with imports in src/services/authService.js.ts.
 *
 * Version: 1.0.0
 */

import { DataSource } from 'typeorm';
import { UserEntity } from './models.js';

let dataSource: DataSource | null = null;

export function getDatabaseConfig() {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'merma',
    synchronize: false,
    logging: false,
    entities: [UserEntity],
  };
}

export async function getDataSource(config?: any): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }
  dataSource = new DataSource(config || getDatabaseConfig());
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}
