# React + FastAPI Fullstack Demo

A modern fullstack application with React (TypeScript) frontend and FastAPI backend using PostgreSQL.

## Architecture

```
react-fastapi/
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript interfaces
│   │   └── App.tsx        # Main app component
│   └── package.json
└── backend/           # FastAPI Python app
    ├── main.py            # FastAPI application
    ├── models.py          # SQLAlchemy models
    ├── schemas.py         # Pydantic schemas
    ├── database.py        # Database configuration
    └── requirements.txt
```

## Features

- **Frontend**: React with TypeScript, Tailwind CSS, Axios for API calls
- **Backend**: FastAPI with SQLAlchemy, PostgreSQL, CORS enabled
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Full CRUD**: Create, Read, Update, Delete operations
- **Real-time status**: Backend connection status indicator

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 12+

### Database Setup

1. Install PostgreSQL if not already installed:
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. Create database and user:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE react_fastapi_db;
   CREATE USER appuser WITH PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE react_fastapi_db TO appuser;
   \q
   ```

3. Set environment variable (optional):
   ```bash
   # Create .env file in backend/ directory
   echo "DATABASE_URL=postgresql://appuser:password123@localhost/react_fastapi_db" > backend/.env
   ```

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   # Default database URL will be used if .env not present
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at http://localhost:8000
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The React app will be available at http://localhost:3000

## API Endpoints

- `GET /` - Health check
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/{id}` - Get item by ID
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

## Database Schema

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. The app will show backend connection status
4. Add, edit, and delete items using the UI
5. All data is persisted in PostgreSQL

## Troubleshooting

### Database Connection Issues

If you see "Backend not connected" error:

1. Ensure PostgreSQL is running
2. Verify database exists and credentials are correct
3. Check the DATABASE_URL in backend/.env or database.py
4. Look at backend terminal for detailed error messages

### Common Database URLs

- **Local PostgreSQL**: `postgresql://username:password@localhost/dbname`
- **Docker PostgreSQL**: `postgresql://username:password@localhost:5432/dbname`
- **Heroku**: Use the DATABASE_URL provided by Heroku

### Backend Issues

- Port 8000 already in use: Change port with `uvicorn main:app --port 8001`
- Import errors: Ensure you're in the backend directory and venv is activated

### Frontend Issues

- Port 3000 already in use: React will prompt to use another port
- API connection errors: Verify backend is running on http://localhost:8000

## Technology Stack

- **Frontend**: React 18, TypeScript 4.9, Tailwind CSS 3.3, Axios
- **Backend**: FastAPI 0.104, SQLAlchemy 2.0, Pydantic 2.5
- **Database**: PostgreSQL 12+
- **Development**: Hot reloading enabled for both frontend and backend