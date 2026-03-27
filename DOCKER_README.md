# 🚗 RideJusto - Docker Deployment Guide

## 📋 Quick Start

### Prerequisites
- Docker >= 20.10
- Docker Compose >= 1.29
- Make (optional, for convenient commands)

### Development Setup

```bash
# 1. Clone and navigate to project
cd ridejusto

# 2. Create .env file
cp .env.example .env

# 3. Build and start containers
make build
make up

# 4. Check API is running
curl http://localhost:8000/health

# 5. Access API documentation
# Open browser: http://localhost:8000/docs
```

### Available Make Commands

```bash
make help      # Show all available commands
make build     # Build Docker image
make up        # Start containers
make down      # Stop containers
make logs      # View logs
make shell     # Access app shell
make db-shell  # Access database shell
make clean     # Remove containers and volumes
```

---

## 🏗️ Docker Architecture

```
┌─────────────────────────────────────┐
│      docker-compose.yml             │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌────────────┐  │
│  │  FastAPI     │  │ PostgreSQL │  │
│  │  :8000       │  │ :5432      │  │
│  └──────────────┘  └────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Production Deployment

### Using docker-compose.prod.yml

```bash
# 1. Create production .env
cp .env.example .env.prod
# Edit .env.prod with production values

# 2. Deploy with production config
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 3. Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

### Environment Variables (Production)

```env
# CRITICAL: Change these values!
SECRET_KEY=your-secure-random-key-here
POSTGRES_PASSWORD=very-secure-password

# Database
POSTGRES_USER=ridejusto
POSTGRES_DB=ridejusto_db

# API Configuration
API_PORT=8000
ENVIRONMENT=production
DEBUG=False
```

### Security Best Practices

```bash
# 1. Generate secure SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Use strong database password
# Generate: openssl rand -base64 32

# 3. Set proper file permissions
chmod 600 .env.prod

# 4. Enable firewall rules
# Allow only: 80 (HTTP), 443 (HTTPS), 22 (SSH)

# 5. Use Nginx reverse proxy (included in docker-compose.prod.yml)
# Configure SSL certificates at ./certs/
```

---

## 📊 Database Connection

### From host machine (development)
```python
# Connection string
postgresql://ridejusto:ridejusto123@localhost:5432/ridejusto_db
```

### Inside Docker network (production)
```python
# Connection string
postgresql://ridejusto:password@db:5432/ridejusto_db
```

### Access PostgreSQL shell

**Development:**
```bash
make db-shell
# Or directly:
docker-compose exec db psql -U ridejusto -d ridejusto_db
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml exec db psql -U ridejusto -d ridejusto_db
```

---

## 🔍 Monitoring & Debugging

### View API Logs
```bash
# Development
make logs

# Production
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Access Application Shell
```bash
make shell
# Then run Python commands:
python
>>> from app.models import User
>>> # Debug here
```

### Container Status
```bash
docker-compose ps
docker stats
```

### Network Inspection
```bash
docker network inspect ridejusto_ridejusto-network
```

---

## 🧹 Cleanup & Maintenance

### Remove everything
```bash
make clean
# Or manually:
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### Prune unused Docker resources
```bash
docker system prune -a
```

---

## 📈 Performance Optimization

### PostgreSQL Connection Pool
- Configured in `session.py`
- Pool size: 10, Max overflow: 20
- Pre-ping enabled for connection health

### Docker Image Size
- Multi-stage build reduces size
- Base image: python:3.11-slim (~200MB)
- Final image: ~500MB

### Health Checks
- Backend: `/health` endpoint (30s interval)
- Database: `pg_isready` (10s interval)

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Find process using port
lsof -i :8000
kill -9 <PID>

# Or change port in .env
API_PORT=8001
```

### Database connection refused
```bash
# Check if database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Permission denied
```bash
# Fix ownership
sudo chown -R $(whoami) .

# Or use sudo
sudo docker-compose up
```

### Out of disk space
```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk usage
docker system df
```

---

## 📝 Useful Commands Reference

```bash
# Build & Run
docker-compose build
docker-compose up -d
docker-compose down

# Access
docker-compose exec backend bash
docker-compose exec db psql -U ridejusto

# Monitoring
docker-compose logs -f
docker-compose ps
docker stats

# Cleanup
docker-compose down -v
docker system prune -a
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

---

## ✅ Deployment Checklist

- [ ] Environment variables configured (.env.prod)
- [ ] SECRET_KEY changed and secure
- [ ] Database password changed and secure
- [ ] SSL certificates configured (for HTTPS)
- [ ] Firewall rules configured
- [ ] Health checks working
- [ ] Logs configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] Documentation reviewed

---

**Last Updated:** March 2026  
**Version:** 0.1.0  
**Environment:** Production Ready
