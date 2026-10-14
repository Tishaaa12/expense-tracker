const path = require('path');
const fs = require('fs');

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

let db;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker';

  mongoose.connect(mongoUri)
    .then(() => {
      console.log(`Connected to MongoDB database at ${mongoUri}`);
    })
    .catch((err) => {
      console.error('MongoDB Connection Error:', err.message);
      console.log('Tip: Ensure MongoDB is running or set DB_TYPE=sqlite in .env for zero-config mode.');
    });

  db = {
    type: 'mongodb',
    mongoose
  };
} else if (DB_TYPE === 'mysql') {
  const mysql = require('mysql2/promise');
  
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'expense_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  pool.getConnection()
    .then((conn) => {
      console.log(`Connected to MySQL database [${process.env.MYSQL_DATABASE || 'expense_tracker'}] on ${process.env.MYSQL_HOST || 'localhost'}`);
      conn.release();
    })
    .catch((err) => {
      console.error('MySQL Connection Error:', err.message);
      console.log('Tip: Ensure MySQL is running and database exists, or set DB_TYPE=sqlite in .env for zero-config mode.');
    });

  db = {
    type: 'mysql',
    pool
  };
} else {
  // Default: SQLite (Zero-config embedded SQL database)
  const sqlite3 = require('sqlite3').verbose();
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'expenses.db');
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database at', dbPath);
    }
  });

  // Initialize SQLite Schema
  sqliteDb.serialize(() => {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Food', 'Travel', 'Shopping', 'Other')),
        date TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  db = {
    type: 'sqlite',
    instance: sqliteDb
  };
}

module.exports = db;
