# TutorFlow - Tutor Management System

A web platform that helps private tutors manage students, sessions, attendance, fees, assignments and progress in one place. Parents and students get their own read-only portal.

## Tech stack
- Frontend: React (Vite), React Router, Axios, Recharts
- Backend: Node.js, Express, Multer (file uploads)
- Database: MongoDB Atlas (Mongoose)
- Auth: JWT with role-based access (tutor, student, parent)

## Architecture
- client/ - presentation layer (React pages and components)
- server/src/routes and controllers - application layer (request handling)
- server/src/services - business logic layer (fees, reports, identity)
- server/src/models - data access layer (Mongoose schemas)

## Setup
1. Install packages:

        cd server && npm install
        cd ../client && npm install

2. Copy server/.env.example to server/.env and fill in the values.
3. Run the server: cd server && npm run dev
4. Run the client: cd client && npm run dev
5. Open http://localhost:5173

Requires Node.js 18 or newer (Node.js 20 is recommended, because React Router 7 targets it).

## Features
- User management: register, login, JWT, role-based protected pages and API routes
- Students and scheduling: student records, one-time and recurring sessions with meet links, reschedule, cancel, attendance
- Fees and invoicing: monthly invoices per student, partial and full payments, printable invoices, fee summary
- Assignments: create, mark submitted, grade with marks and feedback, overdue flag
- Progress and reports: per-student attendance rate, assignment average and fee status
- Tutor dashboard: stats cards plus attendance and fee charts
- Parent portal: child's upcoming sessions, attendance, marks and fees
- Student portal: upcoming sessions with a Join button, marks, and assignment file upload

## Roles
- Tutor: full access
- Parent: read-only view of their own children, including fees
- Student: read-only view of their own sessions and marks, can upload assignment files, cannot see fees

## Linking parents and students (temporary)
A parent or student account is linked to a student record by email. The tutor enters the Parent email and Student email on the student record, and the person registers with the same email. All of this logic lives in server/src/services/identity.service.js. Email is not verified at registration, so this is for development only. Before deployment, replace that file with real authentication and verified linking.

## Notes
- Uploaded files are stored on local disk in server/uploads (ignored by git). For deployment, move them to cloud storage by changing server/src/middleware/upload.js only.
- Never commit server/.env.

## Team
- Muhammad Zaid (23L-2582)
- Abubakar Siddique (23L-2522)
