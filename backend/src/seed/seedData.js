const db = require('../config/database');

const ALLOWED_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Other'];

const SAMPLE_DATA = [
  { description: 'Dinner with client', amount: 1500, category: 'Food', date: '2026-10-09' },
  { description: 'Uber ride', amount: 450, category: 'Travel', date: '2026-10-09' },
  { description: 'Office supplies', amount: 800, category: 'Shopping', date: '2026-10-09' },
  { description: 'Hotel booking', amount: 3000, category: 'Travel', date: '2026-10-09' },
  { description: 'Team lunch', amount: 1200, category: 'Food', date: '2026-10-09' }
];

function seedDatabase(force = false) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM expenses', (err, row) => {
      if (err) return reject(err);

      if (row.count === 0 || force) {
        db.serialize(() => {
          if (force) {
            db.run('DELETE FROM expenses');
            db.run('DELETE FROM sqlite_sequence WHERE name="expenses"');
          }
          const stmt = db.prepare('INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)');
          for (const item of SAMPLE_DATA) {
            stmt.run(item.description, item.amount, item.category, item.date);
          }
          stmt.finalize((finalizeErr) => {
            if (finalizeErr) return reject(finalizeErr);
            console.log('Sample expense data successfully seeded.');
            resolve(true);
          });
        });
      } else {
        console.log(`Database already contains ${row.count} records. Skipping seed.`);
        resolve(false);
      }
    });
  });
}

module.exports = {
  ALLOWED_CATEGORIES,
  SAMPLE_DATA,
  seedDatabase
};
