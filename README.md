# Merma - Sistema de Optimización de Merma en Productos Perecederos

## 📋 Descripción del Proyecto

Merma es una plataforma de gestión de inventario y reducción de pérdidas para el sector de restaurantes, diseñada con una arquitectura de microservicios. Su objetivo principal es optimizar el control de stock, predecir tendencias de merma mediante análisis predictivo, y generar reportes accionables.

### Características Principales

- **Gestión de Inventario**: CRUD completo de productos con seguimiento de caducidad
- **Predicción de Demanda**: Modelo predictivo basado en historial de ventas
- **Sistema de Recomendaciones**: Sugerencias inteligentes (reposición, descuento, no reposición)
- **Alertas de Merma**: Notificaciones proactivas de riesgo de merma
- **Dashboard Visual**: Interfaz intuitiva para monitoreo y toma de decisiones

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Node.js 20 + Express.js |
| Base de Datos | PostgreSQL 15 |
| Cache | Redis 7 |
| Frontend | React 18 + TypeScript |
| Contenedores | Docker + Docker Compose |
| Orquestación | Kubernetes (AWS EKS) |
| Cloud | AWS |

### Microservicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| auth-service | 8001 | Autenticación JWT y gestión de usuarios |
| inventory-service | 8002 | Gestión de inventario y productos |
| prediction-service | 8003 | Predicción de demanda |
| recommendation-service | 8004 | Motor de recomendaciones |
| alert-service | 8005 | Sistema de alertas |
| frontend | 3000 | Dashboard React |

## 🚀 Inicio Rápido

### Prerequisites

- Docker 24.x+
- Docker Compose 2.x+
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
git clone <repository-url>
cd merma
```

2. **Configurar variables de entorno**
   ```bash
   # El script automáticamente crea .env desde .env.example
   cp .env.example .env
   # Edita .env con tus valores
   ```

3. **Iniciar servicios**
   ```bash
   # Iniciar todos los servicios
   ./run.sh
   
   # O manualmente
   docker-compose up -d
   ```

4. **Verificar estado**
   ```bash
   ./run.sh status
   ```

### Acceso a la Aplicación

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Auth API | http://localhost:8001 |
| Inventory API | http://localhost:8002 |
| Prediction API | http://localhost:8003 |
| Recommendation API | http://localhost:8004 |
| Alert API | http://localhost:8005 |

## 📖 Documentación de APIs

### Auth Service

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Inventory Service

```bash
# Get inventory overview
GET /api/inventory/overview
Authorization: Bearer <token>

# Get all items
GET /api/inventory/items
Authorization: Bearer <token>

# Create item
POST /api/inventory/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tomates",
  "category": "Verduras",
  "quantity": 50,
  "unit": "kg",
  "expirationDate": "2024-12-31",
  "location": "Almacén A"
}
```

### Prediction Service

```bash
# Get demand predictions
GET /api/predictions/demand?date=2024-12-01
Authorization: Bearer <token>
```

### Recommendation Service

```bash
# Get recommendations
GET /api/recommendations
Authorization: Bearer <token>
```

### Alert Service

```bash
# Get alerts
GET /api/alerts
Authorization: Bearer <token>

# Acknowledge alert
POST /api/alerts/:id/acknowledge
Authorization: Bearer <token>
```

## 🐳 Comandos Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Eliminar volúmenes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

## ☸️ Kubernetes Deployment

Los manifiestos de Kubernetes están disponibles en el directorio `k8s/`:

```bash
# Aplicar manifiestos
kubectl apply -f k8s/

# Ver pods
kubectl get pods -n merma

# Ver servicios
kubectl get svc -n merma
```

## 🔧 Desarrollo

### Estructura del Proyecto

```
merma/
├── backend/
│   ├── shared/           # Módulos compartidos
│   ├── auth-service/    # Servicio de autenticación
│   ├── inventory-service/
│   ├── prediction-service/
│   ├── recommendation-service/
│   └── alert-service/
├── frontend/            # Aplicación React
├── k8s/                 # Manifiestos Kubernetes
├── docker-compose.yml
├── run.sh
└── README.md
```

### Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `./run.sh` | Iniciar todos los servicios |
| `./run.sh build` | Construir imágenes |
| `./run.sh stop` | Detener servicios |
| `./run.sh clean` | Limpiar volúmenes |
| `./run.sh logs` | Ver logs en vivo |
| `./run.sh status` | Ver estado de servicios |

## 📝 Licencia

Este proyecto es parte del sistema de optimización de merma para productos perecederos.

## 👥 Equipo

Desarrollado con el stack: Node.js 20, Express.js, PostgreSQL 15, Redis 7, React 18, Docker, Kubernetes, AWS
