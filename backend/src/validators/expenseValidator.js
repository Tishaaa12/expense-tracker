const { ALLOWED_CATEGORIES } = require('../seed/seedData');

function validateExpenseInput(data, isUpdate = false) {
  const errors = [];
  const { description, amount, category, date } = data;

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      errors.push('Description is required and cannot be empty.');
    }
  }

  if (!isUpdate || amount !== undefined) {
    if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount)) {
      errors.push('Amount must be a valid number.');
    } else if (amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  if (!isUpdate || category !== undefined) {
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
    }
  }

  if (!isUpdate || date !== undefined) {
    if (!date || typeof date !== 'string') {
      errors.push('Date is required (YYYY-MM-DD format).');
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date) || isNaN(Date.parse(date))) {
        errors.push('Date must be in valid YYYY-MM-DD format.');
      }
    }
  }

  return errors;
}

module.exports = {
  validateExpenseInput
};
