# Mini Investment Platform - Grip Invest Winter Internship 2025

## Overview

This is a full-stack Mini Investment Platform built as part of the Grip Invest Winter Internship 2025.
The platform allows users to:

* Sign up / log in with JWT-based authentication
* Browse and invest in predefined investment products (bonds, mutual funds, FDs, ETFs, etc.)
* View portfolio with dynamic charts and AI-generated insights
* Track all transactions with detailed logs
* Admins can manage products (create, update, delete)

The project integrates AI to provide:

* Password strength suggestions
* Auto-generated product descriptions
* Personalized product recommendations
* Portfolio risk insights
* Error summarization in transaction logs

---

## Tech Stack

**Backend:** Node.js, Express, MySQL, JWT authentication, AI integrations
**Frontend:** React.js/Next.js, TailwindCSS, Material UI, Recharts/Chart.js
**DevOps:** Docker, docker-compose, health checks
**Testing:** Jest (unit tests for backend and frontend with ≥75% coverage)

---

## Project Structure

```
├── backend/                # Node.js backend
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   ├── .env               # Local development environment variables (do NOT push)
│   ├── .env.docker        # Docker environment variables (do NOT push)
│   └── ...
├── frontend/               # React/Next.js frontend
│   ├── components/
│   ├── pages/
│   ├── .env               # Frontend environment variables (do NOT push)
│   └── ...
├── docker-compose.yml      # Local container orchestration
├── gripinvest_postman_collection.json
├── README.md
└── .gitignore
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yashh2234/gripinvest_winter_internship_backend.git
cd gripinvest_winter_internship_backend
```

### 2. Backend Setup

* Install dependencies:

```bash
cd backend
npm install
```

* Create `.env` with your local credentials (do **not** push this file to GitHub):

```
PORT=5000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=investment_db
GEMINI_API_KEY=your-gemini-api-key
GMAIL_USER=your-email
GMAIL_APP_PASS=your-app-password
```

* For Docker, use `.env.docker` (service name `mysql` instead of `localhost` for DB):

```
PORT=5000
JWT_SECRET=your-secret-key
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=investment_db
GEMINI_API_KEY=your-gemini-api-key
GMAIL_USER=your-email
GMAIL_APP_PASS=your-app-password
```

* Run backend (locally or via Docker):

```bash
npm run dev
```

### 3. Frontend Setup

* Install dependencies:

```bash
cd frontend
npm install
```

* Update `.env`:

```
VITE_API_BASE_URL=http://localhost:5000
```

* Run frontend:

```bash
npm run dev
```

### 4. Docker Setup

Run all services (backend + frontend + MySQL) using Docker:

```bash
docker-compose up --build
```

---

## Database

**Predefined Tables:**

* `users`
* `investment_products`
* `investments`
* `transaction_logs`

Seed data is included in `backend/db/init.sql`.

---

## API Documentation

All APIs are included in the Postman collection: `gripinvest_postman_collection.json`.
Key APIs:

* `POST /auth/signup` – user signup
* `POST /auth/login` – user login
* `GET /products` – fetch investment products
* `POST /investments` – make an investment
* `GET /transactions` – view transaction logs

---

## Features & AI Integrations

1. **Password Strength Suggestions** – AI analyzes password on signup.
2. **Auto Product Descriptions** – AI generates readable descriptions from structured fields.
3. **Personalized Recommendations** – AI recommends products based on user risk appetite and returns.
4. **Portfolio Insights** – AI generates charts & risk distribution insights.
5. **Error Summarization** – AI summarizes errors per user from transaction logs.

---

## Testing

* Backend and frontend unit tests using Jest and React Testing Library.
* Minimum 75% code coverage.

Run backend tests:

```bash
cd backend
npm run test
```

Run frontend tests:

```bash
cd frontend
npm run test
```

---

## Submission

* GitHub repo: [https://github.com/yashh2234/gripinvest\_winter\_internship\_backend](https://github.com/yashh2234/gripinvest_winter_internship_backend)
* Postman collection: `GripInvest_Collection.json`
* Postman environment: `GripInvest_Environment.json`
* SQL seed file: `backend/db/init.sql`
