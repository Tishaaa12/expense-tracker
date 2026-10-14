-- Expense Tracker MySQL Schema & Seed Script
-- Practical Assignment Compliance: Section 1, 2, 6

CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Table Definition matching Section 1 & Section 2
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category ENUM('Food', 'Travel', 'Shopping', 'Other') NOT NULL,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial 5 Sample Expense Records (Assignment Section 2)
INSERT INTO expenses (description, amount, category, date) VALUES
('Dinner with client', 1500.00, 'Food', '2026-10-09'),
('Uber ride', 450.00, 'Travel', '2026-10-09'),
('Office supplies', 800.00, 'Shopping', '2026-10-09'),
('Hotel booking', 3000.00, 'Travel', '2026-10-09'),
('Team lunch', 1200.00, 'Food', '2026-10-09');
