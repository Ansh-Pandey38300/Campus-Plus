# Project decisions

| Topic | Decision |
|---|---|
| Domain | Campus Plus: campus request board for students |
| Bidding type | Reverse bidding only: a buyer posts a request, sellers offer lower prices, the buyer chooses the best offer |
| Fallback | If the full flow does not work by Day 11, switch to forward bidding (tables are nearly the same) |
| Plan | 21 days, 5 phases with checkpoints, tracked in the shared Google Sheet |
| Scope | Core flow first. Extras only after the core works |
| Not included | Real payments, email or SMS, chat, category subscriptions, multi-level approvals |
| Optional (cut first) | Penalties, in-app notifications, profile page |
| Tech stack | HTML, CSS, JavaScript; Node.js and Express; MySQL; Git and GitHub; Postman |
| Docker | Optional trial for MySQL only. Adopt only if it works on every laptop |
