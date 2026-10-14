import { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';
import './App.css';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Other'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'expenses'
  const [summary, setSummary] = useState({
    totalAmount: 0,
    categoryTotals: { Food: 0, Travel: 0, Shopping: 0, Other: 0 }
  });

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ message: '', type: 'success' }); // type: 'success' | 'error'

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1
  });

  // Create / Edit Modal popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal popup
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const showNotification = (message, type = 'success') => {
    setBanner({ message, type });
    setTimeout(() => {
      setBanner({ message: '', type: 'success' });
    }, 4500);
  };

  // Fetch summary from backend GET /api/expenses/summary
  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/expenses/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        const errData = await res.json();
        showNotification(errData.error || 'Failed to fetch summary from server.', 'error');
      }
    } catch (err) {
      showNotification('Cannot connect to backend server. Make sure port 5000 is running.', 'error');
    }
  };

  // Fetch expenses from backend GET /api/expenses with all active filters
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.expenses) {
          setExpenses(data.expenses);
          setPagination(data.pagination);
        } else {
          setExpenses(data);
        }
      } else {
        const errData = await res.json();
        showNotification(errData.error || 'Failed to fetch expenses.', 'error');
      }
    } catch (err) {
      showNotification('Error fetching expenses from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [search, category, startDate, endDate, sortBy, order, page, limit]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentExpenseId(null);
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setCurrentExpenseId(item.id);
    setFormData({
      description: item.description,
      amount: item.amount.toString(),
      category: item.category,
      date: item.date
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Real backend call: POST /api/expenses or PUT /api/expenses/:id
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    setFormError('');

    // Pre-validation matching Output 5
    const amt = Number(formData.amount);
    if (formData.amount === '' || isNaN(amt)) {
      setFormError('Please enter a valid amount.');
      return;
    }
    if (amt <= 0) {
      setFormError('Amount must be a positive number');
      return;
    }

    try {
      const url = modalMode === 'create' ? '/api/expenses' : `/api/expenses/${currentExpenseId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          amount: amt,
          category: formData.category,
          date: formData.date
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Displays backend validation errors in the popup box
        setFormError(data.error || 'Failed to save expense');
        return;
      }

      setIsModalOpen(false);
      showNotification(
        modalMode === 'create'
          ? `"${formData.description}" created successfully.`
          : `"${formData.description}" updated successfully.`,
        'success'
      );
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      setFormError('Could not reach backend API. Please check server.');
    }
  };

  // Open custom confirmation popup modal
  const handleOpenDelete = (item) => {
    setDeletingExpense(item);
    setIsDeleteModalOpen(true);
  };

  // Real backend call: DELETE /api/expenses/:id
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`"${deletingExpense.description}" deleted successfully.`, 'success');
        setIsDeleteModalOpen(false);
        setDeletingExpense(null);
        fetchExpenses();
        fetchSummary();
      } else {
        const data = await res.json();
        showNotification(data.error || 'Failed to delete expense.', 'error');
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      showNotification('Network error while deleting expense.', 'error');
      setIsDeleteModalOpen(false);
    }
  };

  // Reset to initial assignment dataset: POST /api/expenses/reset-seed
  const handleResetSampleData = async () => {
    try {
      const res = await fetch('/api/expenses/reset-seed', { method: 'POST' });
      if (res.ok) {
        showNotification('Database reset to initial 5 sample records.', 'success');
        fetchExpenses();
        fetchSummary();
      } else {
        showNotification('Failed to reset sample data.', 'error');
      }
    } catch (err) {
      showNotification('Network error while resetting data.', 'error');
    }
  };

  const formatDateDisplay = (dStr) => {
    try {
      const [y, m, d] = dStr.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    } catch {
      return dStr;
    }
  };

  // Dynamic calculations for category distribution and largest category
  const sortedCategories = [...CATEGORIES]
    .map((c) => ({
      name: c,
      amount: summary.categoryTotals[c] || 0,
      percentage: summary.totalAmount > 0 ? (((summary.categoryTotals[c] || 0) / summary.totalAmount) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.amount - a.amount);

  const largestCategory = sortedCategories[0] || { name: 'None', amount: 0 };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="app-navbar">
        <div className="nav-left">
          <div className="brand-badge">
            <div className="brand-icon-box">
              <Wallet size={20} />
            </div>
            <span>AI Expense Tracker</span>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
          </nav>
        </div>

        <div className="nav-right">
          <button
            className="btn-secondary"
            onClick={handleResetSampleData}
            title="Reset to initial 5 records"
          >
            <RotateCcw size={15} /> Reset Seed
          </button>
        </div>
      </header>

      {/* GLOBAL NOTIFICATION BANNER (Success & Error feedback) */}
      {banner.message && (
        <div className={`feedback-banner ${banner.type}`}>
          {banner.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{banner.message}</span>
        </div>
      )}

      {/* SCREEN 1: FINANCIAL OVERVIEW / DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Financial Overview</h1>
              <p className="page-subtitle">Your spending across all categories, in INR.</p>
            </div>

            <div className="header-actions">
              <div className="month-pill-group">
                <button className="month-pill">Sep</button>
                <button className="month-pill active">Oct 2026</button>
                <button className="month-pill">Nov</button>
              </div>

              <button className="btn-teal" onClick={handleOpenCreate}>
                <Plus size={18} /> Add expense
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="overview-metrics-grid">
            <div className="metric-card">
              <div className="metric-card-label">TOTAL EXPENSES (OVERALL)</div>
              <div className="metric-card-amount">₹{summary.totalAmount.toLocaleString()}</div>
              <div className="metric-card-subtext">Overall total of all expenses</div>
            </div>

            <div className="metric-card">
              <div className="metric-card-label">TOTAL RECORDS</div>
              <div className="metric-card-amount">{pagination.totalRecords}</div>
              <div className="metric-card-subtext">Total persisted records in database</div>
            </div>
          </div>

          {/* Totals by category (Dynamic from GET /api/expenses/summary) */}
          <h2 className="category-section-title">Totals by category</h2>
          <div className="category-cards-grid">
            {CATEGORIES.map((cat) => {
              const amount = summary.categoryTotals[cat] || 0;
              const percentage = summary.totalAmount > 0 ? ((amount / summary.totalAmount) * 100).toFixed(1) : 0;
              return (
                <div key={cat} className="cat-overview-card">
                  <div className={`cat-pill ${cat}`}>{cat}</div>
                  <div className="cat-overview-amount">₹{amount.toLocaleString()}</div>
                  <div className="cat-progress-track">
                    <div
                      className={`cat-progress-fill ${cat}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="cat-percentage-label">{percentage}% of total</div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Charts Row */}
          <div className="charts-grid">
            {/* Spending Trend Bar Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Spending trend</div>
                <div className="chart-subtitle">Last 6 months (INR)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '20px', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  <span>₹8,000</span>
                  <span>₹6,000</span>
                  <span>₹4,000</span>
                  <span>₹0</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      ₹{summary.totalAmount.toLocaleString()}
                    </div>
                    <div style={{
                      width: '48px',
                      height: `${Math.min(140, Math.max(10, (summary.totalAmount / 8000) * 140))}px`,
                      backgroundColor: 'var(--accent-teal)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Oct 26</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown Donut / Summary */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Category breakdown</div>
                <div className="chart-subtitle">This month</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '180px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Largest</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                    {largestCategory.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ₹{largestCategory.amount.toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  {sortedCategories.filter(c => c.amount > 0).map((c) => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`cat-progress-fill ${c.name}`} style={{ width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' }} />
                      <span>{c.name} ({c.percentage}%)</span>
                    </div>
                  ))}
                  {summary.totalAmount === 0 && (
                    <div style={{ color: 'var(--text-muted)' }}>No expense data yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: EXPENSES TABLE & CONTROLS */}
      {activeTab === 'expenses' && (
        <div>
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Expenses</h1>
              <p className="page-subtitle">Search, filter and manage your expenses.</p>
            </div>
            <button className="btn-teal" onClick={handleOpenCreate}>
              <Plus size={18} /> Add expense
            </button>
          </div>

          {/* Filter Bar */}
          <div className="filter-row">
            <div className="filter-field" style={{ flex: '1 1 240px' }}>
              <label className="filter-label">Search description</label>
              <input
                type="text"
                className="input-box"
                placeholder="Search by description"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="filter-field" style={{ width: '170px' }}>
              <label className="filter-label">Category</label>
              <select
                className="input-box"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label className="filter-label">From</label>
              <input
                type="date"
                className="input-box"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="filter-field">
              <label className="filter-label">To</label>
              <input
                type="date"
                className="input-box"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Sort By Field */}
          <div style={{ marginBottom: '20px' }}>
            <div className="filter-field" style={{ width: '220px' }}>
              <label className="filter-label">Sort by</label>
              <select
                className="input-box"
                value={`${sortBy}:${order}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split(':');
                  setSortBy(s);
                  setOrder(o);
                }}
              >
                <option value="date:desc">Date: newest first</option>
                <option value="date:asc">Date: oldest first</option>
                <option value="amount:desc">Amount: highest first</option>
                <option value="amount:asc">Amount: lowest first</option>
              </select>
            </div>
          </div>

          {/* Table Card */}
          <div className="table-card">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No expenses match your filters.
                    </td>
                  </tr>
                ) : (
                  expenses.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.description}</td>
                      <td>
                        <span className={`cat-pill ${item.category}`}>{item.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDateDisplay(item.date)}</td>
                      <td className="table-amount">₹{item.amount.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            title="Edit"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}
                            title="Delete"
                            onClick={() => handleOpenDelete(item)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div>
                Showing {expenses.length} of {pagination.totalRecords}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span>{pagination.currentPage || 1} / {pagination.totalPages || 1}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT POPUP MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title">{modalMode === 'create' ? 'Add Expense' : 'Edit Expense'}</h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Inline Error Box in Popup Modal */}
            {formError && (
              <div className="modal-error-box">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExpense}>
              <div style={{ marginBottom: '16px' }}>
                <label className="filter-label" style={{ marginBottom: '6px', display: 'block' }}>Description</label>
                <input
                  type="text"
                  className="input-box"
                  style={{ width: '100%' }}
                  placeholder="e.g. Dinner with client"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="filter-label" style={{ marginBottom: '6px', display: 'block' }}>Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  className="input-box"
                  style={{ width: '100%' }}
                  placeholder="e.g. 1500"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="filter-label" style={{ marginBottom: '6px', display: 'block' }}>Category</label>
                <select
                  className="input-box"
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="filter-label" style={{ marginBottom: '6px', display: 'block' }}>Date</label>
                <input
                  type="date"
                  className="input-box"
                  style={{ width: '100%' }}
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-teal">
                  {modalMode === 'create' ? 'Add Expense' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP MODAL */}
      {isDeleteModalOpen && deletingExpense && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title" style={{ color: '#e11d48' }}>Delete Expense</h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deletingExpense.description}"</strong> (₹{deletingExpense.amount.toLocaleString()})?
              This action cannot be undone and will update summary totals.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingExpense(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
