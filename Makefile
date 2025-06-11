# Task Manager - Docker Commands
# ==============================

.PHONY: help build up down logs clean dev prod restart

# Default target
help: ## Show this help message
	@echo "Task Manager - Docker Commands"
	@echo "=============================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Production Commands
build: ## Build all Docker images
	docker-compose build

up: ## Start all services in production mode
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

restart: ## Restart all services
	docker-compose restart

# Development Commands
dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yml up -d

dev-build: ## Build and start development environment
	docker-compose -f docker-compose.dev.yml up -d --build

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

# Database Commands
db-shell: ## Open MongoDB shell
	docker exec -it taskmanager-mongodb mongosh -u admin -p password123 --authenticationDatabase admin taskmanager

db-backup: ## Backup database
	docker exec taskmanager-mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db taskmanager --out /tmp/backup
	docker cp taskmanager-mongodb:/tmp/backup ./backup/$(shell date +%Y%m%d_%H%M%S)

db-restore: ## Restore database from backup (specify BACKUP_DIR)
	@if [ -z "$(BACKUP_DIR)" ]; then echo "Please specify BACKUP_DIR=path/to/backup"; exit 1; fi
	docker cp $(BACKUP_DIR) taskmanager-mongodb:/tmp/restore
	docker exec taskmanager-mongodb mongorestore --username admin --password password123 --authenticationDatabase admin --db taskmanager /tmp/restore

# Maintenance Commands
clean: ## Remove all containers, images, and volumes
	docker-compose down -v --rmi all
	docker system prune -f

clean-dev: ## Remove development containers and volumes
	docker-compose -f docker-compose.dev.yml down -v --rmi all

status: ## Show status of all containers
	docker-compose ps

health: ## Check health of all services
	@echo "Checking service health..."
	@echo "Frontend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "DOWN")"
	@echo "Backend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health || echo "DOWN")"
	@echo "MongoDB: $$(docker exec taskmanager-mongodb mongosh --quiet --eval 'db.runCommand("ping").ok' mongodb://admin:password123@localhost:27017/taskmanager?authSource=admin 2>/dev/null || echo "DOWN")"

# Utility Commands
frontend-shell: ## Open shell in frontend container
	docker exec -it taskmanager-frontend /bin/sh

backend-shell: ## Open shell in backend container
	docker exec -it taskmanager-backend /bin/sh

build-frontend: ## Build only frontend
	docker-compose build frontend

build-backend: ## Build only backend
	docker-compose build backend

# Quick Start Commands
quick-start: ## Quick start for first time setup
	@echo "🚀 Starting Task Manager for the first time..."
	@echo "📦 Building images..."
	docker-compose build
	@echo "🏃 Starting services..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 30
	@echo "✅ Task Manager is ready!"
	@echo "🌐 Frontend: http://localhost:8080"
	@echo "🔧 Backend: http://localhost:4000"
	@echo "👤 Demo user: demo@taskmanager.local / demo123"

stop-all: ## Stop all Docker containers
	docker stop $$(docker ps -aq) 2>/dev/null || true

# Update Commands
update: ## Pull latest images and restart
	docker-compose pull
	docker-compose up -d 