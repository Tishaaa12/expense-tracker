import { Plus } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CATEGORIES, CATEGORY_STYLES } from '../utils/constants';

export default function DashboardView({ summary, onAddExpense }) {
  const sortedCategories = [...CATEGORIES]
    .map((c) => ({
      name: c,
      amount: summary.categoryTotals[c] || 0,
      percentage:
        summary.totalAmount > 0
          ? (((summary.categoryTotals[c] || 0) / summary.totalAmount) * 100).toFixed(1)
          : '0.0'
    }))
    .sort((a, b) => b.amount - a.amount);

  const largestCategory = sortedCategories[0] || { name: 'None', amount: 0 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-4 pb-2">
      {/* Header with Title & Action Button */}
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Financial overview</h1>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </div>

      {/* Unified 5-Card Metric Row */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Expenses Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Total
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹{summary.totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-400">
            All expenses
          </div>
        </div>

        {/* 4 Category Cards */}
        {CATEGORIES.map((cat) => {
          const amount = summary.categoryTotals[cat] || 0;
          const percentage =
            summary.totalAmount > 0
              ? ((amount / summary.totalAmount) * 100).toFixed(1)
              : '0';
          const style = CATEGORY_STYLES[cat];

          return (
            <div
              key={cat}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
                >
                  {cat}
                </span>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  ₹{amount.toLocaleString()}
                </div>
              </div>

              {/* Paired progress bar + percentage together */}
              <div className="mt-3 flex items-center gap-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 tabular-nums shrink-0">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Category Spending Comparison Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col">
          <div className="mb-2 shrink-0 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Category spending</h3>
              <p className="text-[10px] text-slate-500">Amounts by category (INR)</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              4 categories
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CATEGORIES.map((c) => ({
                  category: c,
                  amount: summary.categoryTotals[c] || 0
                }))}
                margin={{ top: 8, right: 10, left: -15, bottom: 0 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)', radius: 8 }}
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Total Spent']}
                  contentStyle={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    padding: '6px 10px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {CATEGORIES.map((c) => (
                    <Cell key={`bar-${c}`} fill={CATEGORY_STYLES[c]?.hex || '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut PieChart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col">
          <div className="mb-2 shrink-0">
            <h3 className="text-xs font-bold text-slate-900">Category breakdown</h3>
            <p className="text-[10px] text-slate-500">This month</p>
          </div>
          <div className="flex-1 flex items-center justify-between min-h-0">
            <div className="relative h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedCategories
                      .filter((c) => c.amount > 0)
                      .map((c) => ({ name: c.name, value: c.amount }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {sortedCategories
                      .filter((c) => c.amount > 0)
                      .map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={CATEGORY_STYLES[entry.name]?.hex || '#64748b'}
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      padding: '4px 8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Largest
                </div>
                <div className="text-xs font-bold text-slate-900">{largestCategory.name}</div>
              </div>
            </div>

            <div className="flex w-1/2 flex-col gap-1.5 pl-3">
              {sortedCategories
                .filter((c) => c.amount > 0)
                .map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_STYLES[c.name]?.hex || '#64748b' }}
                      />
                      <span className="font-semibold text-slate-700">{c.name}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{c.percentage}%</span>
                  </div>
                ))}
              {summary.totalAmount === 0 && (
                <div className="text-[11px] text-slate-400">No expense records found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
