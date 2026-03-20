# RealEstate-FullStack Backend

Django REST API backend with PostgreSQL, Redis, and Celery.

<!-- MAKE SURE YOU RUN THE DOCKER DEKSTOP FIRST -->

## How to Run

### Step 1: Start Docker Desktop

Open **Docker Desktop** application and wait for it to fully start (green icon in system tray).

Verify Docker is running:
```bash
docker ps
```

---

### Step 2: Clone the repository

```bash
git clone <your-repo-url>
cd RealEstate-FullStack/back
```

---
    
### Step 3: Start all services

```bash
docker compose up -d
```

Wait 15-20 seconds for all services to start.

---

### Step 4: Check services are running

```bash
docker compose ps
```

You should see 4 services: django, celery, redis, pgdb

---

### Step 5: Run migrations

```bash
docker compose exec django python manage.py migrate
```

---

### Step 6: Create admin user

```bash
docker compose exec django python manage.py createsuperuser
```

Enter username, email, and password when prompted.

---

### Step 7: Open your browser

- **API:** http://localhost:8000
- **Admin:** http://localhost:8000/admin

---

## Common Commands

```bash
# Stop services
docker compose down

# View logs
docker compose logs -f

# Run migrations
docker compose exec django python manage.py migrate

# Create superuser
docker compose exec django python manage.py createsuperuser

# Access Django shell
docker compose exec django python manage.py shell
```

---

## Services

| Service | Access |
|---------|--------|
| Django API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | Internal only |

---

## Project Structure

```
back/
├── core/              # Django settings, Celery config
├── listings/          # Listings app
├── tours/             # Tours app
├── deals/             # Deals app
├── docker-compose.yml # Docker services
├── Dockerfile         # Build config
└── requirements.txt   # Dependencies
```

---

## Tech Stack

- Django 5.2
- Django REST Framework
- PostgreSQL
- Redis + Celery
- JWT Authentication
