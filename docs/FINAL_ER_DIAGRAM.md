# Campus Plus — Final Entity Relationship Diagram

## 1. Overview

This document represents the final database structure of Campus Plus based on the consolidated MySQL schema.

The database uses MySQL with the InnoDB storage engine and contains 16 tables covering users, master data, requests, seller items, offers, deals, transactions, complaints, penalties, ratings, and notifications.

## 2. ER Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : has

    USERS ||--o{ REQUESTS : creates
    USERS ||--o{ SELLER_ITEMS : lists
    USERS ||--o{ OFFERS : submits
    USERS ||--o{ OFFER_HISTORY : changes

    USERS ||--o{ DEALS : buyer
    USERS ||--o{ DEALS : seller

    USERS ||--o{ COMPLAINTS : reports
    USERS o|--o{ COMPLAINTS : reviews
    USERS ||--o{ PENALTIES : receives

    USERS ||--o{ RATINGS : gives
    USERS ||--o{ RATINGS : receives
    USERS ||--o{ NOTIFICATIONS : receives

    CATEGORIES o|--o{ CATEGORIES : parent_of
    CATEGORIES ||--o{ REQUESTS : classifies
    CATEGORIES ||--o{ SELLER_ITEMS : classifies
    PICKUP_LOCATIONS ||--o{ REQUESTS : assigned_to

    REQUESTS ||--o{ OFFERS : receives
    OFFERS ||--o{ OFFER_HISTORY : has

    REQUESTS ||--o| DEALS : results_in
    OFFERS ||--o| DEALS : selected_for

    DEALS ||--o{ TRANSACTIONS : has
    DEALS ||--o| HANDOVER_RECORDS : tracks
    DEALS ||--o{ COMPLAINTS : concerns
    DEALS ||--o| RATINGS : receives

    COMPLAINTS ||--o{ PENALTIES : results_in

    DEPARTMENTS {
        int id PK
        varchar name
        datetime created_at
    }

    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar role
        int department_id FK
        boolean is_blocked
        datetime blocked_until
        datetime created_at
    }

    CATEGORIES {
        int id PK
        varchar name
        int parent_id FK
        datetime created_at
    }

    PICKUP_LOCATIONS {
        int id PK
        varchar name
        varchar description
        datetime created_at
    }

    REQUESTS {
        int id PK
        int buyer_id FK
        int category_id FK
        int pickup_location_id FK
        varchar title
        text description
        decimal max_budget
        datetime deadline
        varchar status
        datetime created_at
    }

    SELLER_ITEMS {
        int id PK
        int seller_id FK
        int category_id FK
        varchar title
        varchar item_condition
        decimal asking_price
        text description
        varchar status
        datetime created_at
    }

    OFFERS {
        int id PK
        int request_id FK
        int seller_id FK
        decimal offered_price
        text offer_note
        datetime created_at
        datetime updated_at
    }

    OFFER_HISTORY {
        int id PK
        int offer_id FK
        decimal previous_price
        decimal new_price
        int changed_by_user_id FK
        datetime created_at
    }

    DEALS {
        int id PK
        int request_id FK,UK
        int offer_id FK,UK
        int buyer_id FK
        int seller_id FK
        decimal agreed_amount
        enum status
        datetime created_at
        datetime updated_at
    }

    TRANSACTIONS {
        int id PK
        int deal_id FK
        decimal amount
        varchar payment_method
        enum status
        varchar reference_code
        datetime created_at
        datetime updated_at
    }

    HANDOVER_RECORDS {
        int id PK
        int deal_id FK,UK
        enum status
        datetime created_at
        datetime updated_at
    }

    COMPLAINTS {
        int id PK
        int deal_id FK
        int reporter_id FK
        text reason
        enum status
        int reviewed_by FK
        datetime created_at
        datetime reviewed_at
    }

    PENALTIES {
        int id PK
        int user_id FK
        int complaint_id FK
        enum type
        datetime until_date
        datetime created_at
    }

    RATINGS {
        int id PK
        int deal_id FK,UK
        int rater_id FK
        int seller_id FK
        int stars
        varchar comment
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        varchar message
        boolean is_read
        varchar type
        varchar reference_type
        int reference_id
        datetime created_at
    }
```

## 3. Relationship Summary

| Relationship | Cardinality |
|---|---|
| Department – Users | One-to-Many |
| User – Requests | One-to-Many |
| User – Seller Items | One-to-Many |
| User – Offers | One-to-Many |
| User – Offer History | One-to-Many |
| User – Deals (Buyer) | One-to-Many |
| User – Deals (Seller) | One-to-Many |
| User – Complaints (Reporter) | One-to-Many |
| User – Complaints (Reviewer) | One-to-Many; reviewer is optional |
| User – Penalties | One-to-Many |
| User – Ratings (Rater) | One-to-Many |
| User – Ratings (Seller) | One-to-Many |
| User – Notifications | One-to-Many |
| Category – Requests | One-to-Many |
| Category – Seller Items | One-to-Many |
| Category – Category | Self-referencing |
| Pickup Location – Requests | One-to-Many |
| Request – Offers | One-to-Many |
| Offer – Offer History | One-to-Many |
| Request – Deal | One-to-Zero-or-One |
| Offer – Deal | One-to-Zero-or-One |
| Deal – Transactions | One-to-Many |
| Deal – Handover Record | One-to-Zero-or-One |
| Deal – Complaints | One-to-Many |
| Deal – Rating | One-to-Zero-or-One |
| Complaint – Penalties | One-to-Many |

## 4. Important Database Constraints

- User email addresses are unique.
- A seller can submit only one offer per request.
- Each deal references a unique request and a unique offer.
- Each deal can have at most one handover record.
- Each deal can have at most one rating.
- Rating stars must be between 1 and 5.
- Request budgets, seller asking prices, offer prices, and agreed deal amounts must be positive.
- Category hierarchy is maintained using `parent_id`.
- Foreign keys enforce referential integrity between related tables.
- The complaint reviewer can be optional if `reviewed_by` is nullable in the schema.

## 5. Source

The diagram is based on the SQL schema files in `database/schema/`:

- `01_master_data.sql`
- `02_users.sql`
- `03_requests.sql`
- `04_offers.sql`
- `05_deals.sql`
- `06_trust.sql`

**Note:** This is the technical database ER diagram. A separate Chen-notation diagram will be prepared for presentation purposes, using rectangles for entities, ellipses for attributes, diamonds for relationships, underlined primary keys, and clearly marked cardinalities.