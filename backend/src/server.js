require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const expenseRoutes = require('./routes/expenseRoutes');
const { seedDatabase } = require('./seed/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Seed sample data on launch
seedDatabase().catch((err) => {
  console.error('Failed to seed database:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Expenses API
app.use('/api/expenses', expenseRoutes);

// Reset seed endpoint for convenience during evaluations/testing
app.post('/api/expenses/reset-seed', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ message: 'Database reset to initial sample data successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset seed data' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export app for testing and start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Expense Tracker Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
