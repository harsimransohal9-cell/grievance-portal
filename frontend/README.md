# Campus Grievance Redressal Portal

A full-stack MERN application that lets students file complaints (with photo proof) 
about campus issues — hostel, mess, infrastructure, and academics — and lets 
administrators track, manage, and resolve them. Complaints left unresolved for too 
long are automatically escalated via a scheduled background job.

## Features

- **Role-based authentication** (JWT) — separate flows for students and admins
- **Complaint filing** with title, description, category, and optional photo proof
- **Status tracking** — Pending → In Progress → Resolved
- **Automatic escalation** — complaints pending beyond a configurable threshold are 
  auto-flagged using a daily cron job (with a manual trigger for demo purposes)
- **Admin dashboard** — view all complaints, filter by status/category, update status, 
  see live counts
- **Student dashboard** — file new complaints and track your own submission history
- **Protected routes** — students and admins can only access their own dashboards

## Tech Stack

**Frontend:** React (Vite), React Router, Axios, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB with Mongoose  
**Auth:** JWT + bcrypt  
**File uploads:** Multer  
**Scheduled jobs:** node-cron

## Project Structure

grievance-portal/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, role checks, file upload handling
│   ├── models/         # Mongoose schemas (User, Complaint)
│   ├── routes/         # API endpoints
│   ├── utils/           # Escalation cron job
│   └── server.js
└── frontend/
├── src/
│   ├── api/          # Axios instance with auth interceptor
│   ├── components/    # Reusable components (ProtectedRoute)
│   ├── context/       # AuthContext for global login state
│   └── pages/         # Login, Signup, StudentDashboard, AdminDashboard
└── ...

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or an Atlas connection string)

### Backend
```bash
cd backend
npm install
# Create a .env file with:
#   PORT=5000
#   MONGO_URI=mongodb://localhost:27017/grievance-portal
#   JWT_SECRET=your_secret_key
#   JWT_EXPIRE=7d
#   ESCALATION_DAYS=3
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, with the backend API running 
on `http://localhost:5000`.

## API Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/signup | Public | Register a new student/admin |
| POST | /api/auth/login | Public | Log in |
| GET | /api/auth/me | Authenticated | Get current user |
| POST | /api/complaints | Student | File a new complaint |
| GET | /api/complaints/my | Student | View own complaints |
| GET | /api/complaints | Admin | View all complaints (with filters) |
| PUT | /api/complaints/:id/status | Admin | Update complaint status |
| POST | /api/complaints/run-escalation | Admin | Manually trigger escalation check |

## Author

Built by Harsimran Singh as part of a MERN Stack training program.