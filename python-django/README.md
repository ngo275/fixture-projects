# Django REST API with PostgreSQL

A Django REST Framework application for managing blog posts with a full API and admin interface, using PostgreSQL database.

## Prerequisites

- Python 3.8+
- pip (Python package installer)
- PostgreSQL 12+ installed and running

## Setup Instructions

### 1. Install and Start PostgreSQL

#### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
Download and install from https://www.postgresql.org/download/windows/

### 2. Set up PostgreSQL Database

#### Option A: Using the provided SQL script (Recommended)
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Or on macOS:
psql postgres

# Run the setup script
\i setup_database.sql

# Exit PostgreSQL
\q
```

#### Option B: Manual setup
```bash
# Connect to PostgreSQL
sudo -u postgres psql  # Linux
# or
psql postgres  # macOS

# Create database and user
CREATE DATABASE django_blog_db;
CREATE USER django_user WITH PASSWORD 'django_password';
ALTER ROLE django_user SET client_encoding TO 'utf8';
ALTER ROLE django_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE django_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE django_blog_db TO django_user;

# Connect to the database and grant schema privileges
\c django_blog_db;
GRANT ALL ON SCHEMA public TO django_user;
\q
```

### 3. Create your .env file
Create a `.env` file in `python-django/` (same folder as this README) using this template:

```ini
# Database Configuration
DB_NAME=django_blog_db
DB_USER=django_user
DB_PASSWORD=django_password
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
```

You can also copy and edit an example file if available:
```bash
cp .env.example .env  # if the example file exists
```

### 4. Navigate to the project directory
```bash
cd python-django
```

### 5. Create a virtual environment (recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 6. Install dependencies
```bash
pip install -r requirements.txt
```

### 7. Set up the database using .env
Run the helper script to create the PostgreSQL database and user from your `.env` values. Ensure PostgreSQL is running first.

```bash
# From python-django/
bash scripts/setup_db_from_env.sh
```

Notes:
- If your PostgreSQL superuser is not `postgres`, set `PGSUPERUSER` when running the script, e.g. `PGSUPERUSER=$(whoami) bash scripts/setup_db_from_env.sh` on Homebrew macOS setups.
- The script is idempotent: it creates the role/db if missing and aligns the user's password with `.env`.

### 8. Navigate to Django project
```bash
cd myproject
```

### 9. Run database migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 10. Create a superuser (for admin access)
```bash
python manage.py createsuperuser
```
Follow the prompts to create an admin user.

### 11. Load sample data (optional)
```bash
python manage.py shell
```

In the Django shell, run:
```python
from myapp.models import Post

# Create sample posts
Post.objects.create(
    title="Welcome to Django REST API",
    content="This is a sample blog post created with Django REST Framework.",
    author="Django Admin"
)

Post.objects.create(
    title="Getting Started with APIs",
    content="Learn how to build powerful APIs using Django REST Framework.",
    author="API Developer"
)

Post.objects.create(
    title="Database Models in Django",
    content="Understanding how to create and work with Django models.",
    author="Django Expert"
)

print(f"Created {Post.objects.count()} posts")
exit()
```

### 12. Start the development server
```bash
python manage.py runserver
```

The application will be available at:
- **API Root**: http://127.0.0.1:8000/
- **Admin Interface**: http://127.0.0.1:8000/admin/
- **API Endpoints**: http://127.0.0.1:8000/api/

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API overview |
| GET | `/api/` | API root with available endpoints |
| GET | `/api/posts/` | List all posts |
| POST | `/api/posts/` | Create a new post |
| GET | `/api/posts/{id}/` | Get specific post |
| PUT | `/api/posts/{id}/` | Update post (full) |
| PATCH | `/api/posts/{id}/` | Update post (partial) |
| DELETE | `/api/posts/{id}/` | Delete post |

## Example API Requests

### Get all posts
```bash
curl http://127.0.0.1:8000/api/posts/
```

### Create a new post
```bash
curl -X POST http://127.0.0.1:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Post",
    "content": "This is the content of my new blog post.",
    "author": "John Doe"
  }'
```

### Get a specific post
```bash
curl http://127.0.0.1:8000/api/posts/1/
```

### Update a post
```bash
curl -X PATCH http://127.0.0.1:8000/api/posts/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Post Title"
  }'
```

### Delete a post
```bash
curl -X DELETE http://127.0.0.1:8000/api/posts/1/
```

## Admin Interface

1. Go to http://127.0.0.1:8000/admin/
2. Log in with the superuser credentials you created
3. You can manage posts through the web interface

## Project Structure

```
python-django/
├── requirements.txt
├── myproject/
│   ├── manage.py
│   ├── myproject/
│   │   ├── __init__.py
│   │   ├── settings.py      # Django settings
│   │   ├── urls.py          # Main URL configuration
│   │   └── wsgi.py          # WSGI configuration
│   └── myapp/
│       ├── __init__.py
│       ├── admin.py         # Admin interface config
│       ├── apps.py          # App configuration
│       ├── models.py        # Database models
│       ├── serializers.py   # DRF serializers
│       ├── tests.py         # Unit tests
│       ├── urls.py          # App URL patterns
│       ├── views.py         # API views
│       └── migrations/      # Database migrations
```

## Database Schema

```python
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Features

- **Django REST Framework**: Full-featured API framework
- **Admin Interface**: Web-based admin for managing data
- **CORS Support**: Cross-origin resource sharing enabled
- **Database Migrations**: Automated database schema management
- **Unit Tests**: Test cases for API endpoints
- **ModelViewSet**: Full CRUD operations
- **Automatic API Documentation**: Browsable API interface

## Common Django Commands

```bash
# Database operations
python manage.py makemigrations    # Create migration files
python manage.py migrate           # Apply migrations
python manage.py showmigrations    # Show migration status

# Server
python manage.py runserver         # Start development server
python manage.py runserver 8080    # Start on different port

# Admin
python manage.py createsuperuser   # Create admin user
python manage.py changepassword    # Change user password

# Shell and utilities
python manage.py shell             # Django shell
python manage.py collectstatic     # Collect static files
python manage.py test              # Run tests

# Check project
python manage.py check             # Check for errors
```

## Testing

Run the test suite:
```bash
python manage.py test
```

Run specific tests:
```bash
python manage.py test myapp.tests.PostAPITestCase
```

## Troubleshooting

### Python Version Issues
```bash
python --version  # Check Python version
python3 --version # Try python3 if python doesn't work
```

### Virtual Environment Issues
```bash
# Deactivate current environment
deactivate

# Remove and recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database Issues
```bash
# Reset database (PostgreSQL)
# Connect to PostgreSQL and drop/recreate database
sudo -u postgres psql
DROP DATABASE django_blog_db;
CREATE DATABASE django_blog_db;
GRANT ALL PRIVILEGES ON DATABASE django_blog_db TO django_user;
\c django_blog_db;
GRANT ALL ON SCHEMA public TO django_user;
\q

# Then run migrations again
python manage.py migrate
python manage.py createsuperuser
```

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Start PostgreSQL if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Test database connection
psql -h localhost -U django_user -d django_blog_db
```

### psycopg2 Installation Issues
```bash
# If psycopg2-binary fails to install, try:
pip install psycopg2-binary --no-cache-dir

# Or install system dependencies first:
# Ubuntu/Debian:
sudo apt-get install python3-dev libpq-dev

# macOS:
brew install postgresql
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -ti :8000

# Kill the process
kill -9 $(lsof -ti :8000)

# Or start on different port
python manage.py runserver 8080
```

## Technology Stack

- **Python**: 3.8+
- **Django**: 5.0.0
- **Django REST Framework**: 3.14.0
- **Database**: PostgreSQL 12+
- **Database Driver**: psycopg2-binary
- **CORS**: django-cors-headers for cross-origin support

## API Browser

Django REST Framework provides a browsable API interface. Visit any API endpoint in your browser to see the interactive interface with forms for testing API operations.