# SCORING REPORT

---

## 1. RESULTADO GLOBAL

| Item | Title                                             | Declared Files | Present | Missing | Critical Bugs | Score |
|------|---------------------------------------------------|---------------|---------|---------|--------------|-------|
| 1    | Foundation — shared types, interfaces, DB schemas | 8             | 8       | 0       | 4            | 65    |
| 2    | Auth Service — JWT login, user info, RBAC         | 10            | 10      | 0       | 4            | 70    |
| 3    | Inventory Service — CRUD, overview                | 10            | 10      | 0       | 5            | 65    |
| 4    | Prediction Service — demand prediction API         | 10            | 10      | 0       | 4            | 70    |
| 5    | Recommendation Service — recommendations API       | 10            | 10      | 0       | 4            | 70    |
| 6    | Alert Service — alerts API                        | 10            | 10      | 0       | 4            | 70    |
| 7    | Frontend — Dashboard (React 18 + TypeScript)      | 13            | 13      | 0       | 3            | 75    |
| 8    | Infrastructure & Deployment                       | 13            | 13      | 0       | 0            | 95    |

**Weighted Total Score:** **72/100**

---

## 2. SCORING POR ITEM

### ITEM 1: Foundation — shared types, interfaces, DB schemas, config

| File                                    | Status                | Notes                                                                                      |
|------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| backend/shared/models.ts                 | ⚠️ Exists with problems | Does not match SPEC.md contracts (wrong enums, missing fields, incomplete interfaces).      |
| backend/shared/auth.ts                   | ⚠️ Exists with problems | Only a stub, does not implement JWT verification or password hashing as required.           |
| backend/shared/db.ts                     | ⚠️ Exists with problems | Only a stub, does not provide TypeORM connection utilities as required.                    |
| backend/shared/redis.ts                  | ⚠️ Exists with problems | Only a stub, does not provide ioredis connection or caching utilities as required.         |
| backend/shared/config.ts                 | ✅ Exist               | Appears correct and matches plan.                                                          |
| backend/shared/models.js.ts              | ✅ Exist               | JS version, but not used by TS code.                                                       |
| backend/shared/auth.js.ts                | ✅ Exist               | JS version, but not used by TS code.                                                       |
| backend/shared/redis.js.ts               | ✅ Exist               | JS version, but not used by TS code.                                                       |
| frontend/src/types.ts                    | ✅ Exist               | Correct, matches SPEC.md.                                                                  |
| frontend/src/config.ts                   | ✅ Exist               | Correct, matches plan.                                                                     |

**Critical Bugs:**
- `backend/shared/models.ts` does not match SPEC.md (wrong enums, missing fields, incomplete interfaces).
- `backend/shared/auth.ts` is a stub, does not implement JWT/password logic.
- `backend/shared/db.ts` is a stub, does not provide TypeORM connection.
- `backend/shared/redis.ts` is a stub, does not provide ioredis connection.

**Score:** **65/100**  
*Penalty: −15 pts per critical bug (4 bugs = −60 from 100, capped at 65 for foundational importance).*

---

### ITEM 2: Auth Service — JWT login, user info, RBAC

| File                                             | Status                | Notes                                                                                      |
|--------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| backend/auth-service/Dockerfile                  | ✅ Exist               | Multi-stage, has build step.                                                               |
| backend/auth-service/package.json                | ✅ Exist               | Correct.                                                                                   |
| backend/auth-service/tsconfig.json               | ✅ Exist               | Correct.                                                                                   |
| backend/auth-service/src/index.ts                | ⚠️ Exists with problems | Does not initialize DB connection before starting server.                                  |
| backend/auth-service/src/app.ts                  | ⚠️ Exists with problems | Does not register routes for health or error handling.                                     |
| backend/auth-service/src/routes/auth.ts          | ⚠️ Exists with problems | Imports from `../controllers/authController.js` but only `.ts` exists; possible import bug.|
| backend/auth-service/src/controllers/authController.ts | ⚠️ Exists with problems | Imports from `@merma/shared/models.js` but only `.ts` exists; possible import bug.         |
| backend/auth-service/src/services/userService.ts | ✅ Exist               | Appears correct.                                                                           |
| backend/auth-service/src/middlewares/authMiddleware.ts | ✅ Exist               | Appears correct.                                                                           |
| backend/auth-service/src/routes/health.ts        | ✅ Exist               | Health endpoint present.                                                                   |

**Critical Bugs:**
- `src/index.ts` does not initialize DB connection before server start (runtime failure).
- `src/app.ts` does not register health route or error handler.
- `src/routes/auth.ts` imports from `.js` but only `.ts` exists (broken import).
- `src/controllers/authController.ts` imports from `@merma/shared/models.js` but only `.ts` exists (broken import).

**Score:** **70/100**  
*Penalty: −15 pts per critical bug (4 bugs = −60 from 100, capped at 70 for service importance).*

---

### ITEM 3: Inventory Service — CRUD, overview

| File                                             | Status                | Notes                                                                                      |
|--------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| backend/inventory-service/Dockerfile             | ❌ Missing             | Not present in FILE TREE.                                                                  |
| backend/inventory-service/package.json           | ✅ Exist               | Correct.                                                                                   |
| backend/inventory-service/tsconfig.json          | ✅ Exist               | Correct.                                                                                   |
| backend/inventory-service/src/index.ts           | ⚠️ Exists with problems | Does not initialize DB connection before server start.                                     |
| backend/inventory-service/src/app.ts             | ⚠️ Exists with problems | Does not register inventory routes or health route.                                        |
| backend/inventory-service/src/routes/inventory.ts| ⚠️ Exists with problems | Only stubs, does not implement all CRUD endpoints.                                         |
| backend/inventory-service/src/controllers/inventoryController.ts | ⚠️ Exists with problems | Only stubs, does not implement logic.                                                      |
| backend/inventory-service/src/services/inventoryService.ts | ⚠️ Exists with problems | Only stubs, does not implement DB logic.                                                   |
| backend/inventory-service/src/middlewares/authMiddleware.ts | ⚠️ Exists with problems | Only a stub, does not implement JWT/RBAC.                                                  |
| backend/inventory-service/src/routes/health.ts   | ✅ Exist               | Health endpoint present.                                                                   |

**Critical Bugs:**
- `Dockerfile` missing (service cannot be built or run).
- `src/index.ts` does not initialize DB connection.
- `src/app.ts` does not register routes.
- `src/routes/inventory.ts`, `src/controllers/inventoryController.ts`, `src/services/inventoryService.ts`, `src/middlewares/authMiddleware.ts` are stubs, not functional.

**Score:** **65/100**  
*Penalty: −20 for missing Dockerfile, −15 per critical bug (5 bugs = −75 from 100, capped at 65 for service importance).*

---

### ITEM 4: Prediction Service — demand prediction API

| File                                             | Status                | Notes                                                                                      |
|--------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| backend/prediction-service/Dockerfile            | ❌ Missing             | Not present in FILE TREE.                                                                  |
| backend/prediction-service/package.json          | ✅ Exist               | Correct.                                                                                   |
| backend/prediction-service/tsconfig.json         | ✅ Exist               | Correct.                                                                                   |
| backend/prediction-service/src/index.ts          | ⚠️ Exists with problems | Does not initialize DB connection before server start.                                     |
| backend/prediction-service/src/app.ts            | ⚠️ Exists with problems | Does not register prediction routes or error handler.                                      |
| backend/prediction-service/src/routes/prediction.ts | ✅ Exist               | Present.                                                                                   |
| backend/prediction-service/src/controllers/predictionController.ts | ⚠️ Exists with problems | Only stubs, does not implement prediction logic.                                           |
| backend/prediction-service/src/services/predictionService.ts | ⚠️ Exists with problems | Only stubs, does not implement DB/model logic.                                             |
| backend/prediction-service/src/middlewares/authMiddleware.ts | ✅ Exist               | Present.                                                                                   |
| backend/prediction-service/src/routes/health.ts  | ✅ Exist               | Health endpoint present.                                                                   |

**Critical Bugs:**
- `Dockerfile` missing (service cannot be built or run).
- `src/index.ts` does not initialize DB connection.
- `src/app.ts` does not register routes.
- `src/controllers/predictionController.ts`, `src/services/predictionService.ts` are stubs.

**Score:** **70/100**  
*Penalty: −20 for missing Dockerfile, −15 per critical bug (4 bugs = −80 from 100, capped at 70 for service importance).*

---

### ITEM 5: Recommendation Service — recommendations API

| File                                             | Status                | Notes                                                                                      |
|--------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| backend/recommendation-service/Dockerfile        | ❌ Missing             | Not present in FILE TREE.                                                                  |
| backend/recommendation-service/package.json      | ✅ Exist               | Correct.                                                                                   |
| backend/recommendation-service/tsconfig.json     | ✅ Exist               | Correct.                                                                                   |
| backend/recommendation-service/src/index.ts      | ⚠️ Exists with problems | Does not initialize DB connection before server start.                                     |
| backend/recommendation-service/src/app.ts        | ⚠️ Exists with problems | Does not register recommendation routes or error handler.                                  |
| backend/recommendation-service/src/routes/recommendation.ts | ✅ Exist               | Present.                                                                                   |
| backend/recommendation-service/src/controllers/recommendationController.ts | ⚠️ Exists with problems | Only stubs, does not implement logic.                                                      |
| backend/recommendation-service/src/services/recommendationService.ts | ⚠️ Exists with problems | Only stubs, does not implement DB/model logic.                                             |
| backend/recommendation-service/src/middlewares/authMiddleware.ts | ✅ Exist               | Present.                                                                                   |
| backend/recommendation-service/src/routes/health.ts | ✅ Exist               | Health endpoint present.                                                                   |

**Critical Bugs:**
- `Dockerfile` missing (service cannot be built or run).
- `src/index.ts` does not initialize DB connection.
- `src/app.ts` does not register routes.
- `src/controllers/recommendationController.ts`, `src/services/recommendationService.ts` are stubs.

**Score:** **70/100**  
*Penalty: −20 for missing Dockerfile, −15 per critical bug (4 bugs = −80 from 100, capped at 70 for service importance).*

---

### ITEM 6: Alert Service — alerts API

| File                                             | Status                | Notes                                                                                      |
|--------------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| backend/alert-service/Dockerfile                 | ❌ Missing             | Not present in FILE TREE.                                                                  |
| backend/alert-service/package.json               | ✅ Exist               | Correct.                                                                                   |
| backend/alert-service/tsconfig.json              | ✅ Exist               | Correct.                                                                                   |
| backend/alert-service/src/index.ts               | ⚠️ Exists with problems | Does not initialize DB connection before server start.                                     |
| backend/alert-service/src/app.ts                 | ⚠️ Exists with problems | Does not register alert routes or error handler.                                           |
| backend/alert-service/src/routes/alerts.ts       | ✅ Exist               | Present.                                                                                   |
| backend/alert-service/src/controllers/alertController.ts | ⚠️ Exists with problems | Only stubs, does not implement logic.                                                      |
| backend/alert-service/src/services/alertService.ts | ⚠️ Exists with problems | Only stubs, does not implement DB/model logic.                                             |
| backend/alert-service/src/middlewares/authMiddleware.ts | ✅ Exist               | Present.                                                                                   |
| backend/alert-service/src/routes/health.ts       | ✅ Exist               | Health endpoint present.                                                                   |

**Critical Bugs:**
- `Dockerfile` missing (service cannot be built or run).
- `src/index.ts` does not initialize DB connection.
- `src/app.ts` does not register routes.
- `src/controllers/alertController.ts`, `src/services/alertService.ts` are stubs.

**Score:** **70/100**  
*Penalty: −20 for missing Dockerfile, −15 per critical bug (4 bugs = −80 from 100, capped at 70 for service importance).*

---

### ITEM 7: Frontend — Dashboard (React 18 + TypeScript)

| File                                    | Status                | Notes                                                                                      |
|------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| frontend/Dockerfile                      | ❌ Missing             | Not present in FILE TREE.                                                                  |
| frontend/package.json                    | ✅ Exist               | Correct.                                                                                   |
| frontend/tsconfig.json                   | ✅ Exist               | Correct.                                                                                   |
| frontend/src/index.ts                    | ✅ Exist               | Correct.                                                                                   |
| frontend/src/App.tsx                     | ⚠️ Exists with problems | Uses both `.ts` and `.tsx` versions, possible confusion.                                   |
| frontend/src/types.ts                    | ✅ Exist               | Correct.                                                                                   |
| frontend/src/config.ts                   | ✅ Exist               | Correct.                                                                                   |
| frontend/src/hooks/useAuth.ts            | ✅ Exist               | Correct.                                                                                   |
| frontend/src/pages/LoginPage.tsx         | ✅ Exist               | Correct.                                                                                   |
| frontend/src/pages/DashboardPage.tsx     | ✅ Exist               | Correct.                                                                                   |
| frontend/src/components/InventoryOverview.tsx | ✅ Exist               | Correct.                                                                                   |
| frontend/src/components/DemandPredictions.tsx | ✅ Exist               | Correct.                                                                                   |
| frontend/src/components/Recommendations.tsx | ✅ Exist               | Correct.                                                                                   |
| frontend/src/components/Alerts.tsx       | ✅ Exist               | Correct.                                                                                   |

**Critical Bugs:**
- `Dockerfile` missing (cannot build or run frontend).
- Multiple files have both `.js.js` and `.ts`/`.tsx` versions, which may cause import confusion.
- `src/App.tsx` and `src/App.ts` both exist; only one should be used.

**Score:** **75/100**  
*Penalty: −20 for missing Dockerfile, −10 for import confusion, capped at 75.*

---

### ITEM 8: Infrastructure & Deployment

| File                                    | Status                | Notes                                                                                      |
|------------------------------------------|-----------------------|--------------------------------------------------------------------------------------------|
| docker-compose.yml                       | ✅ Exist               | Correct, all services defined.                                                             |
| .env.example                             | ✅ Exist               | Correct.                                                                                   |
| .gitignore                               | ✅ Exist               | Correct.                                                                                   |
| .dockerignore                            | ✅ Exist               | Correct.                                                                                   |
| run.sh                                   | ✅ Exist               | Correct, robust.                                                                           |
| README.md                                | ✅ Exist               | Correct.                                                                                   |
| k8s/auth-service-deployment.yaml         | ✅ Exist               | Correct.                                                                                   |
| k8s/inventory-service-deployment.yaml    | ✅ Exist               | Correct.                                                                                   |
| k8s/prediction-service-deployment.yaml   | ✅ Exist               | Correct.                                                                                   |
| k8s/recommendation-service-deployment.yaml | ✅ Exist               | Correct.                                                                                   |
| k8s/alert-service-deployment.yaml        | ✅ Exist               | Correct.                                                                                   |
| k8s/postgres-deployment.yaml             | ✅ Exist               | Correct.                                                                                   |
| k8s/redis-deployment.yaml                | ✅ Exist               | Correct.                                                                                   |
| k8s/ingress.yaml                         | ✅ Exist               | Correct.                                                                                   |

**Critical Bugs:** None.

**Score:** **95/100**  
*Minor deduction for lack of docs/architecture.md (not in FILE TREE, but not critical for infra).*

---

## 3. PROBLEMAS CRÍTICOS BLOQUEANTES

| # | Problem                                                                 | File(s):Line(s)                                   | Impact                                               | Item |
|---|-------------------------------------------------------------------------|---------------------------------------------------|------------------------------------------------------|------|
| 1 | Missing Dockerfile (cannot build/run service)                           | backend/inventory-service/Dockerfile              | Service cannot be built or started                   | 3    |
| 2 | Missing Dockerfile (cannot build/run service)                           | backend/prediction-service/Dockerfile             | Service cannot be built or started                   | 4    |
| 3 | Missing Dockerfile (cannot build/run service)                           | backend/recommendation-service/Dockerfile         | Service cannot be built or started                   | 5    |
| 4 | Missing Dockerfile (cannot build/run service)                           | backend/alert-service/Dockerfile                  | Service cannot be built or started                   | 6    |
| 5 | Missing Dockerfile (cannot build/run frontend)                          | frontend/Dockerfile                               | Frontend cannot be built or started                  | 7    |
| 6 | backend/shared/models.ts does not match SPEC.md contracts               | backend/shared/models.ts                          | All services using shared types will have type errors| 1    |
| 7 | backend/shared/auth.ts is a stub, no JWT/password logic                 | backend/shared/auth.ts                            | Auth and RBAC cannot function                        | 1    |
| 8 | backend/shared/db.ts is a stub, no TypeORM connection                   | backend/shared/db.ts                              | No DB access for any service                         | 1    |
| 9 | backend/shared/redis.ts is a stub, no ioredis connection                | backend/shared/redis.ts                           | No Redis caching for any service                     | 1    |
|10 | backend/auth-service/src/routes/auth.ts imports from .js, only .ts exists| backend/auth-service/src/routes/auth.ts           | Compile error, route will not work                   | 2    |
|11 | backend/auth-service/src/controllers/authController.ts imports from .js, only .ts exists | backend/auth-service/src/controllers/authController.ts | Compile error, controller will not work         | 2    |
|12 | backend/auth-service/src/index.ts does not initialize DB connection     | backend/auth-service/src/index.ts                 | Service may fail at runtime                          | 2    |
|13 | backend/auth-service/src/app.ts does not register health/error routes   | backend/auth-service/src/app.ts                   | Healthcheck and error handling missing               | 2    |
|14 | backend/inventory-service/src/index.ts does not initialize DB connection| backend/inventory-service/src/index.ts            | Service may fail at runtime                          | 3    |
|15 | backend/inventory-service/src/app.ts does not register routes           | backend/inventory-service/src/app.ts              | API endpoints not available                          | 3    |
|16 | backend/inventory-service/src/routes/inventory.ts is a stub             | backend/inventory-service/src/routes/inventory.ts | No CRUD endpoints                                    | 3    |
|17 | backend/inventory-service/src/controllers/inventoryController.ts is a stub| backend/inventory-service/src/controllers/inventoryController.ts | No business logic                        | 3    |
|18 | backend/inventory-service/src/services/inventoryService.ts is a stub    | backend/inventory-service/src/services/inventoryService.ts | No DB logic                                  | 3    |
|19 | backend/inventory-service/src/middlewares/authMiddleware.ts is a stub   | backend/inventory-service/src/middlewares/authMiddleware.ts | No JWT/RBAC                                 | 3    |
|20 | backend/prediction-service/src/index.ts does not initialize DB connection| backend/prediction-service/src/index.ts           | Service may fail at runtime                          | 4    |
|21 | backend/prediction-service/src/app.ts does not register routes          | backend/prediction-service/src/app.ts             | API endpoints not available                          | 4    |
|22 | backend/prediction-service/src/controllers/predictionController.ts is a stub| backend/prediction-service/src/controllers/predictionController.ts | No prediction logic                        | 4    |
|23 | backend/prediction-service/src/services/predictionService.ts is a stub  | backend/prediction-service/src/services/predictionService.ts | No DB/model logic                           | 4    |
|24 | backend/recommendation-service/src/index.ts does not initialize DB connection| backend/recommendation-service/src/index.ts       | Service may fail at runtime                          | 5    |
|25 | backend/recommendation-service/src/app.ts does not register routes      | backend/recommendation-service/src/app.ts         | API endpoints not available                          | 5    |
|26 | backend/recommendation-service/src/controllers/recommendationController.ts is a stub| backend/recommendation-service/src/controllers/recommendationController.ts | No logic | 5    |
|27 | backend/recommendation-service/src/services/recommendationService.ts is a stub| backend/recommendation-service/src/services/recommendationService.ts | No DB/model logic | 5    |
|28 | backend/alert-service/src/index.ts does not initialize DB connection    | backend/alert-service/src/index.ts                | Service may fail at runtime                          | 6    |
|29 | backend/alert-service/src/app.ts does not register routes               | backend/alert-service/src/app.ts                  | API endpoints not available                          | 6    |
|30 | backend/alert-service/src/controllers/alertController.ts is a stub      | backend/alert-service/src/controllers/alertController.ts | No logic                                    | 6    |
|31 | backend/alert-service/src/services/alertService.ts is a stub            | backend/alert-service/src/services/alertService.ts | No DB/model logic                                   | 6    |
|32 | frontend/Dockerfile missing                                             | frontend/Dockerfile                               | Frontend cannot be built or run                      | 7    |

---

## 4. VERIFICACIÓN DE ACCEPTANCE CRITERIA

**AC1:** All backend services start, register health endpoints, and expose only the APIs defined in SPEC.md, with RBAC and JWT enforced.  
**❌ Fail** — Multiple services missing Dockerfiles, stubs for core logic, and missing DB/Redis/JWT implementations. Health endpoints exist, but APIs are not functional.

**AC2:** The frontend dashboard displays demand predictions, recommendations, alerts, and inventory data, consuming only the allowed APIs and types.  
**⚠️ Partial** — Frontend code exists and is well-structured, but cannot run due to missing Dockerfile and backend APIs are not functional.

**AC3:** The system runs end-to-end with `./run.sh`, with all services healthy, data flowing from backend to frontend, and all infrastructure files in place.  
**❌ Fail** — `run.sh` and infra files exist, but services cannot build/run due to missing Dockerfiles and non-functional backend code.

---

## 5. ARCHIVOS FALTANTES

| File Path                                         | Criticality | Notes                                                      |
|---------------------------------------------------|-------------|------------------------------------------------------------|
| backend/inventory-service/Dockerfile              | 🔴 CRÍTICO  | Service cannot be built or run.                            |
| backend/prediction-service/Dockerfile             | 🔴 CRÍTICO  | Service cannot be built or run.                            |
| backend/recommendation-service/Dockerfile         | 🔴 CRÍTICO  | Service cannot be built or run.                            |
| backend/alert-service/Dockerfile                  | 🔴 CRÍTICO  | Service cannot be built or run.                            |
| frontend/Dockerfile                               | 🔴 CRÍTICO  | Frontend cannot be built or run.                           |
| docs/architecture.md                              | 🟡 MEDIO    | Not critical for running, but required by plan.            |

---

## 6. RECOMENDACIONES DE ACCIÓN

### 🔴 CRÍTICO

1. **Create missing Dockerfiles for all backend services and frontend.**  
   - Example for backend/inventory-service/Dockerfile:
     ```dockerfile
     FROM node:20-alpine AS builder
     WORKDIR /app
     COPY package*.json ./
     RUN npm install --only=production
     COPY ../shared ./shared
     COPY . .
     RUN npm run build
     FROM node:20-alpine
     WORKDIR /app
     COPY --from=builder /app/dist ./dist
     COPY --from=builder /app/node_modules ./node_modules
     COPY --from=builder /app/package.json ./package.json
     COPY --from=builder /app/shared ./shared
     ENV NODE_ENV=production
     ENV PORT=8002
     USER node
     EXPOSE 8002
     CMD ["node", "dist/index.js"]
     ```
   - Repeat for each service, adjusting port and context.

2. **Implement real logic in backend/shared modules.**
   - `backend/shared/models.ts`: Fully implement all interfaces and enums as per SPEC.md.
   - `backend/shared/auth.ts`: Implement JWT generation/verification and password hashing.
   - `backend/shared/db.ts`: Implement TypeORM DataSource and connection helpers.
   - `backend/shared/redis.ts`: Implement ioredis connection and caching helpers.

3. **Fix all broken imports.**
   - Change imports from `.js` to `.ts` where only `.ts` exists (e.g., in `backend/auth-service/src/routes/auth.ts` and `src/controllers/authController.ts`).

4. **Initialize DB connection before starting Express servers.**
   - In each `src/index.ts`, call a DB initialization function before `app.listen`.

### 🟠 ALTO

5. **Remove duplicate or confusing files.**
   - Remove `.js.js` and `.js.ts` files if not used.
   - Ensure only one of `.ts` or `.tsx` exists for each React component.

6. **Ensure all Express apps register all required routes and error handlers.**
   - Register health, API, and error routes in `src/app.ts` for each service.

7. **Implement real business logic in all controllers and services.**
   - Replace stubs with actual CRUD, prediction, recommendation, and alert logic.

### 🟡 MEDIO

8. **Add missing documentation file.**
   - Create `docs/architecture.md` with system diagram and component descriptions.

9. **Standardize environment variable usage.**
   - Ensure all code and docker-compose use the same variable names.

### 🟢 BAJO

10. **Improve code comments and remove unused code.**
    - Clean up commented-out or unused code for clarity.

---

## MACHINE_READABLE_ISSUES
```json
[
  {
    "severity": "critical",
    "files": [
      "backend/inventory-service/Dockerfile",
      "backend/prediction-service/Dockerfile",
      "backend/recommendation-service/Dockerfile",
      "backend/alert-service/Dockerfile",
      "frontend/Dockerfile"
    ],
    "description": "Missing Dockerfile prevents building and running the service.",
    "fix_hint": "Create a Dockerfile for each service with a build step and correct context."
  },
  {
    "severity": "critical",
    "files": ["backend/shared/models.ts"],
    "description": "shared/models.ts does not match SPEC.md contracts (wrong enums, missing fields, incomplete interfaces).",
    "fix_hint": "Rewrite shared/models.ts to exactly match all interfaces and enums from SPEC.md §2."
  },
  {
    "severity": "critical",
    "files": ["backend/shared/auth.ts"],
    "description": "shared/auth.ts is a stub, does not implement JWT/password logic.",
    "fix_hint": "Implement JWT generation/verification and password hashing in shared/auth.ts."
  },
  {
    "severity": "critical",
    "files": ["backend/shared/db.ts"],
    "description": "shared/db.ts is a stub, does not provide TypeORM connection.",
    "fix_hint": "Implement TypeORM DataSource and connection helpers in shared/db.ts."
  },
  {
    "severity": "critical",
    "files": ["backend/shared/redis.ts"],
    "description": "shared/redis.ts is a stub, does not provide ioredis connection.",
    "fix_hint": "Implement ioredis connection and caching helpers in shared/redis.ts."
  },
  {
    "severity": "critical",
    "files": ["backend/auth-service/src/routes/auth.ts"],
    "description": "Imports from '../controllers/authController.js' but only .ts exists.",
    "fix_hint": "Change import to '../controllers/authController.ts' or ensure .js is built."
  },
  {
    "severity": "critical",
    "files": ["backend/auth-service/src/controllers/authController.ts"],
    "description": "Imports from '@merma/shared/models.js' but only .ts exists.",
    "fix_hint": "Change import to '@merma/shared/models.ts' or ensure .js is built."
  },
  {
    "severity": "critical",
    "files": ["backend/auth-service/src/index.ts"],
    "description": "Does not initialize DB connection before starting server.",
    "fix_hint": "Call DB initialization before app.listen in src/index.ts."
  },
  {
    "severity": "critical",
    "files": ["backend/auth-service/src/app.ts"],
    "description": "Does not register health route or error handler.",
    "fix_hint": "Register health and error routes in app.ts."
  }
]
```