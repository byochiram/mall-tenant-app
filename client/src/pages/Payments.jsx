import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getPayments, createPayment, verifyPayment, deletePayment, getAging, getTenants } from '../services/api';
import { Badge, Modal, Loading, ConfirmModal, fmt, Tabs, Pagination } from '../components/UI';
import { Plus, CreditCard, CheckCircle, XCircle, Trash2, AlertTriangle, DollarSign, Search, Clock, CheckCircle2, ArrowUpRight, TrendingDown, Shield } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending_verification', label: 'Pending Verifikasi' },
  { key: 'verified', label: 'Terverifikasi' },
  { key: 'rejected', label: 'Ditolak' },
];

const METHODS = [
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'cash', label: 'Tunai' },
  { value: 'cheque', label: 'Cek' },
  { value: 'virtual_account', label: 'Virtual Account' },
  { value: 'ewallet', label: 'E-Wallet' },
];

import { gradients } from '../utils/constants';

const BUCKETS = [
  { key: 'current', label: 'Current', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { key: 'days30', label: '1-30 hari', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' },
  { key: 'days60', label: '31-60 hari', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700' },
  { key: 'days90', label: '61-90 hari', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700' },
  { key: 'over90', label: '>90 hari', color: '#dc2626', bg: 'bg-red-100', text: 'text-red-800' },
];

export default function Payments() {
  const [tab, setTab] = useState('all');
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAging, setShowAging] = useState(false);
  const [aging, setAging] = useState(null);
  const [agingLoading, setAgingLoading] = useState(false);
  const [form, setForm] = useState({ tenantId: '', invoiceId: '', amount: '', paymentMethod: 'transfer', bankName: '', referenceNo: '', paymentDate: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') params.status = tab;
      const { data } = await getPayments(params);
      setPayments(Array.isArray(data) ? data : []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getTenants({ limit: 200 }).then(({ data }) => setTenants(data?.data || [])).catch(() => {}); }, []);

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.paymentNo?.toLowerCase().includes(q) || p.tenant?.businessName?.toLowerCase().includes(q);
  });

  const PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => { setPage(1); }, [search, tab]);

  const loadAging = async () => {
    setAgingLoading(true);
    try { const { data } = await getAging(); setAging(data); }
    catch {} finally { setAgingLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createPayment({ ...form, tenantId: Number(form.tenantId), invoiceId: form.invoiceId ? Number(form.invoiceId) : undefined, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ tenantId: '', invoiceId: '', amount: '', paymentMethod: 'transfer', bankName: '', referenceNo: '', paymentDate: '', notes: '' });
      toast.success('Pembayaran berhasil ditambahkan');
      load();
    } catch (err) { toast.error('Gagal menambah pembayaran'); console.error(err); } finally { setSaving(false); }
  };

  const handleVerify = async (id, status) => { try { await verifyPayment(id, { status }); toast.success('Pembayaran berhasil diverifikasi'); load(); } catch (err) { toast.error('Gagal verifikasi'); console.error(err); } };
  const handleDelete = async () => { try { await deletePayment(deleteId); setDeleteId(null); toast.success('Pembayaran dihapus'); load(); } catch (err) { toast.error('Gagal menghapus'); console.error(err); } };

  const stats = useMemo(() => ({
    total: payments.length,
    totalAmount: payments.reduce((s, p) => s + (p.amount || 0), 0),
    verified: payments.filter(p => p.status === 'verified').length,
    pending: payments.filter(p => p.status === 'pending_verification').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  }), [payments]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pembayaran</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Verifikasi dan kelola pembayaran dari tenant</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (!showAging) loadAging(); setShowAging(!showAging); }} className="btn btn-secondary btn-sm">
            <AlertTriangle size={14} /> {showAging ? 'Sembunyikan' : 'Lihat'} Aging
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Catat Pembayaran
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: CreditCard, label: 'Total Pembayaran', value: stats.total, sub: fmt(stats.totalAmount), gradient: gradients[0] },
          { icon: CheckCircle2, label: 'Terverifikasi', value: stats.verified, sub: 'pembayaran', gradient: gradients[1] },
          { icon: Clock, label: 'Pending Verifikasi', value: stats.pending, sub: 'perlu ditinjau', gradient: gradients[2] },
          { icon: XCircle, label: 'Ditolak', value: stats.rejected, sub: 'pembayaran', gradient: gradients[3] },
        ].map(s => (
          <div key={s.label} className="card overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.gradient }}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                <p className="text-[17px] font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.sub}</p>
              </div>
            </div>
            <div className="h-0.5" style={{ background: s.gradient }} />
          </div>
        ))}
      </div>

      {/* Aging Report */}
      {showAging && (
        <div className="card overflow-hidden fade-in">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle size={14} className="text-amber-600" /></div>
            <div>
              <h3 className="text-[13px] font-semibold text-gray-900">Aging Report</h3>
              <p className="text-[11px] text-gray-400">Umur piutang berdasarkan jatuh tempo</p>
            </div>
          </div>
          <div className="p-5">
            {agingLoading ? <Loading /> : aging?.summary ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {BUCKETS.map(b => {
                  const s = aging.summary[b.key] || { count: 0, total: 0 };
                  return (
                    <div key={b.key} className="rounded-xl p-4" style={{ background: `${b.color}08`, border: `1px solid ${b.color}20` }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                        <p className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{s.count}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{fmt(s.total)}</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-[13px] text-gray-400 text-center py-4">Tidak ada data aging</p>}
          </div>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="input-icon-wrapper w-full sm:w-64">
          <Search size={16} className="input-icon" />
          <input className="input input-sm" placeholder="Cari pembayaran..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[13px] text-gray-500 font-medium">Tidak ada pembayaran</p>
          <p className="text-[12px] text-gray-400 mt-1">Catat pembayaran pertama dari tenant</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Pembayaran</th><th>Tenant</th><th>Invoice</th>
                <th className="text-right">Jumlah</th><th>Metode</th><th>Tanggal</th><th>Bukti</th><th>Status</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.id} className="group">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.status === 'verified' ? gradients[1] : p.status === 'rejected' ? gradients[3] : gradients[2] }}>
                          {p.status === 'verified' ? <CheckCircle size={12} className="text-white" /> : p.status === 'rejected' ? <XCircle size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
                        </div>
                        <span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">{p.paymentNo}</span>
                      </div>
                    </td>
                    <td>
                      <p className="text-[13px] font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{p.tenant?.businessName || '-'}</p>
                      <p className="text-[11px] text-gray-400">{p.tenant?.code || ''}</p>
                    </td>
                    <td>
                      {p.invoice?.invoiceNo ? (
                        <span className="font-mono text-[11px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">{p.invoice.invoiceNo}</span>
                      ) : <span className="text-[11px] text-gray-400">-</span>}
                    </td>
                    <td className="text-right"><span className="text-[13px] font-bold text-gray-900">{fmt(p.amount)}</span></td>
                    <td>
                      <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded capitalize">{(p.paymentMethod || '').replace(/_/g, ' ')}</span>
                    </td>
                    <td className="text-[12px] text-gray-600">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                    <td>
                      {p.proofUrl ? (
                        <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline">Lihat</a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        {p.status === 'pending_verification' && (
                          <>
                            <button onClick={() => handleVerify(p.id, 'verified')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Verifikasi"><CheckCircle size={13} /></button>
                            <button onClick={() => handleVerify(p.id, 'rejected')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Tolak"><XCircle size={13} /></button>
                          </>
                        )}
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={PER_PAGE} onChange={setPage} />
        </div>
      )}

      {/* Create Payment Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Catat Pembayaran Baru" wide>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
            <span className="font-semibold">ℹ️</span> Field bertanda <span className="font-bold text-red-500">*</span> wajib diisi.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Tenant <span className="text-red-500">*</span></label>
              <select className="input" value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))} required>
                <option value="">Pilih tenant</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.code} — {t.businessName}</option>)}
              </select>
            </div>
            <div><label className="label">Jumlah <span className="text-red-500">*</span></label><input type="number" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" required /></div>
            <div><label className="label">Metode Pembayaran</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div><label className="label">Tanggal Bayar <span className="text-red-500">*</span></label><input type="date" className="input" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} required /></div>
            <div><label className="label">Nama Bank</label><input className="input" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="BCA, Mandiri, BRI" /></div>
            <div><label className="label">No. Referensi</label><input className="input" value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} placeholder="No. bukti transfer" /></div>
          </div>
          <div><label className="label">Catatan</label><input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value}))} placeholder="Catatan opsional" /></div>
          <div className="rounded-xl p-3.5 bg-blue-50 border border-blue-100 text-[12px] text-blue-700 flex items-start gap-2">
            <Shield size={14} className="mt-0.5 shrink-0" />
            <span>Pembayaran akan masuk ke status "Pending Verifikasi" dan perlu dikonfirmasi oleh finance sebelum dianggap lunas.</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Pembayaran'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Pembayaran" message="Pembayaran yang dihapus tidak bisa dikembalikan. Lanjutkan?" />
    </div>
  );
}
