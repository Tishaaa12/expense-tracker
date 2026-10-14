const db = require('../config/database');

const ExpenseRepository = {
  create: (expense) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)';
      db.run(sql, [expense.description, expense.amount, expense.category, expense.date], function (err) {
        if (err) return reject(err);
        ExpenseRepository.findById(this.lastID)
          .then(resolve)
          .catch(reject);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM expenses WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  update: (id, updates) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE expenses
        SET description = ?, amount = ?, category = ?, date = ?
        WHERE id = ?
      `;
      db.run(
        sql,
        [updates.description, updates.amount, updates.category, updates.date, id],
        function (err) {
          if (err) return reject(err);
          if (this.changes === 0) return resolve(null);
          ExpenseRepository.findById(id).then(resolve).catch(reject);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM expenses WHERE id = ?';
      db.run(sql, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  },

  find: ({ search, category, startDate, endDate, sortBy = 'date', order = 'desc', page, limit }) => {
    return new Promise((resolve, reject) => {
      let conditions = [];
      let params = [];

      if (search && search.trim() !== '') {
        conditions.push('LOWER(description) LIKE ?');
        params.push(`%${search.trim().toLowerCase()}%`);
      }

      if (category && category.trim() !== '') {
        conditions.push('category = ?');
        params.push(category.trim());
      }

      if (startDate) {
        conditions.push('date >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('date <= ?');
        params.push(endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Validate sort fields to avoid SQL injection
      const allowedSortFields = {
        amount: 'amount',
        date: 'date',
        id: 'id',
        description: 'description',
        category: 'category'
      };
      const sortField = allowedSortFields[sortBy] || 'date';
      const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // First get total count
      const countSql = `SELECT COUNT(*) as total FROM expenses ${whereClause}`;
      db.get(countSql, params, (countErr, countRow) => {
        if (countErr) return reject(countErr);

        const totalRecords = countRow ? countRow.total : 0;

        let querySql = `SELECT * FROM expenses ${whereClause} ORDER BY ${sortField} ${sortOrder}, id DESC`;
        let queryParams = [...params];

        // Apply pagination if limit is specified
        if (limit !== undefined && limit !== null) {
          const numLimit = parseInt(limit, 10);
          const numPage = page ? parseInt(page, 10) : 1;
          const offset = (numPage - 1) * numLimit;
          querySql += ' LIMIT ? OFFSET ?';
          queryParams.push(numLimit, offset);

          db.all(querySql, queryParams, (dataErr, rows) => {
            if (dataErr) return reject(dataErr);
            const totalPages = Math.ceil(totalRecords / numLimit) || 1;
            resolve({
              expenses: rows,
              pagination: {
                totalRecords,
                totalPages,
                currentPage: numPage,
                limit: numLimit,
                hasNextPage: numPage < totalPages,
                hasPrevPage: numPage > 1
              }
            });
          });
        } else {
          // No pagination requested: return list directly (matching assignment output examples)
          db.all(querySql, queryParams, (dataErr, rows) => {
            if (dataErr) return reject(dataErr);
            resolve({
              expenses: rows,
              totalRecords
            });
          });
        }
      });
    });
  },

  getSummary: () => {
    return new Promise((resolve, reject) => {
      const totalSql = 'SELECT COALESCE(SUM(amount), 0) as totalAmount FROM expenses';
      const categorySql = `
        SELECT category, COALESCE(SUM(amount), 0) as categoryTotal
        FROM expenses
        GROUP BY category
      `;

      db.get(totalSql, (err, totalRow) => {
        if (err) return reject(err);
        const totalAmount = Math.round((totalRow ? totalRow.totalAmount : 0) * 100) / 100;

        db.all(categorySql, (catErr, catRows) => {
          if (catErr) return reject(catErr);

          // Standard 4 categories must always be present
          const categoryTotals = {
            Food: 0,
            Travel: 0,
            Shopping: 0,
            Other: 0
          };

          if (catRows) {
            for (const r of catRows) {
              if (r.category in categoryTotals) {
                categoryTotals[r.category] = Math.round(r.categoryTotal * 100) / 100;
              }
            }
          }

          resolve({
            totalAmount,
            categoryTotals
          });
        });
      });
    });
  }
};

module.exports = ExpenseRepository;
