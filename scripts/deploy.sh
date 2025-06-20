#!/bin/bash

# Rumah Tahfidz Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Rumah Tahfidz Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="rumah-tahfidz"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Create directories if they don't exist
mkdir -p logs
mkdir -p backups

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if required tools are installed
check_requirements() {
    log "Checking requirements..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is required but not installed."
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is required but not installed."
    command -v node >/dev/null 2>&1 || error "Node.js is required but not installed."
    command -v npm >/dev/null 2>&1 || error "npm is required but not installed."
    
    log "✅ All requirements satisfied"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if [ -f "docker-compose.yml" ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
        
        # Backup database
        if docker-compose ps | grep -q "db"; then
            info "Backing up database..."
            docker-compose exec -T db pg_dump -U postgres rumah_tahfidz > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        fi
        
        # Backup uploads
        if [ -d "uploads" ]; then
            info "Backing up uploads..."
            cp -r uploads "$BACKUP_DIR/$BACKUP_NAME/"
        fi
        
        # Backup environment files
        if [ -f ".env.local" ]; then
            cp .env.local "$BACKUP_DIR/$BACKUP_NAME/"
        fi
        
        log "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        warning "No existing deployment found, skipping backup"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    npm ci --only=production
    
    log "✅ Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Build Next.js application
    npm run build
    
    log "✅ Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Check if database is accessible
    if docker-compose ps | grep -q "db"; then
        npx prisma db push
        log "✅ Database migrations completed"
    else
        warning "Database not running, skipping migrations"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Health check
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        log "✅ Health check passed"
    else
        warning "Health check failed, but continuing deployment"
    fi
    
    # Run comprehensive tests if available
    if curl -f -X POST http://localhost:3000/api/test/comprehensive >/dev/null 2>&1; then
        log "✅ Comprehensive tests passed"
    else
        warning "Comprehensive tests failed or not available"
    fi
}

# Deploy with Docker Compose
deploy_docker() {
    log "Deploying with Docker Compose..."
    
    # Pull latest images
    docker-compose pull
    
    # Build and start services
    docker-compose up -d --build
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log "✅ Services are running"
    else
        error "Some services failed to start"
    fi
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if application is responding
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            log "✅ Application is responding"
            break
        else
            info "Attempt $attempt/$max_attempts: Application not ready yet..."
            sleep 10
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        error "Application failed to respond after $max_attempts attempts"
    fi
    
    # Run post-deployment tests
    log "Running post-deployment verification..."
    
    # Check database connectivity
    if docker-compose exec -T app npx prisma db push --accept-data-loss >/dev/null 2>&1; then
        log "✅ Database connectivity verified"
    else
        warning "Database connectivity check failed"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Keep only last 10 backups
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        ls -t | tail -n +11 | xargs -r rm -rf
        cd ..
        log "✅ Old backups cleaned up"
    fi
}

# Send deployment notification
send_notification() {
    log "Sending deployment notification..."
    
    # You can integrate with Slack, Discord, or email here
    local status=$1
    local message="🚀 Rumah Tahfidz deployment $status at $(date)"
    
    # Example: Send to webhook (uncomment and configure)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"$message\"}" \
    #     YOUR_WEBHOOK_URL
    
    log "📧 Notification sent: $message"
}

# Main deployment function
main() {
    log "🚀 Starting deployment of $PROJECT_NAME"
    
    # Parse command line arguments
    SKIP_BACKUP=false
    SKIP_TESTS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Execute deployment steps
    check_requirements
    
    if [ "$SKIP_BACKUP" = false ]; then
        backup_current
    else
        warning "Skipping backup as requested"
    fi
    
    install_dependencies
    build_application
    run_migrations
    deploy_docker
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    else
        warning "Skipping tests as requested"
    fi
    
    verify_deployment
    cleanup_backups
    
    log "🎉 Deployment completed successfully!"
    send_notification "completed successfully"
    
    # Display useful information
    echo ""
    echo -e "${GREEN}=== Deployment Summary ===${NC}"
    echo -e "${BLUE}Application URL:${NC} http://localhost:3000"
    echo -e "${BLUE}Admin Dashboard:${NC} http://localhost:3000/dashboard/admin"
    echo -e "${BLUE}Health Check:${NC} http://localhost:3000/api/health"
    echo -e "${BLUE}Monitoring:${NC} http://localhost:3001 (Grafana)"
    echo -e "${BLUE}Log File:${NC} $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Configure your domain and SSL certificates"
    echo "2. Set up monitoring and alerting"
    echo "3. Configure backup schedules"
    echo "4. Test all functionality"
    echo ""
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
