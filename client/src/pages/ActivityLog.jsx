import { useState, useEffect, useCallback } from 'react';
import { getActivityLogs } from '../services/api';
import { Loading, Pagination } from '../components/UI';
import { Activity, User, Shield, Clock, Filter } from 'lucide-react';

const ACTION_COLORS = {
  create: { bg: '#ecfdf5', text: '#065f46', label: 'Buat' },
  update: { bg: '#eff6ff', text: '#1e40af', label: 'Edit' },
  delete: { bg: '#fef2f2', text: '#991b1b', label: 'Hapus' },
  login: { bg: '#f5f3ff', text: '#5b21b6', label: 'Login' },
  terminate: { bg: '#fef2f2', text: '#991b1b', label: 'Terminasi' },
  approve: { bg: '#ecfdf5', text: '#065f46', label: 'Approve' },
  verify: { bg: '#ecfdf5', text: '#065f46', label: 'Verifikasi' },
};

const MODULE_LABELS = {
  auth: 'Autentikasi',
  tenant: 'Tenant',
  unit: 'Unit',
  contract: 'Kontrak',
  billing: 'Billing',
  payment: 'Pembayaran',
  notification: 'Notifikasi',
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;
      const { data } = await getActivityLogs(params);
      setLogs(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [page, moduleFilter, actionFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [moduleFilter, actionFilter]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && logs.length === 0) return <Loading />;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Activity Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">Riwayat aktivitas seluruh pengguna sistem</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select className="input" style={{ width: 'auto', minWidth: 120 }} value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
          <option value="">Semua Modul</option>
          {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" style={{ width: 'auto', minWidth: 120 }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="">Semua Aksi</option>
          {Object.entries(ACTION_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-sm text-gray-400 self-center">{total} aktivitas</span>
      </div>

      {logs.length === 0 ? (
        <div className="card p-10 text-center">
          <Activity size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Belum ada aktivitas tercatat</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const action = ACTION_COLORS[log.action] || { bg: '#f1f5f9', text: '#475569', label: log.action };
            return (
              <div key={log.id} className="card p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: action.bg }}>
                  <span className="text-xs font-bold" style={{ color: action.text }}>{action.label[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{log.userName}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: action.bg, color: action.text }}>{action.label}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{MODULE_LABELS[log.module] || log.module}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  {log.entityName && (
                    <p className="text-xs text-gray-400 mt-1">→ {log.entityName}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                  <p className="text-[11px] text-gray-300 capitalize">{log.userRole?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} limit={30} onChange={setPage} />
    </div>
  );
}
