import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES, CATEGORY_STYLES, formatDateDisplay } from '../utils/constants';

export default function ExpensesTableView({
  expenses,
  loading,
  pagination,
  search,
  setSearch,
  category,
  setCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  order,
  setSortBy,
  setOrder,
  page,
  setPage,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden pb-1">
      {/* Header with Title & Action Button */}
      <div className="shrink-0 flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-xs text-slate-500">Search, filter and manage your expenses.</p>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </div>

      {/* Filter Bar */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs mb-3">
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            placeholder="Search by description"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="w-36">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <input
            type="date"
            value={startDate}
            title="From date"
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          />
        </div>

        <div className="w-32">
          <input
            type="date"
            value={endDate}
            title="To date"
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          />
        </div>

        <div className="w-36">
          <select
            value={`${sortBy}:${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              setSortBy(s);
              setOrder(o);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            <option value="date:desc">Newest first</option>
            <option value="date:asc">Oldest first</option>
            <option value="amount:desc">Highest amount</option>
            <option value="amount:asc">Lowest amount</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Scrollable Table Area ONLY */}
        <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-xs">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Description
                </th>
                <th scope="col" className="px-5 py-3">
                  Category
                </th>
                <th scope="col" className="px-5 py-3">
                  Date
                </th>
                <th scope="col" className="px-5 py-3">
                  Amount
                </th>
                <th scope="col" className="px-5 py-3 text-center w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400">
                    No expenses match your filters.
                  </td>
                </tr>
              ) : (
                expenses.map((item) => {
                  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Other;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDateDisplay(item.date)}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">
                        ₹{item.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => onEditExpense(item)}
                            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => onDeleteExpense(item)}
                            className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="shrink-0 flex items-center justify-between border-t border-slate-200 px-5 py-2.5 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing {expenses.length} of {pagination.totalRecords} records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="text-xs font-medium text-slate-600 px-1">
              {pagination.currentPage || 1} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
