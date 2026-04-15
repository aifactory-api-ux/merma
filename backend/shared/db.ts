/**
 * TypeORM DataSource and connection helpers for shared/db.ts
 */
import "reflect-metadata";
import { DataSource, Repository } from "typeorm";
import { User } from "./models";
import { config } from "./config";

// You can add more entities to this array as needed
const entities = [User];

// DataSource configuration using environment variables
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || config.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || config.DB_PORT || 5432),
  username: process.env.DB_USER || config.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || config.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || config.DB_NAME || "postgres",
  synchronize: true, // Set to false in production
  logging: false,
  entities,
});

let initialized = false;

export async function initializeDataSource(): Promise<DataSource> {
  if (!initialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    initialized = true;
  }
  return AppDataSource;
}

export function getRepository<T>(entity: { new (): T }): Repository<T> {
  if (!AppDataSource.isInitialized) {
    throw new Error("DataSource is not initialized. Call initializeDataSource() first.");
  }
  return AppDataSource.getRepository(entity);
}
