const db = require('../config/database');

const ALLOWED_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Other'];

const SAMPLE_DATA = [
  { description: 'Dinner with client', amount: 1500, category: 'Food', date: '2026-10-09' },
  { description: 'Uber ride', amount: 450, category: 'Travel', date: '2026-10-09' },
  { description: 'Office supplies', amount: 800, category: 'Shopping', date: '2026-10-09' },
  { description: 'Hotel booking', amount: 3000, category: 'Travel', date: '2026-10-09' },
  { description: 'Team lunch', amount: 1200, category: 'Food', date: '2026-10-09' }
];

async function seedDatabase(force = false) {
  if (db.type === 'mysql') {
    try {
      const [rows] = await db.pool.execute('SELECT COUNT(*) as count FROM expenses');
      const count = Number(rows[0]?.count || 0);

      if (count === 0 || force) {
        if (force) {
          await db.pool.execute('TRUNCATE TABLE expenses');
        }
        for (const item of SAMPLE_DATA) {
          await db.pool.execute(
            'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
            [item.description, item.amount, item.category, item.date]
          );
        }
        console.log('Sample expense data successfully seeded into MySQL.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('MySQL Seed error:', err.message);
      return false;
    }
  } else {
    // SQLite
    return new Promise((resolve, reject) => {
      db.instance.get('SELECT COUNT(*) as count FROM expenses', (err, row) => {
        if (err) return reject(err);

        if (row.count === 0 || force) {
          db.instance.serialize(() => {
            if (force) {
              db.instance.run('DELETE FROM expenses');
              db.instance.run('DELETE FROM sqlite_sequence WHERE name="expenses"');
            }
            const stmt = db.instance.prepare('INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)');
            for (const item of SAMPLE_DATA) {
              stmt.run(item.description, item.amount, item.category, item.date);
            }
            stmt.finalize((finalizeErr) => {
              if (finalizeErr) return reject(finalizeErr);
              console.log('Sample expense data successfully seeded into SQLite.');
              resolve(true);
            });
          });
        } else {
          resolve(false);
        }
      });
    });
  }
}

module.exports = {
  ALLOWED_CATEGORIES,
  SAMPLE_DATA,
  seedDatabase
};
