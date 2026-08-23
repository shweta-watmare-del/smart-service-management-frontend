markdown
# Smart Service & Complaint Management System — Frontend

A React-based frontend for a role-based service and complaint management platform. Users raise and track complaints, admins assign technicians and monitor operations across a live dashboard, and technicians manage their assigned work through a guided workflow.

## Features

- **Role-based dashboards** — separate, purpose-built views for Users, Admins, and Technicians
- **JWT authentication** with protected routes and automatic role-based redirects
- **Full complaint lifecycle UI** — raise, track, assign, accept, work on, and resolve complaints
- **Visual status timeline** on complaint detail pages, with a full activity/audit log
- **Admin analytics** — status and priority breakdown charts, technician performance, resolution rates
- **Search and filtering** across complaint lists
- **Image upload** for complaint photos and resolution proof
- **Feedback system** — star ratings and comments on resolved complaints
- **Toast notifications, confirm modals, loading skeletons, and error states** throughout
- **Fully responsive** design (desktop, tablet, mobile)
- **Custom design system** — consistent theme, typography, and component library across the app

## Tech Stack

| Category | Technology |
|---|---|
| Library | React 18 (Vite) |
| Routing | React Router |
| HTTP Client | Axios |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Styling | Custom CSS with design tokens, Bootstrap base |

## Project Structure

src/
├── components/ # Reusable UI (DashboardLayout, StatusTimeline, ConfirmModal, Skeleton, Navbar)
├── pages/ # Route-level pages (dashboards, auth, complaint details, management pages)
├── context/ # AuthContext — global auth state
├── routes/ # ProtectedRoute — role-based route guarding
├── services/ # Axios instance + API call functions
└── styles/ # Global design tokens (theme.css)


## Key Architecture Decisions

- **Context API** for auth state, avoiding prop-drilling across nested dashboard routes
- **Axios request interceptor** automatically attaches the JWT token to every authenticated call
- **Protected routes** check both authentication and role before rendering, redirecting unauthorized users
- **Component reuse** — a single `DashboardLayout` powers all three role-based dashboards, driven by a `navItems` prop

## Getting Started

### Prerequisites
- Node.js 18+
- The [backend API](https://github.com/shweta-watmare-del/smart-service-management-backend) running locally on port 8084

### Setup

1. Clone the repository

git clone https://github.com/shweta-watmare-del/smart-service-management-frontend.git
cd smart-service-management-frontend


2. Install dependencies

npm install


3. Start the development server

npm run dev


   The app will be available at `http://localhost:5173`.

### Test Accounts

After registering through the app, an Admin account must be promoted manually in the database (see backend README). From there, Admins can create Technicians directly through the **Manage Technicians** page in the UI.

## Backend

The companion Spring Boot backend for this project is available at:
[smart-service-management-backend](https://github.com/shweta-watmare-del/smart-service-management-backend)