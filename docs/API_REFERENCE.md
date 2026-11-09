# Campus Plus — API Reference

## 1. Overview

Campus Plus provides REST API endpoints through a Node.js and Express backend connected to a MySQL database.

**Base URL (local):**
```text
http://localhost:3000/api
```

All endpoints below are relative to the `/api` prefix.

### Authentication

Protected endpoints require a valid JWT access token.

Include the token in the request header:

```http
Authorization: Bearer <your_token>
```

- **Public:** No authentication required.
- **Authenticated:** Requires a valid JWT token.
- **Admin:** Requires authentication and the administrator role.

## 2. Authentication APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Authenticate a user |
| GET | `/auth/me` | Authenticated | Retrieve the authenticated user's information |
| GET | `/admin/check` | Admin | Check administrator access |

## 3. Request APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/requests` | Public | Retrieve requests |
| GET | `/requests/:id` | Public | Retrieve a specific request |
| POST | `/requests` | Authenticated | Create a request |
| GET | `/requests/categories` | Public | Retrieve available categories |
| GET | `/requests/pickup-locations` | Public | Retrieve pickup locations |

## 4. Seller Item APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/seller-items` | Public | Retrieve seller listings |
| GET | `/seller-items/my` | Authenticated | Retrieve the authenticated seller's listings |
| POST | `/seller-items` | Authenticated | Create a seller listing |

## 5. Offer APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/offers/requests/:requestId` | Authenticated | Submit or update an offer for a request |
| GET | `/offers/requests/:requestId` | Authenticated | Retrieve offers for a request |
| GET | `/offers/requests/:requestId/mine` | Authenticated | Retrieve the authenticated user's offer |
| GET | `/offers/:offerId/history` | Authenticated | Retrieve offer price history |
| POST | `/offers/:offerId/select` | Authenticated | Select an offer |

## 6. Deal APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/deals/my` | Authenticated | Retrieve the user's deals |
| GET | `/deals/:id` | Authenticated | Retrieve deal details |
| POST | `/deals/:id/payment-completed` | Authenticated | Submit payment completion information |
| POST | `/deals/:id/confirm-payment` | Authenticated | Confirm payment |
| POST | `/deals/:id/handover` | Authenticated | Record item handover |
| POST | `/deals/:id/confirm-handover` | Authenticated | Confirm item handover |

## 7. Complaint APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/complaints` | Authenticated | Submit a complaint against a deal |
| GET | `/complaints` | Admin | Retrieve all complaints |

## 8. Rating APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/ratings` | Authenticated | Submit a rating |
| GET | `/ratings/deals/:dealId` | Authenticated | Retrieve ratings for a deal |
| GET | `/ratings/sellers/:sellerId` | Authenticated | Retrieve ratings for a seller |

## 9. Notification APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/notifications` | Authenticated | Retrieve user notifications |
| GET | `/notifications/unread-count` | Authenticated | Retrieve unread notification count |
| PATCH | `/notifications/read-all` | Authenticated | Mark all notifications as read |
| PATCH | `/notifications/:id/read` | Authenticated | Mark a specific notification as read |

## 10. Profile APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/profile/me` | Authenticated | Retrieve the current user's profile |

## 11. Administrator APIs

All endpoints in this section require a valid JWT token and administrator role.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/admin/complaints` | Admin | Retrieve complaints for moderation |
| GET | `/admin/users` | Admin | Retrieve users |
| PATCH | `/admin/users/:userId/unblock` | Admin | Unblock a user |
| POST | `/admin/complaints/:complaintId/moderate` | Admin | Moderate a complaint and take action |
| GET | `/admin/reports` | Admin | Retrieve platform reports and statistics |

## 12. Request Deadline Processing

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/requests/close-expired` | No route-level authentication | Manually trigger deadline processing |

**Important:** The backend also runs an automatic deadline scheduler every 60 seconds. It processes expired requests and sends closing-soon notifications.

The manual endpoint currently has no route-level authentication middleware. It should be restricted or removed if it is not intended for external use.

## 13. API Notes

- All endpoints are mounted under the `/api` prefix.
- Dynamic path parameters such as `:id`, `:requestId`, and `:offerId` must be replaced with actual resource IDs.
- Protected endpoints require JWT authentication.
- Administrator endpoints require the administrator role.
- GET requests are used to retrieve information.
- POST requests are used to create resources or trigger actions.
- PATCH requests are used for partial updates or state changes.
- The request deadline scheduler runs automatically every 60 seconds; manual triggering is available through the endpoint documented in Section 12.
- Selecting an offer initiates the winner-selection and deal-creation workflow, subject to the backend's validation rules.

## 14. Source Code Reference

The API routes are organized in:

```text
backend/
└── routes/
    ├── admin.js
    ├── complaints.js
    ├── deals.js
    ├── login.js
    ├── notifications.js
    ├── offers.js
    ├── profile.js
    ├── protected.js
    ├── ratings.js
    ├── register.js
    ├── reports.js
    ├── requestDeadlines.js
    ├── requests.js
    └── sellerItems.js
```

Business logic is handled by the corresponding backend controllers and services.

---

*This API reference documents the routes and access middleware identified in the backend route files. Request payloads, response schemas and detailed error codes are not specified here because they have not yet been documented from the controller implementations.*