# Movie-App Full Stack

A full-stack cinema booking application built with Go backend and React frontend. This project covers a complete booking flow from movie browsing, seat selection, promo usage, transaction creation, ticket validation, and admin management.

## Quick Links

- Backend guide: [movie-app-backend-go/README.md](movie-app-backend-go/README.md)
- Frontend guide: [movie-app-frontend-react/README.md](movie-app-frontend-react/README.md)
- Docker config: [docker-compose.yaml](docker-compose.yaml)

## Prerequisites

Before running the app, make sure you have:

- Docker and Docker Compose
- Go 1.22 or newer
- Node.js 18 or newer
- npm
- PostgreSQL (if running locally without Docker)
- Redis (if running locally without Docker)

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Go
- Gin
- GORM
- PostgreSQL
- JWT authentication
- Redis for async/payment-related jobs

### Infrastructure
- Docker Compose
- Nginx
- Database migrations

## Project Structure

```bash
.
├── movie-app-backend-go/
│   ├── cmd/
│   ├── database/
│   ├── internal/
│   ├── Dockerfile
│   ├── go.mod
│   └── README.md
├── movie-app-frontend-react/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── docker-compose.yaml
├── docker-compose.prod.yml
├── README.md
└── .gitignore
```

## Run with Docker (Recommended)

This is the easiest way to run the whole application.

```bash
cd Movie-App
docker compose up --build
```

### Access URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Run Manually

### Backend

```bash
cd movie-app-backend-go
cp .env.example .env
# configure your database and JWT settings in .env
 go mod tidy
 go run cmd/main.go
```

### Frontend

```bash
cd movie-app-frontend-react
npm install
npm run dev
```

Front-end dev server usually runs at:

- http://localhost:5173

## Environment Setup

Backend environment variables are defined in [movie-app-backend-go/.env.example](movie-app-backend-go/.env.example). The main variables include:

- `PORT`
- `BASE_URL`
- `CORS_ORIGIN`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `JWT_SECRET`
- `SEEDER_EMAIL`
- `SEEDER_PASSWORD`
- `REDIS_ADDR`
- `TMDB_READ_ACCESS_TOKEN`

## Core Features

### Customer Flow
- Browse movies and details
- View available schedules and showtimes
- Choose seats and create booking
- Apply promo codes
- View booking history and my tickets
- Validate ticket usage at the studio

### Admin Flow
- Manage movies, genres, studios, and facilities
- Manage promos and schedules
- Prevent overlapping schedules in the same studio
- Monitor booking and ticket activity

### Business Rules
- Same studio cannot have overlapping schedules on the same date
- Seat booking avoids duplicate reservations
- Ticket status is tracked through active, pending, used, and cancelled states
- User and admin actions are protected with authentication and role checks

## Development Notes

The app is structured as a clean full-stack architecture:

```text
React Frontend -> Gin API -> Business Services -> PostgreSQL
                           |
                           +-> Redis jobs / async flow
```

This separation makes the project easier to explain during portfolio reviews and interviews because it reflects real-world product flows rather than a static frontend-only demo.

## Troubleshooting

### Backend not starting
- Check whether PostgreSQL and Redis are running
- Ensure `.env` is configured correctly
- Run `go mod tidy` if dependencies are missing

### Frontend not starting
- Run `npm install` first
- Check whether another service is already using port 5173
- Use `npm run build` to confirm the app compiles successfully

### Docker issues
- Run `docker compose down -v` to reset volumes if needed
- Check logs with `docker compose logs -f`

## Future Improvements

Possible improvements for the project include:

- QR code ticket generation
- real payment gateway integration
- cancellation and refund flow
- email notifications
- admin analytics dashboard
- VIP or premium seat layouts

## Project Status

The project is already functional as a portfolio-ready full-stack cinema booking system with working booking, promotion, validation, and admin logic.

---

For more detailed setup and implementation notes, please refer to:

- [movie-app-backend-go/README.md](movie-app-backend-go/README.md)
- [movie-app-frontend-react/README.md](movie-app-frontend-react/README.md)
