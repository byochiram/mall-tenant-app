import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gradients } from '../utils/constants';

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

export function Modal({ open, onClose, title, children, wide, closeOnOverlay = true }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) focusable.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && closeOnOverlay && onClose) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div ref={modalRef} className={`modal ${wide ? 'modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            <button onClick={onClose} className="modal-close" aria-label="Tutup">✕</button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} closeOnOverlay={false}>
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button className="btn btn-danger btn-sm" onClick={onConfirm}>Hapus</button>
      </div>
    </Modal>
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
