# Red Hill Infra • Premier Real Estate CRM

A modern, high-performance real estate developer CRM organized into separated **Frontend** and **Backend** architectures.

---

## 🏗️ Architecture Overview

The codebase is organized into two distinct services:

```
crm_redhill/
├── backend/                       # Node.js + Express REST API Server (Port 5000)
│   ├── src/
│   │   ├── config/                # Environment & Database config (Supabase client)
│   │   │   └── db.ts
│   │   ├── controllers/           # Route handler logic
│   │   │   ├── callsController.ts
│   │   │   ├── documentsController.ts
│   │   │   ├── leadsController.ts
│   │   │   ├── siteVisitsController.ts
│   │   │   └── statsController.ts
│   │   ├── data/                  # In-memory store & seed datasets
│   │   │   ├── mockData.ts
│   │   │   └── serverStore.ts
│   │   ├── routes/                # Express API router definitions
│   │   │   ├── callsRoutes.ts
│   │   │   ├── documentsRoutes.ts
│   │   │   ├── index.ts
│   │   │   ├── leadsRoutes.ts
│   │   │   ├── siteVisitsRoutes.ts
│   │   │   └── statsRoutes.ts
│   │   ├── types/                 # TypeScript interfaces and domain models
│   │   │   └── crm.ts
│   │   └── server.ts              # Express server setup (CORS, JSON parser, logging)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Next.js 16 + React 19 Client App (Port 3000)
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── calendar/          # Teams Schedule & Site Visit calendar
│   │   │   ├── calls/             # Call logs & tele-calling desk
│   │   │   ├── documents/         # Document manager & brochures
│   │   │   ├── leads/             # Leads table, CSV import/export
│   │   │   ├── site-visits/       # Site visits scheduler & drivers
│   │   │   ├── layout.tsx         # Root layout with Sidebar & Header
│   │   │   └── page.tsx           # CRM Dashboard with KPIs & conversion charts
│   │   ├── components/            # Reusable UI widgets & forms
│   │   ├── context/               # Global state (CRM Context & data sync)
│   │   ├── lib/                   # Utilities, Supabase client, CSV parser
│   │   └── types/                 # Frontend TypeScript definitions
│   ├── next.config.ts             # Proxies /api/* to http://localhost:5000/api/*
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/                      # Database schema and seed migrations
└── package.json                   # Root monorepo workspace scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed

### 2. Running Backend (Port 5000)
To run the Express REST API server:
```bash
# From root directory:
npm run dev:backend

# Or directly in backend folder:
cd backend
npm run dev
```
Backend will start on: **`http://localhost:5000`**  
API base URL: **`http://localhost:5000/api`**

### 3. Running Frontend (Port 3000)
To run the Next.js client application:
```bash
# From root directory:
npm run dev:frontend

# Or directly in frontend folder:
cd frontend
npm run dev
```
Frontend will be available at: **`http://localhost:3000`**

---

## 📡 Backend API Endpoints

All API endpoints are prefixed with `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck endpoint |
| `GET` | `/api/stats` | Dashboard KPIs, revenue, pipeline metrics |
| `GET` | `/api/leads` | List all leads |
| `POST` | `/api/leads` | Create a new single lead |
| `POST` | `/api/leads/batch` | Bulk import leads (CSV import) |
| `PUT` | `/api/leads/:id` | Update lead details or pipeline status |
| `DELETE` | `/api/leads/:id` | Delete a lead |
| `GET` | `/api/calls` | Get all call log records |
| `POST` | `/api/calls` | Log a tele-caller activity |
| `GET` | `/api/site-visits` | List scheduled site visits |
| `POST` | `/api/site-visits` | Schedule a new site visit |
| `PUT` | `/api/site-visits/:id` | Update site visit status |
| `GET` | `/api/documents` | List uploaded contracts and brochures |
| `POST` | `/api/documents` | Upload a document |

---

## 🌐 Next.js Proxy Integration

In `frontend/next.config.ts`, Next.js automatically rewrites requests from `/api/:path*` to `http://localhost:5000/api/:path*`.  
This ensures seamless CORS-free communication whether developing locally or deploying.
