# Campus Plus

A campus request board with **reverse bidding**. A student posts what they need (with a budget and a deadline), sellers compete with lower offers, and the buyer chooses the best one.

## Tech stack
HTML, CSS, JavaScript | Node.js + Express | MySQL | Git + GitHub | Postman

## Team
| Member | Role | GitHub |
|---|---|---|
| Team leader | Database foundation, repo, documents | |
| | | |
| | | |
| | | |
| | | |

Progress is tracked in the shared Google Sheet: (add link here)

## Folder structure
```
/database
  /schema       one SQL file per module group (owner edits only their own)
  /seed         sample data
  /migrations   changes made after the ER freeze (numbered files)
  run_all.sql   builds the whole database
/backend
  /routes       one file per module, loaded automatically under /api
  /controllers  logic for each module
  server.js  db.js   (shared files, team leader only)
/frontend
  /pages  /js  /css
/docs           decisions, team rules, guides, ER diagram, API list
```

## How to run it on your laptop
1. Install Node.js, MySQL, Git and Postman.
2. Clone the repo and open the folder.
3. Backend setup:
   ```
   cd backend
   npm install
   cp .env.example .env      (Windows: copy .env.example .env)
   ```
   Open `.env` and put your own MySQL password.
4. Build the database (needs the schema files filled in):
   ```
   cd ../database
   mysql -u root -p < run_all.sql
   ```
5. Start the server:
   ```
   cd ../backend
   npm start
   ```
6. Open http://localhost:3000 and press "Check API and database".

## Working together
Read `docs/TEAM_RULES.md` before you write any code. Decisions are in `docs/decisions.md`.
