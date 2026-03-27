#!/bin/bash

# RideJusto Docker Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh development start
#          ./deploy.sh production up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-development}"
ACTION="${2:-up}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
DEV_COMPOSE="docker-compose.yml"
PROD_COMPOSE="docker-compose.prod.yml"
ENV_EXAMPLE=".env.example"
ENV_DEV=".env"
ENV_PROD=".env.prod"

echo -e "${BLUE}🚗 RideJusto Docker Deployment Script${NC}"
echo "=================================="

# Function to print colored messages
log_info() {
    echo -e "${BLUE}ℹ  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Validate Docker installation
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker is installed"
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_success "Docker Compose is installed"
}

# Setup environment file
setup_env() {
    local env_file=$1
    local env_template=$2
    
    if [ ! -f "$env_file" ]; then
        log_warning "Environment file not found: $env_file"
        if [ -f "$env_template" ]; then
            log_info "Creating from template: $env_template"
            cp "$env_template" "$env_file"
            log_success "Created $env_file"
            log_warning "Please edit $env_file with your configuration"
        else
            log_error "Template file not found: $env_template"
            exit 1
        fi
    else
        log_success "Environment file exists: $env_file"
    fi
}

# Development environment
dev_start() {
    log_info "Starting development environment..."
    
    setup_env "$ENV_DEV" "$ENV_EXAMPLE"
    
    log_info "Building Docker image..."
    docker-compose build
    
    log_info "Starting containers..."
    docker-compose up -d
    
    log_success "Development environment started!"
    echo ""
    echo -e "${GREEN}Available endpoints:${NC}"
    echo "  📚 API Docs:   http://localhost:8000/docs"
    echo "  📖 ReDoc:      http://localhost:8000/redoc"
    echo "  ❤️  Health:     http://localhost:8000/health"
    echo ""
    echo -e "${GREEN}Useful commands:${NC}"
    echo "  View logs:     make logs  (or: docker-compose logs -f backend)"
    echo "  App shell:     make shell (or: docker-compose exec backend bash)"
    echo "  DB shell:      make db-shell"
    echo "  Stop:          make down"
    echo ""
}

dev_stop() {
    log_info "Stopping development environment..."
    docker-compose down
    log_success "Development environment stopped"
}

dev_logs() {
    log_info "Displaying logs (Press Ctrl+C to exit)..."
    docker-compose logs -f backend
}

# Production environment
prod_start() {
    log_info "Starting production environment..."
    
    setup_env "$ENV_PROD" "$ENV_EXAMPLE"
    
    # Check for SSL certificates
    if [ ! -d "certs" ]; then
        log_warning "SSL certificates not found in ./certs/"
        log_warning "Nginx will start without SSL. For production, generate certificates:"
        echo "  mkdir -p certs"
        echo "  # Copy your certificates to certs/cert.pem and certs/key.pem"
    fi
    
    log_info "Building Docker image..."
    docker-compose -f "$PROD_COMPOSE" build
    
    log_info "Starting containers..."
    docker-compose -f "$PROD_COMPOSE" --env-file "$ENV_PROD" up -d
    
    log_success "Production environment started!"
    log_warning "Make sure to:"
    echo "  1. Configure a domain name"
    echo "  2. Setup SSL certificates"
    echo "  3. Configure firewall rules"
    echo "  4. Setup monitoring"
    echo ""
}

prod_stop() {
    log_info "Stopping production environment..."
    docker-compose -f "$PROD_COMPOSE" down
    log_success "Production environment stopped"
}

# Common actions
build() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "Building development image..."
        docker-compose build
    else
        log_info "Building production image..."
        docker-compose -f "$PROD_COMPOSE" build
    fi
    log_success "Build completed"
}

restart() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "Restarting development environment..."
        docker-compose restart
    else
        log_info "Restarting production environment..."
        docker-compose -f "$PROD_COMPOSE" restart
    fi
    log_success "Restart completed"
}

status() {
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose ps
    else
        docker-compose -f "$PROD_COMPOSE" ps
    fi
}

clean() {
    log_warning "This will remove containers and volumes!"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ "$ENVIRONMENT" = "development" ]; then
            docker-compose down -v
        else
            docker-compose -f "$PROD_COMPOSE" down -v
        fi
        log_success "Cleaned up"
    else
        log_info "Cleanup cancelled"
    fi
}

# Help message
show_help() {
    echo "Usage: ./deploy.sh [environment] [action]"
    echo ""
    echo "Environments:"
    echo "  development    Use docker-compose.yml (default)"
    echo "  production     Use docker-compose.prod.yml"
    echo ""
    echo "Actions:"
    echo "  start/up       Start containers"
    echo "  stop/down      Stop containers"
    echo "  restart        Restart containers"
    echo "  build          Build Docker image"
    echo "  logs           View container logs"
    echo "  status/ps      Show container status"
    echo "  clean          Remove containers and volumes"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh development start"
    echo "  ./deploy.sh production up"
    echo "  ./deploy.sh development logs"
    echo "  ./deploy.sh production clean"
    echo ""
}

# Main execution
main() {
    # Validate inputs
    case "$ENVIRONMENT" in
        development|production) ;;
        help|-h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            echo "Valid environments: development, production"
            exit 1
            ;;
    esac
    
    check_docker
    
    # Normalize action
    ACTION=$(echo "$ACTION" | tr '[:upper:]' '[:lower:]')
    
    case "$ACTION" in
        start|up)
            if [ "$ENVIRONMENT" = "development" ]; then
                dev_start
            else
                prod_start
            fi
            ;;
        stop|down)
            if [ "$ENVIRONMENT" = "development" ]; then
                dev_stop
            else
                prod_stop
            fi
            ;;
        restart)
            restart
            ;;
        build)
            build
            ;;
        logs|log)
            dev_logs
            ;;
        status|ps)
            status
            ;;
        clean)
            clean
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            log_error "Invalid action: $ACTION"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main
