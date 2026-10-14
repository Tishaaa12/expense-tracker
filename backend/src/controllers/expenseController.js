const ExpenseRepository = require('../repositories/expenseRepository');
const { validateExpenseInput } = require('../validators/expenseValidator');

const ExpenseController = {
  // POST /api/expenses
  createExpense: async (req, res) => {
    try {
      let { description, amount, category, date } = req.body;
      if (typeof amount === 'string' && amount.trim() !== '') {
        amount = Number(amount);
      }

      const errors = validateExpenseInput({ description, amount, category, date }, false);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      const created = await ExpenseRepository.create({
        description: description.trim(),
        amount: Number(amount),
        category,
        date
      });

      return res.status(201).json(created);
    } catch (err) {
      console.error('Error creating expense:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // GET /api/expenses
  getExpenses: async (req, res) => {
    try {
      const { search, category, startDate, endDate, sortBy, order, page, limit } = req.query;

      const result = await ExpenseRepository.find({
        search,
        category,
        startDate,
        endDate,
        sortBy,
        order,
        page,
        limit
      });

      // If pagination was requested, return object with expenses & pagination metadata
      if (limit !== undefined && limit !== null) {
        return res.status(200).json(result);
      }

      // Otherwise return array directly for simple client consumption & standard tests
      return res.status(200).json(result.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // GET /api/expenses/summary
  getSummary: async (req, res) => {
    try {
      const summary = await ExpenseRepository.getSummary();
      return res.status(200).json(summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // GET /api/expenses/:id
  getExpenseById: async (req, res) => {
    try {
      const id = req.params.id;
      const expense = await ExpenseRepository.findById(id);
      if (!expense) {
        return res.status(404).json({ error: `Expense with ID ${id} not found.` });
      }
      return res.status(200).json(expense);
    } catch (err) {
      console.error('Error fetching expense by id:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // PUT /api/expenses/:id
  updateExpense: async (req, res) => {
    try {
      const id = req.params.id;
      const existing = await ExpenseRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: `Expense with ID ${id} not found.` });
      }

      let { description, amount, category, date } = req.body;
      if (amount !== undefined && typeof amount === 'string') {
        amount = Number(amount);
      }

      const mergedData = {
        description: description !== undefined ? description : existing.description,
        amount: amount !== undefined ? amount : existing.amount,
        category: category !== undefined ? category : existing.category,
        date: date !== undefined ? date : existing.date
      };

      const errors = validateExpenseInput(mergedData, true);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      const updated = await ExpenseRepository.update(id, {
        description: mergedData.description.trim(),
        amount: Number(mergedData.amount),
        category: mergedData.category,
        date: mergedData.date
      });

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating expense:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // DELETE /api/expenses/:id
  deleteExpense: async (req, res) => {
    try {
      const id = req.params.id;
      const existing = await ExpenseRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: `Expense with ID ${id} not found.` });
      }

      await ExpenseRepository.delete(id);
      return res.status(200).json({ message: 'Expense deleted successfully', id: Number(id) });
    } catch (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = ExpenseController;
