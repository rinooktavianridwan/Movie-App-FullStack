# Frontend Quick Start Guide

This is the React + Vite frontend for the Movie-App cinema application. It handles the user-facing booking flow, admin interface, promo display, ticket history, and other customer interactions.

## Quick Links

- Project root: [../README.md](../README.md)
- Backend guide: [../movie-app-backend-go/README.md](../movie-app-backend-go/README.md)

## Prerequisites

- Node.js 18 or newer
- npm
- Running backend service on localhost:8080

## Installation

```bash
cd movie-app-frontend-react
npm install
```

## Running the App

### Development mode

```bash
npm run dev
```

The app will run at:

- http://localhost:5173

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Main Features

- movie browsing and details
- schedule and showtime display
- seat booking flow
- promo usage and validation
- My Tickets panel
- transaction and payment flow
- protected routes for authenticated users

## Project Structure

```bash
movie-app-frontend-react/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── nginx.conf
└── README.md
```

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Backend Connection

Make sure the backend is running before using booking features. Default backend API URL is usually:

```text
http://localhost:8080
```

If the backend is changed, update the API base configuration in the frontend service layer.

## Troubleshooting

### App not loading
- ensure dependencies are installed with `npm install`
- check whether the frontend dev server started correctly on port 5173

### API errors
- confirm the backend is running
- verify CORS and backend URL settings
- check browser developer tools for request failures

### Build fails
- run `npm run build` to inspect the exact error output
- ensure there are no missing imports or invalid React code

## Notes

This frontend is designed to work as a paired system with the Go backend in this repository. For the full app flow, use the main project documentation alongside the backend guide.
