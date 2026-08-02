# Frontend — Production Monitoring & KPI Dashboard

This is the **frontend** of the [Production Monitoring & KPI Dashboard](https://github.com/ponraj056/Production-monitoring-and-KPI-dashboard) project — a React-based single-page application that displays real-time production KPIs, machine status, and production trends for a manufacturing monitoring system.

> For the full project overview (backend, database, architecture), see the [root README](../README.md).

---

## 🧰 Tech Stack

- **React.js** (v19) — UI library
- **Vite** — build tool & dev server
- **React Router DOM** (v6) — client-side routing
- **Recharts** — charts and data visualization
- **Axios** — HTTP client for backend API calls
- **CSS3** (custom) — dark "control room" themed styling

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx           → Login page with auth flow
│   │   ├── KPICards.jsx        → OEE / Downtime / Defect Rate / Throughput cards
│   │   ├── ProductionChart.jsx → Production trend line chart (Recharts)
│   │   ├── MachineForm.jsx     → Form to register a new machine
│   │   └── MachineList.jsx     → Table listing all machines with status
│   ├── App.jsx                 → Routing + top-level state management
│   ├── App.css                 → Dark mode dashboard styling
│   └── main.jsx                → React app entry point
├── public/
├── package.json
└── vite.config.js
```

---

## ✨ Features Implemented

- 🔐 Login page with protected route to `/dashboard`
- 📊 KPI summary cards (OEE, Downtime %, Defect Rate, Throughput)
- 📈 Production trend chart (Produced vs Defects across shifts)
- ➕ Add Machine form with live table update
- 🎨 Dark, "control room" themed UI with status badges (running / idle / down)

> **Note:** The dashboard currently runs on mock/sample data. Integration with the live backend API is in progress — see [Connecting to the Backend](#-connecting-to-the-backend) below.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Run the development server
```bash
npm run dev
```

The app will be available at:
```
http://localhost:5173
```

### 3. Login (mock credentials, for now)
```
Email:    admin@test.com
Password: 1234
```

---

## 🔌 Connecting to the Backend

By default, the dashboard uses hardcoded mock data (`useState` in `App.jsx`) so the UI can be built and tested independently of the backend.

To connect to the real backend API:
1. Ensure the backend server is running (see [`backend/README.md`](../backend/README.md))
2. Replace the mock `useState` data in `App.jsx` with `axios` calls to the backend's REST endpoints (e.g. `/api/machines`, `/api/production-logs`)
3. Update the login logic in `Login.jsx` to call the real `/api/login` endpoint instead of the hardcoded check

---

## 🛠️ Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).