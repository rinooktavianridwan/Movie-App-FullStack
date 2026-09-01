# Backend Quick Start Guide

This is the backend service for the Movie-App cinema platform. It provides the REST API for authentication, movies, schedules, promos, tickets, transactions, and admin management.

## Quick Links

- Project root: [../README.md](../README.md)
- Frontend guide: [../movie-app-frontend-react/README.md](../movie-app-frontend-react/README.md)

## Prerequisites

- Go 1.22 or newer
- PostgreSQL
- Redis
- A configured `.env` file

## Project Structure

```bash
movie-app-backend-go/
├── cmd/
│   └── main.go
├── database/
│   ├── config.go
│   ├── migrate.go
│   ├── migrations/
│   └── seed/
├── internal/
│   ├── middleware/
│   ├── modules/
│   ├── models/
│   ├── jobs/
│   └── utils/
├── .env.example
├── Dockerfile
├── docker-compose.yaml
├── go.mod
└── README.md
```

## Installation

```bash
cd movie-app-backend-go
go mod tidy
```

## Environment Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

The important variables are:

```env
PORT=8080
BASE_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:5173
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=movie_db
JWT_SECRET=your-secret-key
REDIS_ADDR=localhost:6379
```

## Running the Backend

### Development mode

```bash
go run cmd/main.go
```

### Using Docker

From the project root:

```bash
cd ..
docker compose up --build
```

The API will be available at:

- http://localhost:8080

## Database Setup

If migrations are not yet applied, run the project database initialization flow provided by the app. The app includes migration and seeder logic to bootstrap core data and actors.

## Main Features

### Authentication and authorization
- login and registration flow
- JWT-based protected routes
- role-based permission handling

### Cinema domain logic
- movies and genres
- studios and facilities
- schedules and conflict validation
- transactions and tickets
- promos and promo usage tracking

### Business logic included
- no overlapping schedules for the same studio
- seat reservation validation
- ticket validation for studio entry
- user-level access control

## Common Commands

```bash
go test ./...
go run cmd/main.go
```

## Troubleshooting

### Database connection error
- confirm PostgreSQL is running
- check `.env` values for host, username, and password
- make sure the database exists

### Redis connection error
- ensure Redis is started
- verify `REDIS_ADDR` is correct

### CORS or frontend issues
- set `CORS_ORIGIN` to the frontend URL, usually `http://localhost:5173`

## Notes

The backend is designed to work together with the React frontend in this repository. For the end-to-end app flow, use the project root instructions and the frontend guide as the main developer reference.
