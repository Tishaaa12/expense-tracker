const db = require('../config/database');
const Expense = require('../models/Expense');

const ExpenseRepository = {
  // CREATE
  create: async (expense) => {
    if (db.type === 'mongodb') {
      const doc = await Expense.create({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      });
      return doc.toJSON();
    } else if (db.type === 'mysql') {
      const sql = 'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)';
      const [result] = await db.pool.execute(sql, [expense.description, expense.amount, expense.category, expense.date]);
      return ExpenseRepository.findById(result.insertId);
    } else {
      return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)';
        db.instance.run(sql, [expense.description, expense.amount, expense.category, expense.date], function (err) {
          if (err) return reject(err);
          ExpenseRepository.findById(this.lastID).then(resolve).catch(reject);
        });
      });
    }
  },

  // FIND BY ID
  findById: async (id) => {
    if (db.type === 'mongodb') {
      const doc = await Expense.findById(id);
      return doc ? doc.toJSON() : null;
    } else if (db.type === 'mysql') {
      const sql = 'SELECT * FROM expenses WHERE id = ?';
      const [rows] = await db.pool.execute(sql, [id]);
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return { ...r, amount: Number(r.amount) };
    } else {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM expenses WHERE id = ?';
        db.instance.get(sql, [id], (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        });
      });
    }
  },

  // UPDATE
  update: async (id, updates) => {
    if (db.type === 'mongodb') {
      const doc = await Expense.findByIdAndUpdate(
        id,
        {
          description: updates.description,
          amount: updates.amount,
          category: updates.category,
          date: updates.date
        },
        { new: true, runValidators: true }
      );
      return doc ? doc.toJSON() : null;
    } else if (db.type === 'mysql') {
      const sql = `
        UPDATE expenses
        SET description = ?, amount = ?, category = ?, date = ?
        WHERE id = ?
      `;
      const [result] = await db.pool.execute(sql, [updates.description, updates.amount, updates.category, updates.date, id]);
      if (result.affectedRows === 0) return null;
      return ExpenseRepository.findById(id);
    } else {
      return new Promise((resolve, reject) => {
        const sql = `
          UPDATE expenses
          SET description = ?, amount = ?, category = ?, date = ?
          WHERE id = ?
        `;
        db.instance.run(
          sql,
          [updates.description, updates.amount, updates.category, updates.date, id],
          function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return resolve(null);
            ExpenseRepository.findById(id).then(resolve).catch(reject);
          }
        );
      });
    }
  },

  // DELETE
  delete: async (id) => {
    if (db.type === 'mongodb') {
      const doc = await Expense.findByIdAndDelete(id);
      return !!doc;
    } else if (db.type === 'mysql') {
      const sql = 'DELETE FROM expenses WHERE id = ?';
      const [result] = await db.pool.execute(sql, [id]);
      return result.affectedRows > 0;
    } else {
      return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM expenses WHERE id = ?';
        db.instance.run(sql, [id], function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        });
      });
    }
  },

  // FIND WITH SEARCH, FILTERS, SORT & PAGINATION
  find: async ({ search, category, startDate, endDate, sortBy, order, page, limit }) => {
    if (db.type === 'mongodb') {
      const query = {};
      if (search) {
        query.description = { $regex: search, $options: 'i' };
      }
      if (category) {
        query.category = category;
      }
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
      }

      const sortField = sortBy === 'amount' ? 'amount' : 'date';
      const sortOrder = order && order.toLowerCase() === 'asc' ? 1 : -1;
      const sortObj = { [sortField]: sortOrder, _id: -1 };

      const totalRecords = await Expense.countDocuments(query);

      let q = Expense.find(query).sort(sortObj);

      if (limit !== undefined && limit !== null) {
        const numLimit = parseInt(limit, 10);
        const numPage = page ? parseInt(page, 10) : 1;
        const skip = (numPage - 1) * numLimit;
        q = q.skip(skip).limit(numLimit);

        const docs = await q;
        const totalPages = Math.ceil(totalRecords / numLimit) || 1;

        return {
          expenses: docs.map(d => d.toJSON()),
          pagination: {
            totalRecords,
            totalPages,
            currentPage: numPage,
            limit: numLimit,
            hasNextPage: numPage < totalPages,
            hasPrevPage: numPage > 1
          }
        };
      } else {
        const docs = await q;
        return {
          expenses: docs.map(d => d.toJSON()),
          totalRecords
        };
      }
    }

    // SQL based (MySQL & SQLite)
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('description LIKE ?');
      params.push(`%${search}%`);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
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
    const sortField = sortBy === 'amount' ? 'amount' : 'date';
    const sortOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (db.type === 'mysql') {
      const countSql = `SELECT COUNT(*) as total FROM expenses ${whereClause}`;
      const [countRows] = await db.pool.execute(countSql, params);
      const totalRecords = countRows[0].total;

      let querySql = `SELECT * FROM expenses ${whereClause} ORDER BY ${sortField} ${sortOrder}, id DESC`;
      let queryParams = [...params];

      if (limit !== undefined && limit !== null) {
        const numLimit = parseInt(limit, 10);
        const numPage = page ? parseInt(page, 10) : 1;
        const offset = (numPage - 1) * numLimit;
        querySql += ` LIMIT ${numLimit} OFFSET ${offset}`;

        const [rows] = await db.pool.execute(querySql, queryParams);
        const totalPages = Math.ceil(totalRecords / numLimit) || 1;
        const formattedRows = rows.map(r => ({ ...r, amount: Number(r.amount) }));

        return {
          expenses: formattedRows,
          pagination: {
            totalRecords,
            totalPages,
            currentPage: numPage,
            limit: numLimit,
            hasNextPage: numPage < totalPages,
            hasPrevPage: numPage > 1
          }
        };
      } else {
        const [rows] = await db.pool.execute(querySql, queryParams);
        const formattedRows = rows.map(r => ({ ...r, amount: Number(r.amount) }));
        return {
          expenses: formattedRows,
          totalRecords
        };
      }
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const countSql = `SELECT COUNT(*) as total FROM expenses ${whereClause}`;
        db.instance.get(countSql, params, (countErr, countRow) => {
          if (countErr) return reject(countErr);
          const totalRecords = countRow ? countRow.total : 0;

          let querySql = `SELECT * FROM expenses ${whereClause} ORDER BY ${sortField} ${sortOrder}, id DESC`;
          let queryParams = [...params];

          if (limit !== undefined && limit !== null) {
            const numLimit = parseInt(limit, 10);
            const numPage = page ? parseInt(page, 10) : 1;
            const offset = (numPage - 1) * numLimit;
            querySql += ' LIMIT ? OFFSET ?';
            queryParams.push(numLimit, offset);

            db.instance.all(querySql, queryParams, (dataErr, rows) => {
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
            db.instance.all(querySql, queryParams, (dataErr, rows) => {
              if (dataErr) return reject(dataErr);
              resolve({
                expenses: rows,
                totalRecords
              });
            });
          }
        });
      });
    }
  },

  // SUMMARY
  getSummary: async () => {
    if (db.type === 'mongodb') {
      const stats = await Expense.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      const catStats = await Expense.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ]);

      const totalAmount = stats.length > 0 ? Math.round(stats[0].totalAmount * 100) / 100 : 0;
      const categoryTotals = { Food: 0, Travel: 0, Shopping: 0, Other: 0 };

      for (const item of catStats) {
        if (item._id in categoryTotals) {
          categoryTotals[item._id] = Math.round(item.total * 100) / 100;
        }
      }

      return { totalAmount, categoryTotals };
    } else if (db.type === 'mysql') {
      const [totalRows] = await db.pool.execute('SELECT COALESCE(SUM(amount), 0) as totalAmount FROM expenses');
      const totalAmount = Math.round(Number(totalRows[0]?.totalAmount || 0) * 100) / 100;

      const [catRows] = await db.pool.execute(`
        SELECT category, COALESCE(SUM(amount), 0) as categoryTotal
        FROM expenses
        GROUP BY category
      `);

      const categoryTotals = { Food: 0, Travel: 0, Shopping: 0, Other: 0 };
      if (catRows) {
        for (const r of catRows) {
          if (r.category in categoryTotals) {
            categoryTotals[r.category] = Math.round(Number(r.categoryTotal) * 100) / 100;
          }
        }
      }

      return { totalAmount, categoryTotals };
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const totalSql = 'SELECT COALESCE(SUM(amount), 0) as totalAmount FROM expenses';
        const categorySql = `
          SELECT category, COALESCE(SUM(amount), 0) as categoryTotal
          FROM expenses
          GROUP BY category
        `;

        db.instance.get(totalSql, (err, totalRow) => {
          if (err) return reject(err);
          const totalAmount = Math.round((totalRow ? totalRow.totalAmount : 0) * 100) / 100;

          db.instance.all(categorySql, (catErr, catRows) => {
            if (catErr) return reject(catErr);
            const categoryTotals = { Food: 0, Travel: 0, Shopping: 0, Other: 0 };
            if (catRows) {
              for (const r of catRows) {
                if (r.category in categoryTotals) {
                  categoryTotals[r.category] = Math.round(r.categoryTotal * 100) / 100;
                }
              }
            }
            resolve({ totalAmount, categoryTotals });
          });
        });
      });
    }
  }
};

module.exports = ExpenseRepository;
