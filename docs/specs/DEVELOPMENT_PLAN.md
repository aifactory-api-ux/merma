# DEVELOPMENT PLAN: Merma

## 1. ARCHITECTURE OVERVIEW

**System Components:**
- **Backend Microservices (Node.js 20 + Express.js + TypeORM):**
  - **auth-service** (port 8001): User authentication (JWT), user info
  - **inventory-service** (port 8002): Inventory CRUD, overview
  - **prediction-service** (port 8003): Demand prediction API
  - **recommendation-service** (port 8004): Recommendations API
  - **alert-service** (port 8005): Alerts API
- **Shared Backend Module:** Common models, DB/Redis utilities, JWT/password helpers
- **Frontend (React 18 + TypeScript):** Dashboard for demand, recommendations, alerts, inventory
- **Infrastructure:** Docker Compose, Kubernetes manifests, AWS deployment, root scripts

**Data Models:**  
All backend and frontend models strictly follow the contracts in SPEC.md §2 (User, InventoryItem, DemandPrediction, Recommendation, Alert, etc.).

**API Endpoints:**  
All endpoints are as defined in SPEC.md §3 (e.g., `/api/auth/login`, `/api/inventory/items`, `/api/predictions/demand`, etc.).

**Folder Structure:**  
- `backend/shared/` — shared code (models, utils, db, redis, auth)
- `backend/auth-service/`, `backend/inventory-service/`, etc. — each service in its own folder with Dockerfile, src, routes, controllers, services, middlewares
- `frontend/` — React app with Dockerfile
- `k8s/` — Kubernetes manifests for all services and infra
- Root: `docker-compose.yml`, `.env.example`, `.gitignore`, `.dockerignore`, `run.sh`, `README.md`

**Infrastructure:**  
- All services and DBs orchestrated via Docker Compose for local dev
- Kubernetes manifests for AWS EKS deployment
- Healthchecks, structured logging, env validation, error handling, RBAC enforced

## 2. ACCEPTANCE CRITERIA

1. All backend services start, register health endpoints, and expose only the APIs defined in SPEC.md, with RBAC and JWT enforced.
2. The frontend dashboard displays demand predictions, recommendations, alerts, and inventory data, consuming only the allowed APIs and types.
3. The system runs end-to-end with `./run.sh`, with all services healthy, data flowing from backend to frontend, and all infrastructure files in place.

---

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)

- **Role:** role-tl (technical_lead)
- **Role:** role-be (backend_developer)
- **Role:** role-fe (frontend_developer)
- **Role:** role-devops (devops_support)

---

## 3. EXECUTABLE ITEMS

---

### ITEM 1: Foundation — shared types, interfaces, DB schemas, config

**Goal:**  
Create all shared code and configuration that other items will import.  
Includes:  
- All TypeScript interfaces and enums for backend and frontend (from SPEC.md §2)
- Shared backend utilities: JWT, password hashing, DB and Redis connection helpers
- TypeORM entities for all data models (User, InventoryItem, DemandPrediction, Recommendation, Alert)
- Shared config and environment validation
- No business logic or endpoints

**Files to create:**
- backend/shared/models.ts — All TypeScript interfaces and enums (from SPEC.md §2), plus TypeORM entities for all data models
- backend/shared/auth.ts — JWT utilities, password hashing/validation helpers
- backend/shared/db.ts — TypeORM DB connection utilities (PostgreSQL)
- backend/shared/redis.ts — ioredis connection utilities
- backend/shared/config.ts — Environment variable validation and shared constants
- frontend/src/types.ts — All frontend TypeScript interfaces (from SPEC.md §2, frontend section)
- frontend/src/config.ts — Frontend environment/config constants

**Dependencies:** None

**Validation:**  
- Run `tsc` in both `backend/shared/` and `frontend/src/` — no type errors
- All interfaces and entities match SPEC.md exactly
- All shared modules importable by other services

**Role:** role-tl (technical_lead)

---

### ITEM 2: Auth Service — JWT login, user info, RBAC

**Goal:**  
Implement the authentication service with endpoints:
- `POST /api/auth/login` (AuthRequest → AuthResponse)
- `GET /api/auth/me` (JWT required, returns UserSummary)
- RBAC enforcement via middleware
- Healthcheck endpoint

**Files to create:**
- backend/auth-service/Dockerfile — Multi-stage build, EXPOSE 8001, COPY ../shared
- backend/auth-service/package.json — All dependencies and scripts
- backend/auth-service/tsconfig.json — TypeScript config
- backend/auth-service/src/index.ts — HTTP server bootstrap (starts on port 8001)
- backend/auth-service/src/app.ts — Express app, registers routers and middleware
- backend/auth-service/src/routes/auth.ts — Defines /api/auth endpoints
- backend/auth-service/src/controllers/authController.ts — Auth logic (login, me)
- backend/auth-service/src/services/userService.ts — User DB logic (find, validate)
- backend/auth-service/src/middlewares/authMiddleware.ts — JWT validation, RBAC
- backend/auth-service/src/routes/health.ts — GET /health endpoint

**Dependencies:** Item 1

**Validation:**  
- `docker build` and `docker run` expose service on 8001
- `POST /api/auth/login` returns JWT and user summary for valid credentials
- `GET /api/auth/me` returns user info when JWT is valid
- Healthcheck endpoint returns status

**Role:** role-be (backend_developer)

---

### ITEM 3: Inventory Service — CRUD, overview

**Goal:**  
Implement the inventory service with endpoints:
- `GET /api/inventory/overview` (returns InventoryOverview)
- `GET /api/inventory/items` (returns InventoryItem[])
- `POST /api/inventory/items` (create InventoryItem)
- `PUT /api/inventory/items/:id` (update InventoryItem)
- `DELETE /api/inventory/items/:id` (delete InventoryItem)
- JWT and RBAC enforced
- Healthcheck endpoint

**Files to create:**
- backend/inventory-service/Dockerfile — Multi-stage build, EXPOSE 8002, COPY ../shared
- backend/inventory-service/package.json
- backend/inventory-service/tsconfig.json
- backend/inventory-service/src/index.ts
- backend/inventory-service/src/app.ts
- backend/inventory-service/src/routes/inventory.ts — All inventory endpoints
- backend/inventory-service/src/controllers/inventoryController.ts — Inventory logic
- backend/inventory-service/src/services/inventoryService.ts — DB logic for inventory
- backend/inventory-service/src/middlewares/authMiddleware.ts — JWT/RBAC
- backend/inventory-service/src/routes/health.ts — GET /health

**Dependencies:** Item 1

**Validation:**  
- `docker build` and `docker run` expose service on 8002
- All endpoints respond as per SPEC.md
- Healthcheck endpoint returns status

**Role:** role-be (backend_developer)

---

### ITEM 4: Prediction Service — demand prediction API

**Goal:**  
Implement the prediction service with endpoint:
- `GET /api/predictions/demand` (returns DemandPredictionResponse, optional ?date param)
- JWT and RBAC enforced
- Healthcheck endpoint

**Files to create:**
- backend/prediction-service/Dockerfile — Multi-stage build, EXPOSE 8003, COPY ../shared
- backend/prediction-service/package.json
- backend/prediction-service/tsconfig.json
- backend/prediction-service/src/index.ts
- backend/prediction-service/src/app.ts
- backend/prediction-service/src/routes/prediction.ts — /api/predictions/demand
- backend/prediction-service/src/controllers/predictionController.ts — Prediction logic
- backend/prediction-service/src/services/predictionService.ts — DB/model logic
- backend/prediction-service/src/middlewares/authMiddleware.ts — JWT/RBAC
- backend/prediction-service/src/routes/health.ts — GET /health

**Dependencies:** Item 1

**Validation:**  
- `docker build` and `docker run` expose service on 8003
- Endpoint returns predictions as per SPEC.md
- Healthcheck endpoint returns status

**Role:** role-be (backend_developer)

---

### ITEM 5: Recommendation Service — recommendations API

**Goal:**  
Implement the recommendation service with endpoint:
- `GET /api/recommendations` (returns RecommendationResponse)
- JWT and RBAC enforced
- Healthcheck endpoint

**Files to create:**
- backend/recommendation-service/Dockerfile — Multi-stage build, EXPOSE 8004, COPY ../shared
- backend/recommendation-service/package.json
- backend/recommendation-service/tsconfig.json
- backend/recommendation-service/src/index.ts
- backend/recommendation-service/src/app.ts
- backend/recommendation-service/src/routes/recommendation.ts — /api/recommendations
- backend/recommendation-service/src/controllers/recommendationController.ts — Logic
- backend/recommendation-service/src/services/recommendationService.ts — DB/model logic
- backend/recommendation-service/src/middlewares/authMiddleware.ts — JWT/RBAC
- backend/recommendation-service/src/routes/health.ts — GET /health

**Dependencies:** Item 1

**Validation:**  
- `docker build` and `docker run` expose service on 8004
- Endpoint returns recommendations as per SPEC.md
- Healthcheck endpoint returns status

**Role:** role-be (backend_developer)

---

### ITEM 6: Alert Service — alerts API

**Goal:**  
Implement the alert service with endpoints:
- `GET /api/alerts` (returns AlertResponse)
- `POST /api/alerts/:id/acknowledge` (acknowledge alert)
- JWT and RBAC enforced
- Healthcheck endpoint

**Files to create:**
- backend/alert-service/Dockerfile — Multi-stage build, EXPOSE 8005, COPY ../shared
- backend/alert-service/package.json
- backend/alert-service/tsconfig.json
- backend/alert-service/src/index.ts
- backend/alert-service/src/app.ts
- backend/alert-service/src/routes/alert.ts — /api/alerts endpoints
- backend/alert-service/src/controllers/alertController.ts — Logic
- backend/alert-service/src/services/alertService.ts — DB/model logic
- backend/alert-service/src/middlewares/authMiddleware.ts — JWT/RBAC
- backend/alert-service/src/routes/health.ts — GET /health

**Dependencies:** Item 1

**Validation:**  
- `docker build` and `docker run` expose service on 8005
- Endpoints return alerts and acknowledge as per SPEC.md
- Healthcheck endpoint returns status

**Role:** role-be (backend_developer)

---

### ITEM 7: Frontend — Dashboard (React 18 + TypeScript)

**Goal:**  
Implement the dashboard UI for:
- Viewing demand predictions, recommendations, alerts, and inventory overview
- Consuming only the APIs and types defined in SPEC.md
- JWT authentication, RBAC, and session management
- Healthcheck endpoint (if required for frontend)
- Strict type usage, config from env

**Files to create:**
- frontend/Dockerfile — Multi-stage build, EXPOSE 3000, ARG for API URL
- frontend/package.json
- frontend/tsconfig.json
- frontend/src/index.tsx — React entry point
- frontend/src/App.tsx — Main app component, routing
- frontend/src/types.ts — (from Item 1, but used here)
- frontend/src/config.ts — (from Item 1, but used here)
- frontend/src/hooks/useAuth.ts — Auth logic (JWT, session)
- frontend/src/pages/Login.tsx — Login page
- frontend/src/pages/Dashboard.tsx — Main dashboard (predictions, recommendations, alerts, inventory)
- frontend/src/components/InventoryOverview.tsx
- frontend/src/components/DemandPredictions.tsx
- frontend/src/components/Recommendations.tsx
- frontend/src/components/Alerts.tsx

**Dependencies:** Item 1

**Validation:**  
- `docker build` and `docker run` expose frontend on 3000
- UI loads, authenticates, and displays all required data from backend APIs

**Role:** role-fe (frontend_developer)

---

### ITEM 8: Infrastructure & Deployment

**Goal:**  
Provide complete orchestration and deployment for local and cloud:
- Docker Compose for all services, DBs, Redis, with healthchecks and startup order
- .env.example with all required variables and descriptions
- .gitignore and .dockerignore for all relevant files
- run.sh script for local dev: checks Docker, builds, starts, waits for healthy, prints access URL
- README.md with setup, usage, endpoints, troubleshooting
- docs/architecture.md with system diagram and component descriptions
- k8s/ manifests for all services, DBs, ingress

**Files to create:**
- docker-compose.yml
- .env.example
- .gitignore
- .dockerignore
- run.sh
- README.md
- docs/architecture.md
- k8s/auth-service-deployment.yaml
- k8s/inventory-service-deployment.yaml
- k8s/prediction-service-deployment.yaml
- k8s/recommendation-service-deployment.yaml
- k8s/alert-service-deployment.yaml
- k8s/postgres-deployment.yaml
- k8s/redis-deployment.yaml
- k8s/ingress.yaml

**Dependencies:** All previous items

**Validation:**  
- `./run.sh` completes without errors
- All services report healthy
- Frontend accessible at `http://localhost:3000`
- All API endpoints respond as per SPEC.md

**Role:** role-devops (devops_support)

---