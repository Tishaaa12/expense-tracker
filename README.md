# Practical Assignment — Expense Tracker

A fullstack Expense Tracker built in strict compliance with the **Practical Assignment Requirements**.

- **Backend**: Node.js + Express.js (independent REST API)
- **Database**: SQLite (Zero-config embedded DB at `backend/data/expenses.db`)
- **Frontend**: React (Vite) + Lucide Icons + Modern Glassmorphic UI

---

## 🚀 Quick Start Instructions

### 1. Start the Backend Server (Port 5000)

```bash
cd backend
npm install
npm start
```
* The backend will start on `http://localhost:5000`.
* The database is automatically created and seeded with the initial 5 sample records.

### 2. Start the Frontend Application (Port 3000)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
* Open your browser and navigate to `http://localhost:3000`.

---

## 📊 Sample Initial Test Data

The backend seeds the 5 required records:

| Description | Amount | Category | Date |
| :--- | :--- | :--- | :--- |
| Dinner with client | 1500 | Food | 2026-10-09 |
| Uber ride | 450 | Travel | 2026-10-09 |
| Office supplies | 800 | Shopping | 2026-10-09 |
| Hotel booking | 3000 | Travel | 2026-10-09 |
| Team lunch | 1200 | Food | 2026-10-09 |

**Allowed categories**: `Food`, `Travel`, `Shopping`, `Other`.

---

## 📡 API Endpoints & Verification Checks

| Endpoint | Method | Purpose & Verification Output |
| :--- | :--- | :--- |
| `/api/expenses/summary` | `GET` | **Output 1:** Returns `{ totalAmount: 6950, categoryTotals: { Food: 2700, Travel: 3450, Shopping: 800, Other: 0 } }` |
| `/api/expenses?category=Food` | `GET` | **Output 2:** Filters by category (returns Dinner with client & Team lunch) |
| `/api/expenses?sortBy=amount&order=desc` | `GET` | **Output 3:** Sorts descending by amount: 3000, 1500, 1200, 800, 450 |
| `/api/expenses/:id` | `PUT` | **Output 4:** Updates Uber ride amount (e.g. 450 to 600) and recalculates summary |
| `/api/expenses` | `POST` | **Output 5:** Rejects negative amount (`amount = -500`) with HTTP 400 |
| `/api/expenses?search=Uber` | `GET` | **Output 6:** Searches description by keyword |
| `/api/expenses?startDate=...&endDate=...` | `GET` | **Output 7:** Filters expenses within date range |
| `/api/expenses?page=1&limit=2` | `GET` | **Output 8:** Returns paginated result set with metadata |
| `/api/expenses` | `POST` | **Output 9:** Creates new expense and returns HTTP 201 |
| `/api/expenses/:id` | `DELETE` | **Output 10:** Deletes expense and recalculates totals |
| `/api/expenses/reset-seed` | `POST` | Resets database to the initial 5 sample records |

---

## 🧪 Postman Collection & Automated Tests

- A Postman collection is provided in `postman/Expense_Tracker.postman_collection.json`.
- Automated test script is located in `backend/tests/api.test.js`.
