import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/auth.js';
import {
  DemandPrediction,
  DemandPredictionResponse,
  InventoryItem
} from '../shared/models.js';
import { getRedisClient, generateCacheKey, getCache, setCache } from '../shared/redis.js';

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

const REQUIRED_ENV_VARS = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'REDIS_HOST',
  'JWT_SECRET'
];

function validateEnvironment(): void {
  const missing: string[] = [];
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnvironment();

const PORT = parseInt(process.env.PORT || '8003', 10);
const SERVICE_NAME = 'prediction-service';
const VERSION = '1.0.0';

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express();

app.use(express.json());

// =============================================================================
// AUTH MIDDLEWARE
// =============================================================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// =============================================================================
// PREDICTION SERVICE LOGIC
// =============================================================================

/**
 * Mock prediction algorithm for demand forecasting
 * In production, this would use historical sales data, seasonality, and ML models
 */
function calculateDemandPrediction(
  item: InventoryItem,
  targetDate: Date
): DemandPrediction {
  const now = new Date();
  const daysUntilTarget = Math.floor(
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Base prediction from current quantity (simulating expected consumption)
  const baseDemand = Math.max(1, Math.round(item.quantity * 0.3));

  // Adjust for days until expiration (items closer to expiry might need more urgent promotion)
  const expiryDate = new Date(item.expirationDate);
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate confidence based on data quality and freshness
  const lastUpdated = new Date(item.lastUpdated);
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  let confidence = 0.85;

  if (hoursSinceUpdate > 48) confidence -= 0.2;
  if (daysUntilExpiry < 3) confidence -= 0.1;
  if (daysUntilExpiry < 0) confidence -= 0.3;

  confidence = Math.max(0.1, Math.min(1.0, confidence));

  // Adjust demand based on various factors
  let adjustedDemand = baseDemand;

  // Factor in days ahead for prediction
  if (daysUntilTarget > 7) {
    adjustedDemand = Math.round(baseDemand * (1 + (daysUntilTarget - 7) * 0.05));
  }

  // Factor in expiration urgency
  if (daysUntilExpiry < 5) {
    adjustedDemand = Math.round(baseDemand * 1.2);
  }

  return {
    itemId: item.id,
    itemName: item.name,
    predictedDemand: Math.max(0, adjustedDemand),
    predictionDate: targetDate.toISOString(),
    confidence
  };
}

/**
 * Get inventory items for prediction
 * In production, this would query the database
 */
async function getInventoryItems(): Promise<InventoryItem[]> {
  // Mock data - in production, this would be a database query
  const mockItems: InventoryItem[] = [
    {
      id: 1,
      name: 'Tomatoes',
      category: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Storage Room A',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Lettuce',
      category: 'Vegetables',
      quantity: 30,
      unit: 'heads',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Refrigerator 1',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Chicken Breast',
      category: 'Proteins',
      quantity: 20,
      unit: 'kg',
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Freezer 1',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Salmon Fillet',
      category: 'Proteins',
      quantity: 15,
      unit: 'kg',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Refrigerator 2',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Olive Oil',
      category: 'Oils',
      quantity: 10,
      unit: 'liters',
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Pantry',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Fresh Basil',
      category: 'Herbs',
      quantity: 5,
      unit: 'bunches',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Refrigerator 1',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Mozzarella Cheese',
      category: 'Dairy',
      quantity: 8,
      unit: 'kg',
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Refrigerator 1',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 8,
      name: 'Ground Beef',
      category: 'Proteins',
      quantity: 25,
      unit: 'kg',
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Freezer 2',
      lastUpdated: new Date().toISOString()
    }
  ];

  return mockItems;
}

/**
 * Generate demand predictions for all inventory items
 */
async function generateDemandPredictions(
  targetDate: Date
): Promise<DemandPredictionResponse> {
  const items = await getInventoryItems();
  const predictions: DemandPrediction[] = [];

  for (const item of items) {
    const prediction = calculateDemandPrediction(item, targetDate);
    predictions.push(prediction);
  }

  return {
    predictions,
    generatedAt: new Date().toISOString()
  };
}

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: SERVICE_NAME,
    version: VERSION
  });
});

/**
 * GET /api/predictions/demand
 * Get demand predictions for inventory items
 * Query: ?date=YYYY-MM-DD (optional)
 */
app.get(
  '/api/predictions/demand',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dateParam = req.query.date as string | undefined;
      let targetDate: Date;

      if (dateParam) {
        // Validate date format
        const parsedDate = new Date(dateParam);
        if (isNaN(parsedDate.getTime())) {
          res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
          return;
        }
        targetDate = parsedDate;
      } else {
        // Default to tomorrow for prediction
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // Generate cache key based on date
      const dateKey = targetDate.toISOString().split('T')[0];
      const cacheKey = `predictions:demand:${dateKey}`;

      // Try to get from cache first
      try {
        const redisClient = getRedisClient();
        if (redisClient && redisClient.status === 'ready') {
          const cached = await getCache<DemandPredictionResponse>(cacheKey);
          if (cached) {
            res.json(cached);
            return;
          }
        }
      } catch {
        // Cache not available, proceed with generation
      }

      // Generate predictions
      const response = await generateDemandPredictions(targetDate);

      // Cache the result for 5 minutes
      try {
        const redisClient = getRedisClient();
        if (redisClient && redisClient.status === 'ready') {
          await setCache(cacheKey, response, 300);
        }
      } catch {
        // Cache write failed, but still return the response
      }

      res.json(response);
    } catch (error) {
      console.error('Error generating demand predictions:', error);
      res.status(500).json({ error: 'Failed to generate demand predictions' });
    }
  }
);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} v${VERSION} running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/predictions/demand`);
});

export default app;
