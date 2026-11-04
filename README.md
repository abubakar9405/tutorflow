# TutorFlow - Tutor Management System

A web platform that helps private tutors manage students, sessions, attendance and progress in one place.

## Tech stack
- Frontend: React (Vite), React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas (Mongoose)
- Auth: JWT with role-based access (tutor, student, parent)

## Architecture
- client/ - presentation layer (React pages and components)
- server/src/routes and controllers - application layer (request handling)
- server/src/services - business logic layer
- server/src/models - data access layer (Mongoose schemas)

## Setup
1. Install packages:

        cd server && npm install
        cd ../client && npm install

2. Copy server/.env.example to server/.env and fill in the values.
3. Run the server: cd server && npm run dev
4. Run the client: cd client && npm run dev
5. Open http://localhost:5173

Requires Node.js 18 or newer.

## Implemented in this iteration
- User management: register, login, JWT, role-based protected pages and API routes
- Student and scheduling: student records (add, edit, delete, detail page), one-time and recurring sessions, reschedule, cancel, attendance
- Tutor admin: dashboard with active students, sessions today, monthly attendance and upcoming sessions

## Coming next
- Fee and invoicing
- Assignments
- Progress and reports

## Team
- Muhammad Zaid (23L-2582)
- Abubakar Siddique (23L-2522)
