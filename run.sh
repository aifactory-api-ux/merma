#!/bin/bash
# =============================================================================
# MERMA PROJECT - Startup Script
# =============================================================================
# This script automates the local development environment setup.
# It checks Docker, creates .env from template, builds and starts services.
#
# Usage:
#   ./run.sh           # Start all services
#   ./run.sh build     # Build images without starting
#   ./run.sh stop      # Stop all services
#   ./run.sh clean     # Stop and remove volumes
#   ./run.sh logs      # Show logs for all services
#   ./run.sh status    # Show status of all services
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Print header
print_header() {
  echo ""
  print_message "$BLUE" "=========================================="
  print_message "$BLUE" "  $1"
  print_message "$BLUE" "=========================================="
  echo ""
}

# Check if Docker is installed and running
check_docker() {
  print_header "Checking Docker"
  
  if ! command -v docker &> /dev/null; then
    print_message "$RED" "ERROR: Docker is not installed."
    print_message "$YELLOW" "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_message "$RED" "ERROR: Docker Compose is not installed."
    print_message "$YELLOW" "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
  fi
  
  if ! docker info &> /dev/null; then
    print_message "$RED" "ERROR: Docker daemon is not running."
    print_message "$YELLOW" "Please start Docker Desktop or the Docker daemon."
    exit 1
  fi
  
  print_message "$GREEN" "✓ Docker is installed and running"
}

# Create .env file from template if it doesn't exist
create_env_file() {
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      print_message "$GREEN" "✓ Created .env from .env.example"
    else
      print_message "$RED" "ERROR: .env.example not found"
      exit 1
    fi
  else
    print_message "$GREEN" "✓ .env file already exists"
  fi
}

# Build Docker images
build_images() {
  print_header "Building Docker Images"
  
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  $DOCKER_COMPOSE build --no-cache
  
  print_message "$GREEN" "✓ All images built successfully"
}

# Start all services
start_services() {
  print_header "Starting Services"
  
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  $DOCKER_COMPOSE up -d
  
  print_message "$GREEN" "✓ All services started"
}

# Stop all services
stop_services() {
  print_header "Stopping Services"
  
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  $DOCKER_COMPOSE down
  
  print_message "$GREEN" "✓ All services stopped"
}

# Clean up everything
clean_services() {
  print_header "Cleaning Up"
  
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  $DOCKER_COMPOSE down -v --remove-orphans
  
  print_message "$GREEN" "✓ All services and volumes removed"
}

# Show logs
show_logs() {
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  $DOCKER_COMPOSE logs -f
}

# Show status
show_status() {
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  $DOCKER_COMPOSE ps
}

# Wait for services to be healthy
wait_for_healthy() {
  print_header "Waiting for Services to be Healthy"
  
  local max_attempts=60
  local attempt=0
  
  # Determine docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  else
    DOCKER_COMPOSE="docker-compose"
  fi
  
  while [ $attempt -lt $max_attempts ]; do
    # Check if all services are healthy
    local unhealthy=$($DOCKER_COMPOSE ps --format json 2>/dev/null | grep -c '"health":"unhealthy"' || true)
    
    if [ "$unhealthy" -eq "0" ]; then
      print_message "$GREEN" "✓ All services are healthy"
      return 0
    fi
    
    attempt=$((attempt + 1))
    print_message "$YELLOW" "Waiting for services... ($attempt/$max_attempts)"
    sleep 2
  done
  
  print_message "$RED" "WARNING: Some services may not be fully healthy yet"
  return 1
}

# Print access information
print_access_info() {
  print_header "Access Information"
  
  echo ""
  print_message "$BLUE" "  Service URLs:"
  echo ""
  print_message "$GREEN" "    - Frontend:        http://localhost:3000"
  print_message "$GREEN" "    - Auth Service:     http://localhost:8001"
  print_message "$GREEN" "    - Inventory:        http://localhost:8002"
  print_message "$GREEN" "    - Prediction:      http://localhost:8003"
  print_message "$GREEN" "    - Recommendation:  http://localhost:8004"
  print_message "$GREEN" "    - Alert Service:   http://localhost:8005"
  echo ""
  print_message "$BLUE" "  Health Check Endpoints:"
  echo ""
  print_message "$GREEN" "    - /health on each service"
  echo ""
  print_message "$YELLOW" "  Use './run.sh logs' to view live logs"
  print_message "$YELLOW" "  Use './run.sh status' to check service status"
  echo ""
}

# Main function
main() {
  case "${1:-}" in
    build)
      check_docker
      create_env_file
      build_images
      ;;
    stop)
      stop_services
      ;;
    clean)
      clean_services
      ;;
    logs)
      show_logs
      ;;
    status)
      show_status
      ;;
    "")
      check_docker
      create_env_file
      build_images
      start_services
      wait_for_healthy
      print_access_info
      ;;
    *)
      echo "Usage: $0 {build|stop|clean|logs|status}"
      echo ""
      echo "  (no args)  - Start all services"
      echo "  build      - Build images without starting"
      echo "  stop       - Stop all services"
      echo "  clean      - Stop and remove volumes"
      echo "  logs       - Show logs for all services"
      echo "  status     - Show status of all services"
      exit 1
      ;;
  esac
}

main "$@"
