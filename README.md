# Practical Assignment — Expense Tracker

A fullstack Expense Tracker application developed in accordance with the **Practical Assignment Specification**.

- **Backend**: Node.js + Express.js REST API
- **Database Persistence**: MySQL (with zero-config SQLite fallback for evaluation)
- **Frontend**: React (Vite) + Tailwind CSS + Recharts + Lucide Icons + Sonner Toasts

---

## 📁 1. Submission Deliverables Checklist (Section 6)

| Deliverable | Path | Description |
| :--- | :--- | :--- |
| **Backend Source Code** | `backend/src/` | Express REST API (controllers, routes, validators, repositories) |
| **Frontend Source Code** | `frontend/src/` | React application (components, state management, UI) |
| **Database Schema** | `backend/data/schema.sql` | MySQL DDL schema and table definitions |
| **Setup & Run Instructions** | `README.md` | Complete setup, configuration, and execution instructions |
| **API Documentation** | `postman/Expense_Tracker.postman_collection.json` | Postman collection covering all endpoints and test outputs |
| **Security Compliance** | `.gitignore` | Environment files (`.env`), credentials, and local database files are excluded |

---

## 💾 2. Database Persistence & Setup (Section 1)

The application supports **MySQL** for persistence, as well as an embedded **SQLite** fallback for zero-configuration testing.

### Option A: MySQL (Implemented Database Engine)
1. Import the schema script into your MySQL database server:
   ```bash
   mysql -u root -p < backend/data/schema.sql
   ```
2. Create `backend/.env` from `backend/.env.example`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Update `backend/.env` with your MySQL connection credentials:
   ```env
   PORT=5000
   DB_TYPE=mysql
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=expense_tracker
   ```
*(Note: MySQL repository queries and schema are fully implemented; SQLite is provided and pre-configured as the verified zero-setup test path for instant evaluation without requiring a local MySQL daemon).*

### Option B: SQLite (Evaluator Zero-Config Mode — Actively Verified)
If you prefer to test without a running MySQL server, the backend defaults to SQLite automatically:
```bash
cp backend/.env.example backend/.env
```
*(Leave `DB_TYPE=sqlite` or omit `backend/.env` entirely; the code defaults to SQLite at `backend/data/expenses.db` automatically).*

---

## 🚀 3. Installation & Run Steps

### Step 1: Start Backend API (Port 5000)
```bash
cd backend
npm install
cp .env.example .env
npm start
```
- The API server starts on `http://localhost:5000`.
- On first launch, the 5 sample records are seeded automatically if the database table is empty.

### Step 2: Start Frontend Application (Port 3000)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open your browser at `http://localhost:3000`.

---

## 📊 4. Sample Test Data (Section 2)

The application is initialized with the sample records specified in Section 2:

| Description | Amount (₹) | Category | Date |
| :--- | :---: | :---: | :---: |
| Dinner with client | 1500 | Food | 2026-10-09 |
| Uber ride | 450 | Travel | 2026-10-09 |
| Office supplies | 800 | Shopping | 2026-10-09 |
| Hotel booking | 3000 | Travel | 2026-10-09 |
| Team lunch | 1200 | Food | 2026-10-09 |

**Allowed categories**: `Food`, `Travel`, `Shopping`, `Other`.

---

## 📡 5. REST API Documentation & Specification (Sections 3 & 5)

### Endpoints Table
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/expenses/summary` | Return overall total amount and totals grouped by category |
| `GET` | `/api/expenses` | List expenses (supports search, category/date filters, sorting, pagination) |
| `GET` | `/api/expenses/:id` | Get single expense record by ID |
| `POST` | `/api/expenses` | Create a new expense |
| `PUT` | `/api/expenses/:id` | Update an existing expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense by ID |
| `POST` | `/api/expenses/reset-seed` | Utility endpoint: resets database to initial 5 sample records |

---

### Query Parameters for `GET /api/expenses`

| Parameter | Type | Allowed Values | Description |
| :--- | :---: | :--- | :--- |
| `search` | string | Any string | Case-insensitive substring match on `description` |
| `category` | string | `Food`, `Travel`, `Shopping`, `Other` | Filter expenses by specific category |
| `startDate` | string | `YYYY-MM-DD` | Filter expenses on or after this date (`date >= startDate`) |
| `endDate` | string | `YYYY-MM-DD` | Filter expenses on or before this date (`date <= endDate`) |
| `sortBy` | string | `date`, `amount` | Field to sort by (**default: `date`**) |
| `order` | string | `asc`, `desc` | Sort order (**default: `desc`**) |
| `page` | integer | `>= 1` | Page number for pagination (**default: `1`**) |
| `limit` | integer | `>= 1` | Records per page |

- **Default Sort**: `sortBy=date&order=desc` (newest records first; tie-broken by `id DESC`).

---

### Response Shapes & Structures

#### 1. List Response Shapes (`GET /api/expenses`)
- **Without Pagination** (`limit` omitted):
  Returns a plain JSON array of expense objects:
  ```json
  [
    {
      "id": 1,
      "description": "Dinner with client",
      "amount": 1500,
      "category": "Food",
      "date": "2026-10-09"
    }
  ]
  ```

- **With Pagination** (`limit` provided, e.g. `?page=1&limit=2`):
  Returns an object containing the records array and complete pagination metadata including **`hasNextPage`** and **`hasPrevPage`**:
  ```json
  {
    "expenses": [
      {
        "id": 1,
        "description": "Dinner with client",
        "amount": 1500,
        "category": "Food",
        "date": "2026-10-09"
      }
    ],
    "pagination": {
      "totalRecords": 5,
      "totalPages": 3,
      "currentPage": 1,
      "limit": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

#### 2. Summary Response (`GET /api/expenses/summary` — Output 1)
Status: `200 OK`
```json
{
  "totalAmount": 6950,
  "categoryTotals": {
    "Food": 2700,
    "Travel": 3450,
    "Shopping": 800,
    "Other": 0
  }
}
```

#### 3. Single Expense Response (`GET /api/expenses/:id`)
Status: `200 OK`
```json
{
  "id": 2,
  "description": "Uber ride",
  "amount": 450,
  "category": "Travel",
  "date": "2026-10-09"
}
```

#### 4. Create Response (`POST /api/expenses` — Output 9)
Status: `201 Created`
```json
{
  "id": 6,
  "description": "Client coffee",
  "amount": 250,
  "category": "Food",
  "date": "2026-10-10"
}
```

#### 5. Update Response (`PUT /api/expenses/:id` — Output 4)
Status: `200 OK`
```json
{
  "id": 2,
  "description": "Uber ride",
  "amount": 600,
  "category": "Travel",
  "date": "2026-10-09"
}
```

#### 6. Delete Response (`DELETE /api/expenses/:id` — Output 10)
Status: `200 OK`
```json
{
  "message": "Expense deleted successfully",
  "id": 2
}
```

#### 7. Error Responses
- **Client Validation Error (`400 Bad Request` — Output 5)**:
  ```json
  {
    "error": "Amount must be a positive number",
    "errors": ["Amount must be a positive number"]
  }
  ```
- **Not Found (`404 Not Found`)**:
  ```json
  {
    "error": "Expense with ID 999 not found."
  }
  ```
- **Server Error (`500 Internal Server Error`)**:
  ```json
  {
    "error": "Internal Server Error"
  }
  ```

---

## 🧪 6. Automated Verification Test Suite

An automated test suite validates all 10 expected outputs from the specification:
```bash
cd backend
npm test
```
Outputs verified:
- **Output 1**: Initial summary values (`totalAmount: 6950`, category breakdown).
- **Output 2**: Category filter (`category=Food` returns 2 records).
- **Output 3**: Amount descending sort (`[3000, 1500, 1200, 800, 450]`).
- **Output 4**: Updating Uber ride to 600 recalculates total to 7100 and Travel to 3600.
- **Output 5**: Rejecting negative amount with HTTP 400.
- **Output 6**: Searching description by keyword (`search=Uber`).
- **Output 7**: Date range filter (`startDate=2026-10-09&endDate=2026-10-09`).
- **Output 8**: Pagination metadata (`page=1&limit=2`, `totalRecords: 5`, `hasNextPage: true`).
- **Output 9**: Expense creation with HTTP 201 and persistent storage.
- **Output 10**: Deletion with HTTP 200 and summary recalculation.

---

## 🖥️ 7. Frontend User Interface (Section 4)

- **Screen 1 — Expense Summary / Dashboard**:
  - Displays total amount of all expenses (`₹6,950`).
  - Displays category cards with paired progress bars and percentages.
  - Interactive charts: Category spending comparison bar chart & category breakdown donut chart.
  - Navigation button to open the add expense modal.
- **Screen 2 — Expense Listing / Management**:
  - Full table with description, amount, category, date, and actions (edit/delete).
  - Search by description, filter by category and date range, sort by amount and date.
  - Pagination controls with current page and total records indicator.
  - Notification toasts for creation, update, and deletion operations.
