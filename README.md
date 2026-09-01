# Movie-App Cinema

Movie-App Cinema is a full-stack movie booking platform built as a portfolio project. It simulates a real-world cinema ecosystem with user booking flows, schedule management, promo handling, and ticket validation across a modern React frontend and Go backend.

## Why this project exists

This project was designed to showcase a complete end-to-end product flow for a digital cinema business, not just a static landing page. It demonstrates how a real booking application handles business logic, authorization, data consistency, and user experience across multiple layers.

## Project value for portfolio

This project covers the kind of workflows commonly expected in full-stack product work:

- customer-facing booking flow
- protected authentication flows
- admin CRUD management
- business rule validation
- relational database modeling
- API and UI integration
- real-world operational concepts such as schedule conflict prevention and ticket validation

## Core features

### Customer features
- Browse featured movies and movie details
- Check upcoming schedules and showtimes
- Select available seats for a movie
- Create transactions with promo code support
- View booking history and My Tickets page
- Validate active tickets at the studio gate

### Admin features
- Manage movies
- Manage genres
- Manage studios and facilities
- Manage promos
- Create and update schedules
- Prevent studio timetable conflicts

### Business logic included
- No overlapping schedules in the same studio on the same date
- Seat reservation logic to avoid duplicate bookings
- Ticket status flow such as active, pending, used, and cancelled
- Protected routes for authenticated users and admin access

## Tech stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React

### Backend
- Go
- Gin Web Framework
- GORM ORM
- PostgreSQL
- JWT-based authentication

### Infrastructure
- Docker Compose
- Nginx
- Database migrations

## Architecture overview

```text
Frontend (React + Vite)
        |
        v
API Layer (Go + Gin)
        |
        v
Business Logic / Services
        |
        v
PostgreSQL Database
```

The system is separated into clear responsibilities:

- frontend handles user interaction and presentation
- backend exposes REST API endpoints
- service layer handles business rules and validation
- database stores schedules, users, tickets, promos, and transactions

## Folder structure

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

## How to run

### 1. Clone the project

```bash
git clone https://github.com/rinooktavianridwan/Movie-App-FullStack.git
cd Movie-App-FullStack
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

### 3. Run backend manually

```bash
cd movie-app-backend-go
go mod tidy
go run cmd/main.go
```

### 4. Run frontend manually

```bash
cd movie-app-frontend-react
npm install
npm run dev
```

## Validation and business rules implemented

This project includes a few practical application rules that make it closer to real production software:

- same studio cannot have overlapping schedules on the same date
- seat numbers cannot be booked twice for the same showtime
- inactive or cancelled tickets cannot be validated for entry
- user actions are protected by authentication and role-based routes

## Key project highlights

- Full-stack architecture using React + Go
- Production-style feature flow from browse to booking to validation
- Admin panel for managing cinema content and schedules
- Ticket flow built with status tracking for real usage scenarios
- Portfolio-friendly and easy to explain in interviews

## Future improvements

Potential next steps for this project include:

- QR code ticket generation
- payment gateway integration
- refund and cancellation flow
- email and notification automation
- analytics dashboard for admins
- VIP and premium seat layouts

## Project status

The project is functional and ready to be presented as a portfolio-grade full-stack application with working cinema booking workflows.
