# Online Library — Final Project (WT2)

Full-stack web application (Node.js + Express + MongoDB + Vanilla JS frontend).

## Live Links
- **Live App:** <PASTE_YOUR_RENDER_URL_HERE>
- **API Base URL:** <PASTE_YOUR_RENDER_URL_HERE>/api

---

## Tech Stack
- Node.js, Express
- MongoDB, Mongoose
- Vanilla JavaScript, HTML, CSS
- bcrypt (password hashing), JWT (authentication/authorization)

---

## Key Features
- MVC structure (routes / controllers / models)
- Authentication: Register / Login with bcrypt password hashing
- Authorization: JWT (`Authorization: Bearer <token>`)
- RBAC:
  - Admin-only: **POST / PUT / DELETE**
  - Public: **GET** for Authors / Books / Members
  - Loans: **admin-only**
- Relational integrity in MongoDB:
  - `Book.author` → `Author._id`
  - `Loan.book` → `Book._id`
  - `Loan.member` → `Member._id`
- Loans (Borrowing system):
  - Create a loan (member borrows a book)
  - Mark returned
  - Prevents duplicate active loans for the same book (one active loan per book)

---

## Project Structure (MVC)

WT2_Assignment4_Library/
controllers/
models/
routes/
public/
js/
css/
postman/
server.js
package.json
.env.example

---

## Quick Start (Local)

1) Install dependencies
```bash
npm install
2.	Create .env from .env.example
cp .env.example .env
Fill:
	•	MONGODB_URI=...
	•	JWT_SECRET=...

3.	Run

npm run dev
# or
npm start

Open:
	•	http://localhost:3000/catalog.html (public)
	•	http://localhost:3000/auth.html (login/register)
	•	http://localhost:3000/account.html (profile)
	•	http://localhost:3000/library-admin.html (admin panel)

⸻

Frontend Pages
	•	/catalog.html — public catalog pages
	•	/auth.html — Register / Login (stores JWT + user in localStorage)
	•	/account.html — Profile page (shows Role; admins get an Admin Panel button)
	•	/library-admin.html — Admin Panel (admins only):
	•	Authors CRUD
	•	Books CRUD (linked to Authors)
	•	Members CRUD
	•	Loans CRUD (Member ↔ Book) with “Mark returned”

Admin Panel is accessible through the site navigation / Profile (no manual URL typing required).

⸻

API Endpoints

Auth
	•	POST /api/auth/register
	•	body: { "email": "...", "password": "..." }
	•	creates a user account by default
	•	POST /api/auth/login
	•	body: { "email": "...", "password": "..." }
	•	returns: { token, user }

Role note: registration creates user role by default. Admin accounts should be created manually in MongoDB (or via a seed script if provided).

Authors (public read, admin write)
	•	GET /api/authors
	•	GET /api/authors/:id
	•	POST /api/authors (admin)
	•	body: { "fullName": "...", "birthYear": 1990 }
	•	PUT /api/authors/:id (admin)
	•	DELETE /api/authors/:id (admin)

Books (public read, admin write)
	•	GET /api/books (populated author)
	•	GET /api/books/:id
	•	POST /api/books (admin)
	•	body: { "title": "...", "year": 2020, "author": "<authorId>" }
	•	PUT /api/books/:id (admin)
	•	DELETE /api/books/:id (admin)

Members (public read, admin write)
	•	GET /api/members
	•	GET /api/members/:id
	•	POST /api/members (admin)
	•	body: { "firstName": "...", "lastName": "...", "email": "...", "country": "...", "gender": "...", "hobbies": ["..."] }
	•	PUT /api/members/:id (admin)
	•	DELETE /api/members/:id (admin)

Loans (admin-only, populated relations)
	•	GET /api/loans (populated member + book + book.author)
	•	POST /api/loans (admin)
	•	body: { "memberId": "...", "bookId": "..." }
	•	PUT /api/loans/:id/return (admin) — mark returned
	•	DELETE /api/loans/:id (admin)

Auth header for admin endpoints

Authorization: Bearer <token>


⸻

Postman

Import:
/postman/WT2_Assignment4_Library.postman_collection.json

Set variables:
	•	baseUrl (local or production)
	•	token (admin token)
	•	ids: authorId, bookId, memberId, loanId

⸻

Deployment Notes (Render)

This project serves the frontend from Express (/public), so one Render service is enough.

Render settings:
	•	Build command: npm install
	•	Start command: npm start
	•	Environment variables:
	•	MONGODB_URI
	•	JWT_SECRET
	•	PORT (Render sets this automatically)

After deploy, set Postman baseUrl to your Render URL and update the Live Links section above.

⸻

Repository Hygiene
	•	.env is NOT included (use environment variables / .env.example)
	•	node_modules is NOT included
