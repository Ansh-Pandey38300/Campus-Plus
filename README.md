# Campus Plus

A campus request board with **reverse bidding**. Students post what they need along with a budget and deadline. Sellers compete by submitting offers, and the buyer selects the most suitable offer.

## Features

- Student registration and login with college email validation.
- Create and manage purchase requests.
- Browse requests and seller listings.
- Submit and manage offers through reverse bidding.
- Offer price history.
- Deal creation and payment tracking.
- Item handover and confirmation.
- Ratings and notifications.
- Complaint submission and administration.
- Admin dashboard, user moderation and reports.
- Automatic request deadline processing.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, Tailwind CSS |
| Frontend tooling | Vite |
| Backend | Node.js, Express.js |
| Database | MySQL (Aiven Cloud) |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Version Control | Git and GitHub |
| API Testing | Postman |

## Team

Campus Plus was developed by a team of five members, with responsibilities divided across database design, backend development, frontend implementation, and project integration.

| Team Member | Key Responsibilities |
|---|---|
| **Ansh** | Project coordination, ER design and integration, GitHub repository setup, master data (categories, departments, pickup locations), SQL reports, admin report pages, testing, and documentation. |
| **Vishal** | User authentication and registration, role-based authorization, user management, seller ratings display, penalties, admin moderation, and in-app notifications. |
| **Ayush** | Requests and seller items, database schemas and APIs, request creation and listing, search and filtering, profile page, and related frontend pages. |
| **Subhranil** | Reverse-bidding system, offers and offer history, offer validation, automatic request closure, winner selection, and related APIs. |
| **Parth** | Transactions, deals, payment and handover flow, buyer confirmation, ratings, complaints, admin complaint moderation, and related frontend/backend functionality. |

Each member contributed to their assigned module, while integration, testing, and final project improvements were carried out collaboratively.

## Project Structure

```text
Campus-Plus/
│
├── backend/
│   ├── controllers/       Request handling and business logic
│   ├── middleware/        Authentication and error handling
│   ├── models/            Database models
│   ├── routes/            API route modules
│   ├── services/          Application services
│   ├── db.js              Database connection
│   ├── server.js          Express application
│   └── .env.example       Environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── schema/            SQL schema files
│   ├── seed/              Sample data
│   ├── reports/           SQL reports
│   └── run_all.sql        Database initialization script
│
├── docs/
│   ├── decisions.md
│   ├── TEAM_RULES.md
│   ├── FINAL_ER_DIAGRAM.md
│   ├── API_REFERENCE.md
│   ├── End_To_End_Checklist.md
│   └── screenshots/
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- Access to the shared Aiven MySQL database
- Postman (optional, for API testing)

### 1. Clone the repository

```bash
git clone <repository-url>
cd Campus-Plus
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create your environment file:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Configure the following variables in `backend/.env`:

```env
PORT=3000

DB_HOST=your_aiven_host
DB_PORT=your_aiven_port
DB_USER=your_aiven_username
DB_PASSWORD=your_aiven_password
DB_NAME=campus_plus

JWT_SECRET=your_secure_secret_at_least_32_characters
JWT_EXPIRES_IN=1h

COLLEGE_EMAIL_DOMAINS=jnu.ac.in
```

Use the actual Aiven credentials provided to your team. The backend also requires the Aiven CA certificate at `backend/ca.pem` for SSL database connections.

**Never commit `.env`, database passwords, JWT secrets or private credentials to GitHub.**

### 3. Start the backend

For development:

```bash
npm run dev
```

For normal startup:

```bash
npm start
```

The backend runs at:

```text
http://localhost:3000
```

The root route redirects to:

```text
http://localhost:3000/pages/index.html
```

### 4. Frontend development

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal.

To create a frontend production build:

```bash
npm run build
```

### 5. Verify the backend

Check the API:

```text
http://localhost:3000/api/hello
```

Check the database connection:

```text
http://localhost:3000/api/health/db
```

A successful database health check returns:

```json
{
  "db": "connected"
}
```

## Database

Campus Plus uses a shared **Aiven-hosted MySQL database**.

The database schema is organized into separate SQL files under `database/schema/`. The consolidated initialization script is available at `database/run_all.sql`.

Team members should use the shared database credentials and follow the team's database contribution rules. Do not independently recreate or modify the shared database.

## API Documentation

All backend API routes are mounted under `/api`.

See [API Reference](docs/API_REFERENCE.md) for the available endpoints and authentication requirements.

## Project Documentation

| Document | Description |
|---|---|
| [Team Rules](docs/TEAM_RULES.md) | Team collaboration guidelines |
| [Project Decisions](docs/decisions.md) | Important project decisions |
| [Final ER Diagram](docs/FINAL_ER_DIAGRAM.md) | Database entities and relationships |
| [API Reference](docs/API_REFERENCE.md) | Backend API endpoints |
| [End-to-End Checklist](docs/End_To_End_Checklist.md) | Feature testing checklist |
| [Domain and Bidding Guide](docs/domain_and_bidding_guide.pdf) | Domain and bidding explanation |
| [Teamwork Guide](docs/teamwork_guide_git_and_files.pdf) | Git and file collaboration |
| [Who Builds What](docs/who_builds_what.pdf) | Team task allocation |

## Working Together

- Read `docs/TEAM_RULES.md` before contributing code.
- Check `docs/decisions.md` before changing agreed project decisions.
- Work on separate feature branches.
- Submit changes through pull requests.
- Follow the repository's review and approval process.
- Keep shared database and configuration files protected.