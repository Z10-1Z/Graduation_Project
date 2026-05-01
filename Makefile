.PHONY: help install setup start stop build dev test clean logs

help: ## Show this help message
	@echo "Medical Appointment System - Available Commands"
	@echo ""
	@echo "  make install          Install all dependencies"
	@echo "  make setup            Setup environment and database"
	@echo "  make start            Start all services (Docker)"
	@echo "  make stop             Stop all services"
	@echo "  make build            Build Docker containers"
	@echo "  make dev              Start development mode (Docker)"
	@echo "  make test             Run all tests"
	@echo "  make clean            Clean up containers and caches"
	@echo "  make logs             View container logs"
	@echo ""
	@echo "  make backend-install  Install backend dependencies"
	@echo "  make backend-serve    Start backend server"
	@echo "  make backend-test     Run backend tests"
	@echo "  make backend-migrate  Run migrations"
	@echo ""
	@echo "  make frontend-install Install frontend dependencies"
	@echo "  make frontend-dev     Start frontend dev server"
	@echo "  make frontend-test    Run frontend tests"
	@echo "  make frontend-build   Build for production"
	@echo "  make frontend-lint    Lint frontend code"

install: ## Install all dependencies (backend + frontend)
	cd backend && composer install
	cd frontend && npm install

setup: ## Setup environment and database
	cd backend && cp .env.example .env && php artisan key:generate
	cd backend && touch database/database.sqlite
	cd backend && php artisan migrate:fresh --seed

start: ## Start all services with Docker (production mode)
	docker-compose up -d
	@echo ""
	@echo "Services running at:"
	@echo "  - Backend API: http://localhost:8000"
	@echo "  - Frontend:    http://localhost:5173"

stop: ## Stop all services
	docker-compose down

build: ## Build Docker containers from scratch
	docker-compose build --no-cache

dev: ## Run in development mode with hot reload
	docker-compose -f docker-compose.dev.yml up
	@echo ""
	@echo "Development mode:"
	@echo "  - Backend API: http://localhost:8000"
	@echo "  - Frontend:    http://localhost:5173"

test: ## Run all tests (backend + frontend)
	cd backend && php artisan test
	cd frontend && npm run test

clean: ## Clean up containers, volumes, and caches
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	cd backend && php artisan config:clear && php artisan cache:clear && php artisan route:clear

logs: ## View container logs (Ctrl+C to exit)
	docker-compose logs -f

# ====================
# Backend Commands
# ====================

backend-install: ## Install PHP dependencies
	cd backend && composer install

backend-serve: ## Start Laravel development server
	cd backend && php artisan serve

backend-test: ## Run backend tests
	cd backend && php artisan test

backend-migrate: ## Run database migrations
	cd backend && php artisan migrate

backend-migrate-fresh: ## Reset and reseed database
	cd backend && php artisan migrate:fresh --seed

backend-seed: ## Run database seeders
	cd backend && php artisan db:seed

backend-route-list: ## List all routes
	cd backend && php artisan route:list

backend-shell: ## Open Laravel tinker shell
	cd backend && php artisan tinker

# ====================
# Frontend Commands
# ====================

frontend-install: ## Install Node dependencies
	cd frontend && npm install

frontend-dev: ## Start Vite development server
	cd frontend && npm run dev

frontend-test: ## Run frontend tests
	cd frontend && npm run test

frontend-test-e2e: ## Run E2E tests with Playwright
	cd frontend && npm run test:e2e

frontend-build: ## Build for production
	cd frontend && npm run build

frontend-preview: ## Preview production build
	cd frontend && npm run preview

frontend-lint: ## Lint code
	cd frontend && npm run lint

frontend-lint-fix: ## Fix linting errors
	cd frontend && npm run lint -- --fix