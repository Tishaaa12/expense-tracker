import { Wallet } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            AI Expense Tracker
          </span>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
          <button
            type="button"
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
        </nav>
      </div>
    </header>
  );
}
