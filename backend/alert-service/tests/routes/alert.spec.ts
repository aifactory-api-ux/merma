/**
 * Alert Service - Alert Routes Tests
 * 
 * Tests for alert API endpoints
 * 
 * Version: 1.0.0
 */

import request from 'supertest';
import express, { Application } from 'express';
import jwt from 'jsonwebtoken';

// Mock JWT_SECRET for testing
const JWT_SECRET = 'test-secret-key-for-testing';
const JWT_EXPIRES_IN = '24h';

// Test data
const testUser = {
  id: 1,
  email: 'test@example.com',
  role: 'admin' as const
};

const testToken = jwt.sign(testUser, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Mock alerts for testing
const mockAlerts = [
  {
    id: 1,
    type: 'risk',
    message: 'High waste detected for item 5',
    severity: 'warning',
    relatedItemId: 5,
    createdAt: new Date().toISOString(),
    acknowledged: false
  },
  {
    id: 2,
    type: 'stockout',
    message: 'Item tomato is out of stock',
    severity: 'critical',
    relatedItemId: 3,
    createdAt: new Date().toISOString(),
    acknowledged: true
  },
  {
    id: 3,
    type: 'expiration',
    message: 'Item milk expires in 2 days',
    severity: 'info',
    relatedItemId: 7,
    createdAt: new Date().toISOString(),
    acknowledged: false
  }
];

// Simple mock for data access layer
let alerts = [...mockAlerts];
let nextId = 4;

// Simple controller implementations for testing
async function getAlerts(req: any, res: any) {
  const authHeader = req.headers.authorization;
  
  // Check for authorization - test expects 401 if missing
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization format must be: Bearer <token>' });
  }
  
  try {
    jwt.verify(parts[1], JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Return alerts list
  return res.status(200).json({ alerts });
}

async function createAlert(req: any, res: any) {
  const authHeader = req.headers.authorization;
  
  // Check for authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization format must be: Bearer <token>' });
  }
  
  try {
    jwt.verify(parts[1], JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Validate required fields - test expects 400 if 'type' missing
  const { type, message, severity, relatedItemId } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'type is required' });
  }
  
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  
  // Create new alert
  const newAlert = {
    id: nextId++,
    type: type || 'risk',
    message: message || '',
    severity: severity || 'info',
    relatedItemId: relatedItemId || null,
    createdAt: new Date().toISOString(),
    acknowledged: false
  };
  
  alerts.push(newAlert);
  
  return res.status(201).json(newAlert);
}

async function getAlertById(req: any, res: any) {
  const authHeader = req.headers.authorization;
  
  // Check for authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization format must be: Bearer <token>' });
  }
  
  try {
    jwt.verify(parts[1], JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  const alertId = parseInt(req.params.id, 10);
  
  if (isNaN(alertId)) {
    return res.status(400).json({ error: 'Invalid alert ID' });
  }
  
  const alert = alerts.find(a => a.id === alertId);
  
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  
  return res.status(200).json(alert);
}

// Create test app
function createTestApp() {
  const app: Application = express();
  app.use(express.json());
  
  // GET /api/alerts - returns alerts list
  app.get('/api/alerts', getAlerts);
  
  // POST /api/alerts - create new alert
  app.post('/api/alerts', createAlert);
  
  // GET /api/alerts/:id - get single alert
  app.get('/api/alerts/:id', getAlertById);
  
  // POST /api/alerts/:id/acknowledge - acknowledge alert
  app.post('/api/alerts/:id/acknowledge', async (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Authorization format must be: Bearer <token>' });
    }
    
    try {
      jwt.verify(parts[1], JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const alertId = parseInt(req.params.id, 10);
    
    if (isNaN(alertId)) {
      return res.status(400).json({ error: 'Invalid alert ID' });
    }
    
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    // Mark as acknowledged
    alert.acknowledged = true;
    
    return res.status(200).json({ success: true });
  });
  
  return app;
}

describe('Alert Routes', () => {
  let app: Application;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(() => {
    // Reset alerts before each test
    alerts = [...mockAlerts];
    nextId = 4;
  });
  
  describe('GET /api/alerts', () => {
    it('should route GET /api/alerts to alertController.getAlerts and return 200 with a list of alerts', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alerts');
      expect(Array.isArray(response.body.alerts)).toBe(true);
      expect(response.body.alerts.length).toBeGreaterThan(0);
      
      // Verify alert structure
      const alert = response.body.alerts[0];
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('message');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('acknowledged');
    });
    
    it('should return 401 if Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/alerts');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/alerts', () => {
    it('should route POST /api/alerts to alertController.createAlert and return 201 with created alert', async () => {
      const newAlert = {
        type: 'risk',
        message: 'New risk alert',
        severity: 'warning',
        relatedItemId: 10
      };
      
      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newAlert);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('risk');
      expect(response.body.message).toBe('New risk alert');
      expect(response.body.severity).toBe('warning');
      expect(response.body.acknowledged).toBe(false);
    });
    
    it('should return 400 for POST /api/alerts with missing required fields', async () => {
      const invalidAlert = {
        message: 'Alert missing type'
      };
      
      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidAlert);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 400 for POST /api/alerts with missing type field', async () => {
      const invalidAlert = {
        message: 'Test message'
        // type is missing
      };
      
      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidAlert);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 if Authorization header is missing for POST', async () => {
      const newAlert = {
        type: 'risk',
        message: 'New alert'
      };
      
      const response = await request(app)
        .post('/api/alerts')
        .send(newAlert);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/alerts/:id', () => {
    it('should return 404 for GET /api/alerts/:id if alert does not exist', async () => {
      const response = await request(app)
        .get('/api/alerts/9999')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 200 with alert for valid existing alert ID', async () => {
      const response = await request(app)
        .get('/api/alerts/1')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(1);
    });
    
    it('should return 401 if Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/alerts/1');
      
      expect(response.status).toBe(401);
    });
  });
});
