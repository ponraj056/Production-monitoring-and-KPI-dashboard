# ⚙️ Production Monitoring & KPI Dashboard

A full-stack web application built for the **Manufacturing** domain to monitor machine production data in real time and visualize key performance indicators (KPIs) such as OEE, downtime %, defect rate, and throughput on an interactive dashboard.


---

## 📋 Problem Statement

Manufacturing industries often lack real-time visibility into machine performance, production output, and operational efficiency. This project addresses that gap by monitoring production data (output, defects, downtime) across machines and visualizing key performance indicators through a live dashboard — enabling supervisors to make faster, data-driven decisions on the shop floor.

---

## 🏗️ Project Structure

This repository is a **monorepo** containing both the frontend and backend as separate, independently runnable projects:

```
Production-monitoring-and-KPI-dashboard/
├── frontend/     → React (Vite) dashboard application
├── backend/      → Node.js + Express REST API
├── LICENSE
└── README.md     → you are here
```

Each folder has its own dedicated README with setup instructions specific to that part of the stack:
- [`frontend/README.md`](./frontend/README.md)
- [`backend/README.md`](./backend/README.md)

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, React Router DOM, Recharts, Axios |
| **Backend** | Node.js, Express.js, JWT |
| **Database** | PostgreSQL |
| **Dev Tools** | Git & GitHub, VS Code, Postman, pgAdmin, ESLint |

---

## ✨ Features

- 🔐 **Advanced Authentication** — JWT-based login, Role-Based Access Control (Admin, Supervisor, Operator), OTP Email Verification, Admin Approval workflow, and Secure Password Resets.
- 📊 **Real-Time KPI Dashboard** — Live calculation cards for OEE (Overall Equipment Effectiveness), Downtime %, Defect Rate, and Throughput.
- ⚡ **Live Data Simulation** — Integrated Node.js background simulator generating realistic production and downtime logs, streamed instantly to the UI via **Socket.io**.
- 🏭 **Machine Detail Pages** — Dedicated drill-down dashboards for individual machines, featuring localized KPIs and historical timelines.
- 📅 **Dynamic Date Filtering** — Instantly filter all global and machine-specific metrics by *Today*, *Last 7 Days*, *Last 30 Days*, or *All Time*.
- 🔧 **Maintenance Scheduling** — Supervisors can schedule, track, and mark preventative maintenance tasks as completed.
- 📈 **Production Trend Charts** — Visualizes produced units vs. defects over shifts using Recharts.
- 📄 **Reports Export** — Generate and download CSV reports of production data across custom date ranges.
- 🌙 **Industrial UI & 3D Graphics** — "Control Room" aesthetic (Dark/Light mode toggle), modern Toast Notifications, and an interactive 3D factory model using React Three Fiber.

---

## 🚀 Getting Started

Clone the repository:
```bash
git clone https://github.com/ponraj056/Production-monitoring-and-KPI-dashboard.git
cd Production-monitoring-and-KPI-dashboard
```

Then set up each part separately — see their individual READMEs:
1. [Set up the backend](./backend/README.md)
2. [Set up the frontend](./frontend/README.md)

---

## 👥 Team

| Member | Role |
|---|---|
| Person A | Backend Development (Node.js, Express, PostgreSQL) |
| Person B | Frontend Development (React, UI/UX, Dashboard) |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).