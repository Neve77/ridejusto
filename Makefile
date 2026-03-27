.PHONY: help build up down logs shell test clean

help:
	@echo "🚗 RideJusto - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build       - Build Docker image"
	@echo "  make up          - Start containers (development mode)"
	@echo "  make down        - Stop containers"
	@echo "  make logs        - View application logs"
	@echo "  make shell       - Access application shell"
	@echo "  make db-shell    - Access PostgreSQL shell"
	@echo "  make test        - Run tests inside container"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make migrate     - Run database migrations"
	@echo ""

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "✅ Containers started. API available at http://localhost:8000/docs"

down:
	docker-compose down

logs:
	docker-compose logs -f backend

shell:
	docker-compose exec backend /bin/bash

db-shell:
	docker-compose exec db psql -U ${POSTGRES_USER:-ridejusto} -d ${POSTGRES_DB:-ridejusto_db}

test:
	docker-compose exec backend pytest -v

clean:
	docker-compose down -v
	@echo "✅ Cleaned up containers and volumes"

restart:
	docker-compose restart

ps:
	docker-compose ps

env:
	cp .env.example .env
	@echo "✅ Created .env from .env.example"
