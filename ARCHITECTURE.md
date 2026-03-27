# 🏗️ RideJusto Architecture Diagram

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Internet Users                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    (HTTP/HTTPS Port 80/443)
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                                                                  │
│                    🐳 Docker Container Network                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │   🌐 NGINX Reverse Proxy (Alpine Linux)                   │ │
│  │   ├─ SSL/TLS Termination                                  │ │
│  │   ├─ Rate Limiting (10 req/s API, 5 req/m Auth)          │ │
│  │   ├─ Gzip Compression                                     │ │
│  │   ├─ Security Headers                                     │ │
│  │   ├─ Request Routing                                      │ │
│  │   └─ Load Balancing (when scaled)                         │ │
│  │                                                            │ │
│  │   :80 ───────────── Redirect to HTTPS                     │ │
│  │   :443 ──────────── Listen HTTPS                          │ │
│  │                                                            │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           │                                      │
│                    (Internal Network)                            │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │                                                            │ │
│  │   🚀 FastAPI Backend (Python 3.11)                        │ │
│  │   ├─ Port: 8000                                           │ │
│  │   ├─ Workers: 1 (Uvicorn)                                 │ │
│  │   ├─ Logging: Structured JSON                             │ │
│  │   ├─ Health Check: /health                                │ │
│  │   │                                                        │ │
│  │   ├── 🔐 API Routes                                       │ │
│  │   │   ├─ POST /api/v1/auth/register                       │ │
│  │   │   ├─ POST /api/v1/auth/login                          │ │
│  │   │   ├─ POST /api/v1/rides/request                       │ │
│  │   │   ├─ GET  /api/v1/rides/{id}                          │ │
│  │   │   └─ Docs: /docs (Swagger UI)                         │ │
│  │   │                                                        │ │
│  │   ├── 🗄️ Database Session                                 │ │
│  │   │   └─ Connection Pool (10 + 20 overflow)               │ │
│  │   │                                                        │ │
│  │   └── 🛡️ Security Layer                                   │ │
│  │       ├─ JWT Token Validation                             │ │
│  │       ├─ Password Hashing (Bcrypt)                        │ │
│  │       ├─ CORS Middleware                                  │ │
│  │       └─ Rate Limiting                                    │ │
│  │                                                            │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           │                                      │
│                    (Database Network)                            │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │                                                            │ │
│  │   🗄️ PostgreSQL Database (Alpine Linux)                   │ │
│  │   ├─ Version: 16                                          │ │
│  │   ├─ Port: 5432                                           │ │
│  │   ├─ Health Check: pg_isready                             │ │
│  │   │                                                        │ │
│  │   ├── Tables                                              │ │
│  │   │   ├─ users                                            │ │
│  │   │   │  ├─ id, name, email, password, role, rating      │ │
│  │   │   │                                                    │ │
│  │   │   ├─ drivers                                          │ │
│  │   │   │  ├─ id, user_id (FK), online, balance            │ │
│  │   │   │                                                    │ │
│  │   │   └─ rides                                            │ │
│  │   │      ├─ id, passenger_id, driver_id, distance, price │ │
│  │   │                                                        │ │
│  │   └─ Persistence: Docker Volume (postgres_data)           │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer's Machine                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Edit Code                    Docker Compose              │
│   ↓                            ↓                             │
│   ├─ main.py             ┌─────────────────────────────┐   │
│   ├─ auth.py    ────────→│  Hot Reload (Uvicorn)      │   │
│   ├─ rides.py            │  ✅ Changes detected       │   │
│   │                       │  ✅ App restarted          │   │
│   │                       │  ✅ Browser refreshed      │   │
│   │                       └─────────────────────────────┘   │
│   │                                                          │
│   └──→ Test in Browser                                      │
│        http://localhost:8000/docs                           │
│        ↓                                                     │
│        Git Commit/Push                                      │
│        ↓                                                     │
│        GitHub Actions (CI/CD)                               │
│        ├─ Run Linting (Flake8)                              │
│        ├─ Type Check (Mypy)                                 │
│        ├─ Format Check (Black)                              │
│        ├─ Run Tests (Pytest)                                │
│        ├─ Build Docker Image                                │
│        └─ ✅ All pass → Ready to merge                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Production Deployment

```
┌──────────────────────────────────────────────────────────────────────┐
│              Production Server / Cloud Provider                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  💾 Git Repository (GitHub)                                          │
│  └─→ Main Branch                                                     │
│      ├─ Dockerfile                                                   │
│      ├─ docker-compose.prod.yml                                      │
│      └─ .env.prod (secrets)                                          │
│                                                                       │
│  🐳 Docker Registry                                                  │
│  ├─ Build & Push Image                                               │
│  └─ Version Tags: latest, v0.1.0, etc                                │
│                                                                       │
│  🚀 Orchestration (Docker Compose / Kubernetes)                      │
│  ├─ Pull Image from Registry                                         │
│  ├─ Start Containers                                                 │
│  │  ├─ NGINX (Port 443 SSL)                                          │
│  │  ├─ FastAPI (Internal 8000)                                       │
│  │  └─ PostgreSQL (Internal 5432)                                    │
│  ├─ Apply Health Checks                                              │
│  ├─ Setup Monitoring & Logging                                       │
│  └─ Auto-restart on Failure                                          │
│                                                                       │
│  🔐 SSL/TLS Certificates                                             │
│  ├─ From Let's Encrypt (automatic renewal)                           │
│  └─ NGINX terminates HTTPS                                           │
│                                                                       │
│  📊 Monitoring                                                       │
│  ├─ Container health checks every 30s                                │
│  ├─ Logs aggregation (JSON format)                                   │
│  ├─ Performance metrics                                              │
│  └─ Alert on failures                                                │
│                                                                       │
│  💾 Data Persistence                                                 │
│  └─ PostgreSQL Docker Volume                                         │
│     ├─ Automatic backups                                             │
│     └─ Point-in-time recovery                                        │
│                                                                       │
│  ✅ Result: Your API is available 24/7                               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### User Login Request
```
Client Browser
    │
    ├─→ HTTPS POST /api/v1/auth/login
    │   {email, password}
    │
    └─→ [Internet]
        │
        └─→ NGINX Reverse Proxy (Port 443)
            │
            ├─ Verify SSL Certificate ✅
            ├─ Check Rate Limit ✅
            ├─ Security Headers ✅
            │
            └─→ FastAPI Backend (Port 8000)
                │
                ├─ Parse Request ✅
                ├─ Validate Schema ✅
                ├─ Query Database
                │ 
                └─→ PostgreSQL (Port 5432)
                    │
                    └─ SELECT * FROM users WHERE email = ?
                        │
                        └─→ ✅ Found User
                            │
                            └─→ Verify Password ✅
                                │
                                ├─ Generate JWT Token
                                ├─ Return Token
                                │
                                └─→ Browser
                                    │
                                    └─ Store in Local Storage
                                        │
                                        └─ Use for next requests
```

---

## File Dependency Graph

```
ridejusto/
│
├─ Dockerfile ──────┐
├─ docker-compose.yml ─┤
├─ docker-compose.prod.yml ┤
└─ nginx.conf ──────┤
                    │
                    └─→ 🐳 Docker Image
                         │
                         ├─ Python:3.11-slim
                         ├─ requirements.txt
                         └─ backend/app/*
                             │
                             ├─ main.py
                             │   ├─ config.py
                             │   ├─ security.py
                             │   ├─ api/
                             │   │   ├─ auth.py
                             │   │   └─ rides.py
                             │   ├─ database/
                             │   │   └─ session.py
                             │   ├─ models/
                             │   │   ├─ user.py
                             │   │   ├─ driver.py
                             │   │   └─ ride.py
                             │   └─ schemas/
                             │       ├─ auth.py
                             │       └─ ride.py
                             │
                             └─→ PostgreSQL
                                 │
                                 ├─ users
                                 ├─ drivers
                                 └─ rides
```

---

## Security Layers

```
Level 1: Network Security (NGINX)
├─ SSL/TLS Encryption
├─ Firewall Rules
├─ Rate Limiting
├─ DDoS Protection
└─ Security Headers

Level 2: API Security
├─ CORS Middleware
├─ Request Validation
├─ JWT Token Verification
└─ Session Management

Level 3: Application Security
├─ Password Hashing (Bcrypt)
├─ Input Sanitization
├─ SQL Injection Prevention (SQLAlchemy ORM)
└─ Secure Error Handling

Level 4: Data Security
├─ Database User Permissions
├─ Connection Encryption
├─ Backup Encryption
└─ Access Logging
```

---

## Scaling Possibilities

```
Single Container (Current)
        ↓
    ┌───┴───┐
    │       │
    
Multiple Containers (Docker Swarm)
    │
    ├─ App Instance 1 ──┐
    ├─ App Instance 2 ──┼─→ Load Balancer → NGINX
    ├─ App Instance 3 ──┤
    └─ PostgreSQL       │
                       └─→ Shared Storage

Kubernetes Cluster
    │
    ├─ App Pod Replica 1 ──┐
    ├─ App Pod Replica 2 ──┼─→ Service → Ingress
    ├─ App Pod Replica 3 ──┤
    ├─ App Pod Replica N ──┘
    │
    ├─ PostgreSQL StatefulSet (with persistent volume)
    │
    └─ Horizontal Pod Autoscaler (scale based on CPU/Memory)
```

---

## Troubleshooting Decision Tree

```
🚨 Something is wrong!
│
├─ "Containers won't start"
│  └─ Run: make logs
│     └─ Read error message
│        └─ Fix issue and retry
│
├─ "Port 8000 already in use"
│  └─ Run: lsof -i :8000
│     └─ Kill process or change port
│
├─ "Database connection refused"
│  └─ Run: docker-compose ps
│     └─ Is 'db' container running?
│        ├─ NO → Run: make down && make up
│        └─ YES → Check logs: docker-compose logs db
│
├─ "API endpoint returns 500"
│  └─ Run: make logs
│     └─ Look for error in backend logs
│        └─ Check database connection
│
└─ "Forgot database password"
   └─ Edit .env file
      └─ Run: make down && docker-compose down -v
         └─ Run: make up (fresh database)
```

---

**Created:** March 25, 2026  
**Architecture Version:** 1.0  
**Status:** Production Ready
