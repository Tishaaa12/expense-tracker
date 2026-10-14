import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ExpensesTableView from './components/ExpensesTableView';
import ExpenseModal from './components/ExpenseModal';
import DeleteModal from './components/DeleteModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'expenses'
  const [summary, setSummary] = useState({
    totalAmount: 0,
    categoryTotals: { Food: 0, Travel: 0, Shopping: 0, Other: 0 }
  });

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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

  // Fetch summary from backend GET /api/expenses/summary
  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/expenses/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to fetch summary from server.');
      }
    } catch {
      toast.error('Cannot connect to backend server. Make sure port 5000 is running.');
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
        toast.error(errData.error || 'Failed to fetch expenses.');
      }
    } catch {
      toast.error('Error fetching expenses from backend.');
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

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    setFormError('');

    const amt = Number(formData.amount);
    if (formData.amount === '' || isNaN(amt)) {
      setFormError('Please enter a valid amount.');
      toast.error('Please enter a valid amount.');
      return;
    }
    if (amt <= 0) {
      setFormError('Amount must be a positive number');
      toast.error('Amount must be a positive number');
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
        setFormError(data.error || 'Failed to save expense');
        toast.error(data.error || 'Failed to save expense');
        return;
      }

      setIsModalOpen(false);
      const cleanDesc = formData.description.trim();
      if (modalMode === 'create') {
        toast.success('Expense Created', {
          description: `Added "${cleanDesc}" for ₹${amt.toLocaleString()}`
        });
      } else {
        toast.success('Expense Updated', {
          description: `Updated "${cleanDesc}" to ₹${amt.toLocaleString()}`
        });
      }
      fetchExpenses();
      fetchSummary();
    } catch {
      setFormError('Could not reach backend API. Please check server.');
      toast.error('Could not reach backend API. Please check server.');
    }
  };

  const handleOpenDelete = (item) => {
    setDeletingExpense(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.error('Expense Deleted', {
          description: `Removed "${deletingExpense.description.trim()}" (₹${deletingExpense.amount.toLocaleString()})`
        });
        setIsDeleteModalOpen(false);
        setDeletingExpense(null);
        fetchExpenses();
        fetchSummary();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete expense.');
        setIsDeleteModalOpen(false);
      }
    } catch {
      toast.error('Network error while deleting expense.');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col antialiased font-sans text-slate-900">
      {/* Toast Notification Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px'
          }
        }}
      />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* View Switching */}
        {activeTab === 'dashboard' ? (
          <DashboardView summary={summary} onAddExpense={handleOpenCreate} />
        ) : (
          <ExpensesTableView
            expenses={expenses}
            loading={loading}
            pagination={pagination}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            sortBy={sortBy}
            order={order}
            setSortBy={setSortBy}
            setOrder={setOrder}
            page={page}
            setPage={setPage}
            onAddExpense={handleOpenCreate}
            onEditExpense={handleOpenEdit}
            onDeleteExpense={handleOpenDelete}
          />
        )}

        {/* Create / Edit Popup Modal */}
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          modalMode={modalMode}
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          onSubmit={handleSaveExpense}
        />

        {/* Delete Confirmation Popup Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingExpense(null);
          }}
          deletingExpense={deletingExpense}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
