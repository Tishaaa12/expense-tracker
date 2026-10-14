const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');

// GET /api/expenses/summary - Placed before /:id so 'summary' is not treated as an ID
router.get('/summary', ExpenseController.getSummary);

// POST /api/expenses - Create an expense
router.post('/', ExpenseController.createExpense);

// GET /api/expenses - List with filters, search, sort, pagination
router.get('/', ExpenseController.getExpenses);

// GET /api/expenses/:id - Get one expense
router.get('/:id', ExpenseController.getExpenseById);

// PUT /api/expenses/:id - Update an expense
router.put('/:id', ExpenseController.updateExpense);

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
