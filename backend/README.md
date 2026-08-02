# Production Monitoring & KPI Dashboard — Backend

Backend API for a manufacturing Production Monitoring & KPI Dashboard, built for a college IT hackathon project.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **DB Client:** `pg` (node-postgres) with connection pooling
- **Auth (planned):** JWT
- **Real-time (planned):** Socket.io
- **Dev tooling:** nodemon

## Project Structure

```
backend/
├── config/
│   └── db.js              # PostgreSQL connection pool
├── controllers/
│   ├── machineController.js
│   ├── productionLogController.js
│   └── downtimeLogController.js
├── middleware/
│   └── errorHandler.js    # Centralized error handler
├── routes/
│   ├── machineRoutes.js
│   ├── productionLogRoutes.js
│   └── downtimeLogRoutes.js
├── .env                    # Local environment variables (not committed)
├── .env.example             # Template for required env vars
├── .gitignore
├── package.json
└── server.js                # App entry point
```

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v14+) installed and running locally
- npm

## Setup

1. **Clone the repo and navigate to the backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your `.env` file**

   Copy `.env.example` to `.env` and fill in your actual PostgreSQL credentials:
   ```
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=production_monitor
   DB_PASSWORD=your_password_here
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Create the PostgreSQL database and tables**

   Using `psql` or pgAdmin, create the database:
   ```sql
   CREATE DATABASE production_monitor;
   ```

   Then run the schema (see `schema.sql` if present, or create manually):
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(50) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     role VARCHAR(20) DEFAULT 'operator',
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE machines (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     status VARCHAR(20) DEFAULT 'idle',
     line_id VARCHAR(50),
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE production_logs (
     id SERIAL PRIMARY KEY,
     machine_id INTEGER REFERENCES machines(id),
     units_produced INTEGER DEFAULT 0,
     defective_units INTEGER DEFAULT 0,
     shift VARCHAR(20),
     logged_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE downtime_logs (
     id SERIAL PRIMARY KEY,
     machine_id INTEGER REFERENCES machines(id),
     reason VARCHAR(100),
     downtime_minutes INTEGER,
     logged_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Run the server**
   ```bash
   npm run dev
   ```
   This starts the server with nodemon (auto-restarts on file changes) at `http://localhost:5000`.

   For production-style run:
   ```bash
   npm start
   ```

## Verifying the Setup

- Open `http://localhost:5000` in a browser or Postman — you should see:
  ```json
  { "message": "Production Monitoring API is running" }
  ```
- Server console should log:
  ```
  Server running on http://localhost:5000
  Connected to PostgreSQL database
  ```

## API Endpoints

### Machines — `/api/machines`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/machines` | Get all machines |
| GET | `/api/machines/:id` | Get a single machine by ID |
| POST | `/api/machines` | Create a new machine |
| PUT | `/api/machines/:id` | Update a machine |
| DELETE | `/api/machines/:id` | Delete a machine |

**POST/PUT body example:**
```json
{
  "name": "CNC Machine 1",
  "status": "running",
  "line_id": "Line-A"
}
```

### Production Logs — `/api/production-logs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/production-logs` | Get all production logs |
| GET | `/api/production-logs/:id` | Get a single log by ID |
| POST | `/api/production-logs` | Create a new production log |
| PUT | `/api/production-logs/:id` | Update a production log |
| DELETE | `/api/production-logs/:id` | Delete a production log |

**POST/PUT body example:**
```json
{
  "machine_id": 1,
  "units_produced": 150,
  "defective_units": 5,
  "shift": "Morning"
}
```
> Note: `machine_id` must reference an existing row in the `machines` table (foreign key constraint).

### Downtime Logs — `/api/downtime-logs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/downtime-logs` | Get all downtime logs |
| GET | `/api/downtime-logs/:id` | Get a single downtime log by ID |
| POST | `/api/downtime-logs` | Create a new downtime log |
| PUT | `/api/downtime-logs/:id` | Update a downtime log |
| DELETE | `/api/downtime-logs/:id` | Delete a downtime log |

**POST/PUT body example:**
```json
{
  "machine_id": 1,
  "reason": "Material shortage",
  "downtime_minutes": 30
}
```

## Planned / Upcoming Work

- [ ] KPI calculation endpoints (OEE, downtime %, defect rate)
- [ ] JWT-based authentication and role-based access (admin/operator)
- [ ] Socket.io integration for real-time dashboard updates
- [ ] Input validation middleware
- [ ] Alert thresholds for downtime/defect rate

## Notes for the Frontend Team

- Base URL: `http://localhost:5000/api`
- All responses are JSON
- CORS is enabled for all origins during development
- Error responses follow the format:
  ```json
  { "error": "Description of what went wrong" }
  ```
- Successful DELETE responses follow the format:
  ```json
  { "message": "Machine deleted", "deleted": { ...deleted row... } }
  ```
