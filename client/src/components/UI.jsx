import { useState, useEffect, useMemo } from 'react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Badge({ status, variant, children }) {
  const s = (status || variant || 'draft').toLowerCase();
  return <span className={`badge badge-${s}`}>{children || s.replace(/_/g, ' ')}</span>;
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'max-w-3xl' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      {Icon && (typeof Icon === 'function' ? <Icon size={48} /> : Icon)}
      <p className="font-semibold text-gray-600 mt-2">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

const gradients = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
];

export function StatCard({ icon: Icon, label, value, sub, subtitle, index = 0 }) {
  const desc = sub || subtitle;
  return (
    <div className="stat-card fade-in" style={{ background: gradients[index % gradients.length] }}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon size={20} className="text-white" />
          </div>
        </div>
        <p className="text-white/70 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
        {desc && <p className="text-white/60 text-xs mt-1">{desc}</p>}
      </div>
    </div>
  );
}

const fmt = (n) => {
  if (n == null || isNaN(n)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};
export { fmt };

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
      {tabs.map(t => (
        <button key={t.key} className={`tab ${active === t.key ? 'tab-active' : ''}`} onClick={() => onChange(t.key)}>
          {t.label}
          {t.count !== undefined && <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, total, limit, onChange }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">Menampilkan {from}–{to} dari {total}</p>
      <div className="flex items-center gap-1.5">
        <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>&larr; Prev</button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onChange(p)}>{p}</button>
          );
        })}
        <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next &rarr;</button>
      </div>
    </div>
  );
}

export function usePagination(data, limit = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / limit);
  const paginated = data.slice((page - 1) * limit, page * limit);
  useEffect(() => { if (page > totalPages && totalPages > 0) setPage(totalPages); }, [totalPages, page]);
  return { page, setPage, totalPages, paginated, total: data.length, limit };
}
