# Team rules

## The golden rule
Every file has one owner. Only the owner edits it. If you need a change in someone else's file, ask them.

## Branches and Pull Requests
- `main` always works. Nobody pushes directly to `main`.
- One branch per person per module: `feature/<module>` (for example `feature/offers`).
- Commit small and often, with a clear message.
- Pull every morning: `git pull origin main`.
- Open a Pull Request when a piece works. One teammate checks it runs, then merges.
- Merge at least every 2 days. Long-lived branches create big conflicts.

## Shared files (team leader only)
`backend/server.js`, `backend/db.js`, `backend/package.json`, `frontend/css/main.css`.
To add backend routes, create `backend/routes/<module>.js`. It is loaded automatically.

## Database
- One schema file per module in `database/schema`. Only the owner edits it.
- Everyone runs a local MySQL. Do not share one database.
- After the ER freeze, tell the group before changing a table. Log it in the tracker's Schema changes tab.
- Changes go into a NEW numbered file in `database/migrations`. Never edit old files.

## If you get a conflict
1. Do not panic and do not delete other people's work.
2. Message the owner of the file and fix it together.
3. Keep the right lines, delete the marker lines, then `git add` and `git commit`.
4. Run the app to check it still works.

## Secrets
Never commit passwords. Keep them in `backend/.env` (ignored by Git). Share only `.env.example`.
