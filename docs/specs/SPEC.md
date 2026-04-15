# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.x
  - Express.js v4.18.x
  - PostgreSQL v15.x
  - Redis v7.x
- **Frontend**
  - React v18.x
  - TypeScript v5.x
- **Infrastructure**
  - Docker v24.x
  - docker-compose v2.x
  - Kubernetes (AWS EKS, manifests in YAML)
  - AWS (ECR, RDS, ElastiCache, S3 for static assets)
- **Other**
  - JWT (jsonwebtoken v9.x)
  - dotenv v16.x
  - TypeORM v0.3.x (for PostgreSQL)
  - ioredis v5.x

---

## 2. DATA CONTRACTS

### Backend (TypeScript interfaces)

#### User

```typescript
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'chef' | 'staff';
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}
```

#### AuthRequest

```typescript
export interface AuthRequest {
  email: string;
  password: string;
}
```

#### AuthResponse

```typescript
export interface AuthResponse {
  token: string;
  user: UserSummary;
}
```

#### UserSummary

```typescript
export interface UserSummary {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'chef' | 'staff';
}
```

#### InventoryItem

```typescript
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string; // ISO8601
  location: string;
  lastUpdated: string; // ISO8601
}
```

#### InventoryOverview

```typescript
export interface InventoryOverview {
  totalItems: number;
  lowStockItems: InventoryItem[];
  expiringSoonItems: InventoryItem[];
  totalValue: number;
  currency: string;
}
```

#### DemandPrediction

```typescript
export interface DemandPrediction {
  itemId: number;
  itemName: string;
  predictedDemand: number;
  predictionDate: string; // ISO8601
  confidence: number; // 0-1
}
```

#### DemandPredictionResponse

```typescript
export interface DemandPredictionResponse {
  predictions: DemandPrediction[];
  generatedAt: string; // ISO8601
}
```

#### Recommendation

```typescript
export interface Recommendation {
  id: number;
  itemId: number;
  itemName: string;
  action: 'order_more' | 'reduce_stock' | 'promote_sale' | 'monitor';
  reason: string;
  createdAt: string; // ISO8601
}
```

#### RecommendationResponse

```typescript
export interface RecommendationResponse {
  recommendations: Recommendation[];
  generatedAt: string; // ISO8601
}
```

#### Alert

```typescript
export interface Alert {
  id: number;
  type: 'risk' | 'stockout' | 'expiration';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  relatedItemId: number | null;
  createdAt: string; // ISO8601
  acknowledged: boolean;
}
```

#### AlertResponse

```typescript
export interface AlertResponse {
  alerts: Alert[];
}
```

---

### Frontend (TypeScript interfaces)

> All interfaces are identical to backend contracts above, except for the omission of sensitive fields (e.g., `passwordHash` is never exposed to frontend).

#### UserSummary

```typescript
export interface UserSummary {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'chef' | 'staff';
}
```

#### AuthResponse

```typescript
export interface AuthResponse {
  token: string;
  user: UserSummary;
}
```

#### InventoryItem

```typescript
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: string;
  lastUpdated: string;
}
```

#### InventoryOverview

```typescript
export interface InventoryOverview {
  totalItems: number;
  lowStockItems: InventoryItem[];
  expiringSoonItems: InventoryItem[];
  totalValue: number;
  currency: string;
}
```

#### DemandPrediction

```typescript
export interface DemandPrediction {
  itemId: number;
  itemName: string;
  predictedDemand: number;
  predictionDate: string;
  confidence: number;
}
```

#### DemandPredictionResponse

```typescript
export interface DemandPredictionResponse {
  predictions: DemandPrediction[];
  generatedAt: string;
}
```

#### Recommendation

```typescript
export interface Recommendation {
  id: number;
  itemId: number;
  itemName: string;
  action: 'order_more' | 'reduce_stock' | 'promote_sale' | 'monitor';
  reason: string;
  createdAt: string;
}
```

#### RecommendationResponse

```typescript
export interface RecommendationResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}
```

#### Alert

```typescript
export interface Alert {
  id: number;
  type: 'risk' | 'stockout' | 'expiration';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  relatedItemId: number | null;
  createdAt: string;
  acknowledged: boolean;
}
```

#### AlertResponse

```typescript
export interface AlertResponse {
  alerts: Alert[];
}
```

---

## 3. API ENDPOINTS

### Auth Service

- **POST /api/auth/login**
  - Request: `AuthRequest`
  - Response: `AuthResponse`

- **GET /api/auth/me**
  - Auth: Bearer JWT
  - Response: `UserSummary`

---

### Inventory Service

- **GET /api/inventory/overview**
  - Auth: Bearer JWT
  - Response: `InventoryOverview`

- **GET /api/inventory/items**
  - Auth: Bearer JWT
  - Response: `InventoryItem[]`

- **POST /api/inventory/items**
  - Auth: Bearer JWT
  - Request: `InventoryItem` (without `id`, `lastUpdated`)
  - Response: `InventoryItem`

- **PUT /api/inventory/items/:id**
  - Auth: Bearer JWT
  - Request: Partial<InventoryItem> (fields to update)
  - Response: `InventoryItem`

- **DELETE /api/inventory/items/:id**
  - Auth: Bearer JWT
  - Response: `{ success: boolean }`

---

### Prediction Service

- **GET /api/predictions/demand**
  - Auth: Bearer JWT
  - Query: `?date=YYYY-MM-DD` (optional)
  - Response: `DemandPredictionResponse`

---

### Recommendation Service

- **GET /api/recommendations**
  - Auth: Bearer JWT
  - Response: `RecommendationResponse`

---

### Alert Service

- **GET /api/alerts**
  - Auth: Bearer JWT
  - Response: `AlertResponse`

- **POST /api/alerts/:id/acknowledge**
  - Auth: Bearer JWT
  - Response: `{ success: boolean }`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service               | Listening Port | Path                        |
|-----------------------|---------------|-----------------------------|
| auth-service          | 8001          | backend/auth-service/       |
| inventory-service     | 8002          | backend/inventory-service/  |
| prediction-service    | 8003          | backend/prediction-service/ |
| recommendation-service| 8004          | backend/recommendation-service/ |
| alert-service         | 8005          | backend/alert-service/      |

---

### SHARED MODULES

| Shared path         | Imported by services                                             |
|---------------------|-----------------------------------------------------------------|
| backend/shared/     | auth-service, inventory-service, prediction-service, recommendation-service, alert-service |

---

### FILE TREE

```
.
├── docker-compose.yml                # Multi-service orchestration (all services, DBs, Redis)
├── .env.example                      # Template for all required environment variables
├── .gitignore                        # Ignore node_modules, build, .env, etc.
├── README.md                         # Project overview, setup, usage
├── run.sh                            # Root-level startup script for local dev
├── k8s/
│   ├── auth-service-deployment.yaml          # K8s deployment for auth-service
│   ├── inventory-service-deployment.yaml     # K8s deployment for inventory-service
│   ├── prediction-service-deployment.yaml    # K8s deployment for prediction-service
│   ├── recommendation-service-deployment.yaml# K8s deployment for recommendation-service
│   ├── alert-service-deployment.yaml         # K8s deployment for alert-service
│   ├── postgres-deployment.yaml              # K8s deployment for PostgreSQL
│   ├── redis-deployment.yaml                 # K8s deployment for Redis
│   └── ingress.yaml                          # K8s ingress for API Gateway and frontend
├── backend/
│   ├── shared/                       # Shared code (models, utils, middlewares)
│   │   ├── models.ts                 # TypeScript interfaces for all data contracts
│   │   ├── auth.ts                   # JWT utilities, password hashing
│   │   ├── db.ts                     # DB connection utilities
│   │   └── redis.ts                  # Redis connection utilities
│   ├── auth-service/
│   │   ├── Dockerfile                # Dockerfile (EXPOSE 8001, COPY ../shared)
│   │   ├── src/
│   │   │   ├── index.ts              # Express entrypoint
│   │   │   ├── routes/
│   │   │   │   └── auth.ts           # /api/auth endpoints
│   │   │   ├── controllers/
│   │   │   │   └── authController.ts # Auth logic
│   │   │   ├── services/
│   │   │   │   └── userService.ts    # User DB logic
│   │   │   └── middlewares/
│   │   │       └── authMiddleware.ts # JWT validation
│   │   └── tsconfig.json
│   ├── inventory-service/
│   │   ├── Dockerfile                # Dockerfile (EXPOSE 8002, COPY ../shared)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── inventory.ts
│   │   │   ├── controllers/
│   │   │   │   └── inventoryController.ts
│   │   │   ├── services/
│   │   │   │   └── inventoryService.ts
│   │   │   └── middlewares/
│   │   │       └── authMiddleware.ts
│   │   └── tsconfig.json
│   ├── prediction-service/
│   │   ├── Dockerfile                # Dockerfile (EXPOSE 8003, COPY ../shared)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── prediction.ts
│   │   │   ├── controllers/
│   │   │   │   └── predictionController.ts
│   │   │   ├── services/
│   │   │   │   └── predictionService.ts
│   │   │   └── middlewares/
│   │   │       └── authMiddleware.ts
│   │   └── tsconfig.json
│   ├── recommendation-service/
│   │   ├── Dockerfile                # Dockerfile (EXPOSE 8004, COPY ../shared)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── recommendation.ts
│   │   │   ├── controllers/
│   │   │   │   └── recommendationController.ts
│   │   │   ├── services/
│   │   │   │   └── recommendationService.ts
│   │   │   └── middlewares/
│   │   │       └── authMiddleware.ts
│   │   └── tsconfig.json
│   ├── alert-service/
│   │   ├── Dockerfile                # Dockerfile (EXPOSE 8005, COPY ../shared)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── alert.ts
│   │   │   ├── controllers/
│   │   │   │   └── alertController.ts
│   │   │   ├── services/
│   │   │   │   └── alertService.ts
│   │   │   └── middlewares/
│   │   │       └── authMiddleware.ts
│   │   └── tsconfig.json
│   └── package.json                  # Monorepo root for backend services
├── frontend/
│   ├── Dockerfile                    # Dockerfile for React app
│   ├── public/
│   │   ├── index.html                # HTML entrypoint
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.tsx                  # React entrypoint
│   │   ├── App.tsx                   # Root component
│   │   ├── api/
│   │   │   ├── auth.ts               # API calls for auth
│   │   │   ├── inventory.ts          # API calls for inventory
│   │   │   ├── prediction.ts         # API calls for predictions
│   │   │   ├── recommendation.ts     # API calls for recommendations
│   │   │   └── alert.ts              # API calls for alerts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Auth state and actions
│   │   │   ├── useInventory.ts       # Inventory state and actions
│   │   │   ├── usePredictions.ts     # Prediction state and actions
│   │   │   ├── useRecommendations.ts # Recommendation state and actions
│   │   │   └── useAlerts.ts          # Alert state and actions
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── InventoryOverview.tsx
│   │   │   ├── InventoryList.tsx
│   │   │   ├── InventoryItemForm.tsx
│   │   │   ├── PredictionPanel.tsx
│   │   │   ├── RecommendationList.tsx
│   │   │   ├── AlertList.tsx
│   │   │   └── AlertBanner.tsx
│   │   ├── types/
│   │   │   └── models.ts             # Frontend TypeScript interfaces (mirrors backend)
│   │   └── utils/
│   │       └── apiClient.ts          # Axios instance with JWT
│   ├── tsconfig.json
│   └── package.json
```

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type   | Description                                         | Example Value                    |
|-----------------------------|--------|-----------------------------------------------------|----------------------------------|
| NODE_ENV                    | string | Node environment                                    | production                       |
| PORT                        | number | Service listening port (per service)                | 8001                             |
| JWT_SECRET                  | string | Secret for JWT signing                              | supersecretjwtkey                |
| POSTGRES_HOST               | string | PostgreSQL host                                     | postgres                         |
| POSTGRES_PORT               | number | PostgreSQL port                                     | 5432                             |
| POSTGRES_DB                 | string | PostgreSQL database name                            | merma_db                         |
| POSTGRES_USER               | string | PostgreSQL user                                     | merma_user                       |
| POSTGRES_PASSWORD           | string | PostgreSQL password                                 | strongpassword                   |
| REDIS_HOST                  | string | Redis host                                          | redis                            |
| REDIS_PORT                  | number | Redis port                                          | 6379                             |
| REDIS_PASSWORD              | string | Redis password (optional)                           |                                  |
| FRONTEND_URL                | string | Public URL for frontend (CORS, links)               | https://merma.example.com        |
| API_GATEWAY_URL             | string | Public URL for API Gateway                          | https://api.merma.example.com    |
| AWS_REGION                  | string | AWS region for deployment                           | us-east-1                        |
| AWS_ACCESS_KEY_ID           | string | AWS access key                                      | AKIA...                          |
| AWS_SECRET_ACCESS_KEY       | string | AWS secret key                                      | ...                              |
| S3_BUCKET                   | string | S3 bucket for static assets                         | merma-static-assets              |
| SESSION_TTL                 | number | Session TTL in seconds (Redis)                      | 86400                            |

---

## 6. IMPORT CONTRACTS

### Backend Shared Module Exports

- `from backend/shared/models import User, UserSummary, InventoryItem, InventoryOverview, DemandPrediction, DemandPredictionResponse, Recommendation, RecommendationResponse, Alert, AlertResponse`
- `from backend/shared/auth import signJwt, verifyJwt, hashPassword, comparePassword`
- `from backend/shared/db import getDbConnection`
- `from backend/shared/redis import getRedisClient`

### Backend Service Exports

- `from src/controllers/authController import login, getMe`
- `from src/controllers/inventoryController import getOverview, listItems, createItem, updateItem, deleteItem`
- `from src/controllers/predictionController import getDemandPredictions`
- `from src/controllers/recommendationController import getRecommendations`
- `from src/controllers/alertController import getAlerts, acknowledgeAlert`
- `from src/services/userService import findUserByEmail, createUser, getUserById`
- `from src/services/inventoryService import getInventoryOverview, getInventoryItems, addInventoryItem, updateInventoryItem, removeInventoryItem`
- `from src/services/predictionService import generateDemandPredictions`
- `from src/services/recommendationService import generateRecommendations`
- `from src/services/alertService import getActiveAlerts, acknowledgeAlertById`
- `from src/middlewares/authMiddleware import requireAuth`

### Frontend Exports

- `import { UserSummary, AuthResponse, InventoryItem, InventoryOverview, DemandPrediction, DemandPredictionResponse, Recommendation, RecommendationResponse, Alert, AlertResponse } from './types/models'`
- `import { useAuth } from './hooks/useAuth'`
- `import { useInventory } from './hooks/useInventory'`
- `import { usePredictions } from './hooks/usePredictions'`
- `import { useRecommendations } from './hooks/useRecommendations'`
- `import { useAlerts } from './hooks/useAlerts'`
- `import { apiClient } from './utils/apiClient'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Shared State Primitives (React hooks)

- `useAuth() → { user: UserSummary | null, token: string | null, loading: boolean, error: string | null, login: (email: string, password: string) => Promise<void>, logout: () => void }`
- `useInventory() → { inventory: InventoryItem[], overview: InventoryOverview | null, loading: boolean, error: string | null, fetchInventory: () => Promise<void>, createItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>, updateItem: (id: number, data: Partial<InventoryItem>) => Promise<void>, deleteItem: (id: number) => Promise<void> }`
- `usePredictions() → { predictions: DemandPrediction[], loading: boolean, error: string | null, fetchPredictions: (date?: string) => Promise<void> }`
- `useRecommendations() → { recommendations: Recommendation[], loading: boolean, error: string | null, fetchRecommendations: () => Promise<void> }`
- `useAlerts() → { alerts: Alert[], loading: boolean, error: string | null, fetchAlerts: () => Promise<void>, acknowledgeAlert: (id: number) => Promise<void> }`

### Reusable Component Props

- `LoginForm` props: `{ onSubmit: (email: string, password: string) => void, loading: boolean, error: string | null }`
- `InventoryOverview` props: `{ overview: InventoryOverview | null, loading: boolean }`
- `InventoryList` props: `{ items: InventoryItem[], onEdit: (item: InventoryItem) => void, onDelete: (id: number) => void, deletingId: number | null }`
- `InventoryItemForm` props: `{ item?: InventoryItem, onSubmit: (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void, loading: boolean }`
- `PredictionPanel` props: `{ predictions: DemandPrediction[], loading: boolean }`
- `RecommendationList` props: `{ recommendations: Recommendation[], loading: boolean }`
- `AlertList` props: `{ alerts: Alert[], onAcknowledge: (id: number) => void, acknowledgingId: number | null }`
- `AlertBanner` props: `{ alert: Alert, onAcknowledge: (id: number) => void, loading: boolean }`

---

## 8. FILE EXTENSION CONVENTION

- **Frontend files:** `.tsx` (TypeScript React)
- **Backend files:** `.ts` (TypeScript)
- **Project language:** TypeScript (no JavaScript files)
- **Frontend entry point:** `/src/main.tsx` (referenced in `public/index.html` as `<script src="/src/main.tsx">`)
- **No `.jsx` or `.js` files permitted in either frontend or backend.**
- **All React components and hooks use `.tsx` extension.**
- **All backend source files use `.ts` extension.**