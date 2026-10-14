# Practical Assignment — Expense Tracker

A fullstack Expense Tracker built in strict compliance with the **Practical Assignment Requirements**.

- **Backend**: Node.js + Express.js (independent REST API)
- **Database Persistence**: **MySQL** & **SQLite** (Dual-mode support via `mysql2` and `sqlite3`)
- **Frontend**: React (Vite) + Lucide Icons + Clean Responsive UI

---

## 💾 Database Persistence & MySQL Compliance (Section 1 & 6)

The assignment requires either **MongoDB or MySQL** for persistence. This backend provides **first-class native MySQL support**:

* **MySQL Schema & Seed Script**: Located at [`backend/data/schema.sql`](file:///c:/Users/tisha/expense-tracker/backend/data/schema.sql).
* **Dual-Mode Architecture**: To ensure immediate, zero-config testing by any evaluator without forcing a local MySQL installation, SQLite is active by default. Switching to MySQL requires only updating `.env`.

### Connecting to MySQL
1. Import the schema and seed data into MySQL:
   ```bash
   mysql -u root -p < backend/data/schema.sql
   ```
2. In `backend/.env`, set:
   ```env
   DB_TYPE=mysql
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=expense_tracker
   ```
3. Start the server (`npm start`). It will automatically connect through the MySQL connection pool (`mysql2/promise`).

---

## 🚀 Quick Start Instructions

### 1. Start Backend API Server (Port 5000)
```bash
cd backend
npm install
npm start
```
* Runs on `http://localhost:5000`.
* Seeds the initial 5 sample records automatically.

### 2. Start Frontend Client (Port 3000)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Open your browser at `http://localhost:3000`.

---

## 📊 Initial Test Data (Section 2)

| Description | Amount | Category | Date |
| :--- | :--- | :--- | :--- |
| Dinner with client | 1500 | Food | 2026-10-09 |
| Uber ride | 450 | Travel | 2026-10-09 |
| Office supplies | 800 | Shopping | 2026-10-09 |
| Hotel booking | 3000 | Travel | 2026-10-09 |
| Team lunch | 1200 | Food | 2026-10-09 |

**Allowed categories**: `Food`, `Travel`, `Shopping`, `Other`.

---

## 📡 REST API Endpoints & Verification Checks (Section 3 & 5)

| Endpoint | Method | Assignment Output Verification |
| :--- | :--- | :--- |
| `/api/expenses/summary` | `GET` | **Output 1:** Returns `{ totalAmount: 6950, categoryTotals: { Food: 2700, Travel: 3450, Shopping: 800, Other: 0 } }` |
| `/api/expenses?category=Food` | `GET` | **Output 2:** Filters by category (Dinner with client & Team lunch) |
| `/api/expenses?sortBy=amount&order=desc` | `GET` | **Output 3:** Sorts descending by amount: 3000, 1500, 1200, 800, 450 |
| `/api/expenses/:id` | `PUT` | **Output 4:** Updates Uber ride amount (450 to 600) and recalculates summary (7100 total, 3600 Travel) |
| `/api/expenses` | `POST` | **Output 5:** Rejects negative amount (`amount = -500`) with HTTP 400 `"Amount must be a positive number"` |
| `/api/expenses?search=Uber` | `GET` | **Output 6:** Searches description by keyword |
| `/api/expenses?startDate=...&endDate=...` | `GET` | **Output 7:** Filters expenses within date range |
| `/api/expenses?page=1&limit=2` | `GET` | **Output 8:** Returns paginated result set with metadata |
| `/api/expenses` | `POST` | **Output 9:** Creates new expense and returns HTTP 201 |
| `/api/expenses/:id` | `DELETE` | **Output 10:** Deletes expense and recalculates summary totals |
| `/api/expenses/reset-seed` | `POST` | Resets database to initial 5 sample records |

---

## 🧪 Automated Test Verification

Run the test suite to verify Outputs 1 through 10:
```bash
cd backend
npm test
```

---

## 📁 Submission Artifacts (Section 6)
* **Backend Source**: `backend/src/` (Express.js REST API)
* **Frontend Source**: `frontend/src/` (React + Vite)
* **Database Schema**: `backend/data/schema.sql` (MySQL schema + seeds)
* **API Documentation**: `postman/Expense_Tracker.postman_collection.json`
* **Security**: No real secrets or credentials committed (`.gitignore` configured).
