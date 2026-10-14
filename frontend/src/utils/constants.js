export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Other'];

export const CATEGORY_STYLES = {
  Food: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
    hex: '#f59e0b'
  },
  Travel: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    bar: 'bg-blue-500',
    hex: '#3b82f6'
  },
  Shopping: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    bar: 'bg-purple-500',
    hex: '#a855f7'
  },
  Other: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    bar: 'bg-slate-500',
    hex: '#64748b'
  }
};

export const formatDateDisplay = (dStr) => {
  if (!dStr) return '';
  try {
    const [y, m, d] = dStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
  } catch {
    return dStr;
  }
};
