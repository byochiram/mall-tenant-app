import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice, bulkGenerateInvoices, getTenants } from '../services/api';
import { Badge, Modal, Loading, ConfirmModal, fmt, Tabs, Pagination } from '../components/UI';
import { Plus, FileText, Send, CheckCircle, Trash2, Layers, Search, DollarSign, AlertTriangle, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'sent', label: 'Terkirim' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Lunas' },
  { key: 'overdue', label: 'Jatuh Tempo' },
  { key: 'draft', label: 'Draft' },
];

const INVOICE_TYPES = [
  { value: 'rent', label: 'Sewa' },
  { value: 'service_charge', label: 'Service Charge' },
  { value: 'utility', label: 'Utilitas' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Lainnya' },
];

import { gradients } from '../utils/constants';

const emptyLineItem = () => ({ description: '', quantity: 1, unitPrice: 0 });

export default function Billing() {
  const { user } = useAuth();
  const canCreate = user?.role === 'super_admin' || user?.role === 'finance_manager' || user?.role === 'accounting_staff';
  const canBulk = user?.role === 'super_admin' || user?.role === 'finance_manager';
  const canDelete = user?.role === 'super_admin';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tenants, setTenants] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tenantId: '', contractId: '', invoiceType: 'rent', period: '', dueDate: '', lineItems: [emptyLineItem()], taxPercent: 0, discount: 0, notes: '' });
  const [bulkForm, setBulkForm] = useState({ period: '', invoiceType: 'rent', dueDate: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') params.status = tab;
      const { data } = await getInvoices(params);
      setInvoices(Array.isArray(data) ? data : []);
    } catch { setInvoices([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);
  useEffect(() => { getTenants({ limit: 200 }).then(({ data }) => setTenants(data?.data || [])).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    if (!search) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(i => i.invoiceNo?.toLowerCase().includes(q) || i.tenant?.businessName?.toLowerCase().includes(q));
  }, [invoices, search]);

  const PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => { setPage(1); }, [search, tab]);

  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.totalAmount || 0), 0),
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((s, i) => s + (i.totalAmount || 0), 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.totalAmount || 0), 0),
  }), [invoices]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await createInvoice({
        ...form, tenantId: Number(form.tenantId), contractId: form.contractId ? Number(form.contractId) : undefined,
        taxPercent: Number(form.taxPercent), discount: Number(form.discount),
        lineItems: form.lineItems.map(li => ({ description: li.description, quantity: Number(li.quantity), unitPrice: Number(li.unitPrice) })),
      });
      setCreateOpen(false);
      setForm({ tenantId: '', contractId: '', invoiceType: 'rent', period: '', dueDate: '', lineItems: [emptyLineItem()], taxPercent: 0, discount: 0, notes: '' });
      toast.success('Invoice berhasil dibuat');
      load();
    } catch (err) { toast.error('Gagal membuat invoice'); console.error(err); } finally { setSubmitting(false); }
  };

  const handleBulk = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await bulkGenerateInvoices(bulkForm); setBulkOpen(false); setBulkForm({ period: '', invoiceType: 'rent', dueDate: '' }); toast.success('Bulk generate berhasil'); load(); }
    catch (err) { toast.error('Gagal bulk generate'); console.error(err); } finally { setSubmitting(false); }
  };

  const handleStatus = async (id, status) => { try { await updateInvoiceStatus(id, { status }); toast.success('Status diperbarui'); load(); } catch (err) { toast.error('Gagal update status'); console.error(err); } };
  const handleDelete = async () => { try { await deleteInvoice(deleteId); setDeleteId(null); toast.success('Invoice dihapus'); load(); } catch (err) { toast.error('Gagal menghapus'); console.error(err); } };

  const subtotal = form.lineItems.reduce((s, li) => s + (Number(li.quantity) || 0) * (Number(li.unitPrice) || 0), 0);
  const taxAmt = subtotal * ((Number(form.taxPercent) || 0) / 100);
  const total = subtotal + taxAmt - (Number(form.discount) || 0);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Billing & Invoicing</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Kelola tagihan seluruh tenant</p>
        </div>
        <div className="flex gap-2">
          {canBulk ? (
            <button onClick={() => setBulkOpen(true)} className="btn btn-secondary btn-sm"><Layers size={14} /> Bulk Generate</button>
          ) : (
            <button className="btn btn-secondary btn-sm opacity-40 cursor-not-allowed" disabled title="Hanya Finance Manager"><Layers size={14} /> Bulk Generate</button>
          )}
          {canCreate ? (
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary btn-sm"><Plus size={14} /> Buat Invoice</button>
          ) : (
            <button className="btn btn-primary btn-sm opacity-40 cursor-not-allowed" disabled title="Tidak memiliki akses"><Plus size={14} /> Buat Invoice</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: 'Total Invoice', value: stats.total, gradient: gradients[0], sub: `${invoices.filter(i=>i.status==='paid').length} lunas` },
          { icon: CheckCircle2, label: 'Lunas', value: fmt(stats.paid), gradient: gradients[1], sub: `${invoices.filter(i=>i.status==='paid').length} invoice` },
          { icon: Clock, label: 'Pending', value: fmt(stats.pending), gradient: gradients[2], sub: `${invoices.filter(i=>['pending','sent'].includes(i.status)).length} invoice` },
          { icon: AlertTriangle, label: 'Jatuh Tempo', value: fmt(stats.overdue), gradient: gradients[3], sub: `${invoices.filter(i=>i.status==='overdue').length} invoice` },
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

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Tabs tabs={STATUS_TABS} active={tab} onChange={setTab} />
        <div className="input-icon-wrapper w-full sm:w-64">
          <Search size={16} className="input-icon" />
          <input className="input input-sm" placeholder="Cari invoice..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[13px] text-gray-500 font-medium">Tidak ada invoice</p>
          <p className="text-[12px] text-gray-400 mt-1">Buat invoice baru atau gunakan bulk generate</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Invoice</th><th>Tenant</th><th>Periode</th><th>Tipe</th>
                <th className="text-right">Jumlah</th><th>Jatuh Tempo</th><th>Status</th><th className="text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {paginated.map(inv => (
                  <tr key={inv.id} className="group">
                    <td><span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded">{inv.invoiceNo}</span></td>
                    <td>
                      <p className="text-[13px] font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{inv.tenant?.businessName || '-'}</p>
                      <p className="text-[11px] text-gray-400">{inv.tenant?.code || ''}</p>
                    </td>
                    <td className="text-[12px] text-gray-600">{inv.period}</td>
                    <td><span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded capitalize">{(inv.invoiceType || '').replace(/_/g, ' ')}</span></td>
                    <td className="text-right"><span className="text-[13px] font-bold text-gray-900">{fmt(inv.totalAmount)}</span></td>
                    <td className={`text-[12px] ${inv.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td><Badge status={inv.status} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        {(inv.status === 'draft' || inv.status === 'pending') && (
                          <button onClick={() => handleStatus(inv.id, 'sent')} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Kirim"><Send size={13} /></button>
                        )}
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button onClick={() => handleStatus(inv.id, 'paid')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Tandai Lunas"><CheckCircle size={13} /></button>
                        )}
                        {canDelete ? (
                          <button onClick={() => setDeleteId(inv.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={13} /></button>
                        ) : (
                          <button className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed" disabled title="Hanya Super Admin"><Trash2 size={13} /></button>
                        )}
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

      {/* Create Invoice Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Buat Invoice Baru" wide>
        <form onSubmit={handleCreate} className="space-y-5">
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
            <div><label className="label">Tipe Invoice</label>
              <select className="input" value={form.invoiceType} onChange={e => setForm(f => ({ ...f, invoiceType: e.target.value }))}>
                {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label className="label">Periode <span className="text-red-500">*</span></label><input className="input" placeholder="2026-07" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} required /></div>
            <div><label className="label">Jatuh Tempo <span className="text-red-500">*</span></label><input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required /></div>
          </div>

          <div>
            <label className="label">Line Items <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {form.lineItems.map((li, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input className="input input-sm" style={{ width: '100%' }} placeholder="Deskripsi (contoh: Sewa bulanan Juli)" value={li.description} onChange={e => { const items = [...form.lineItems]; items[i] = { ...items[i], description: e.target.value }; setForm(f => ({ ...f, lineItems: items })); }} required />
                  </div>
                  <div className="w-16">
                    <input type="number" className="input input-sm" style={{ width: '100%' }} placeholder="Qty" min="1" value={li.quantity} onChange={e => { const items = [...form.lineItems]; items[i] = { ...items[i], quantity: e.target.value }; setForm(f => ({ ...f, lineItems: items })); }} required />
                  </div>
                  <div className="w-32">
                    <input type="number" className="input input-sm" style={{ width: '100%' }} placeholder="Harga" min="0" value={li.unitPrice} onChange={e => { const items = [...form.lineItems]; items[i] = { ...items[i], unitPrice: e.target.value }; setForm(f => ({ ...f, lineItems: items })); }} required />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-700 w-24 text-right pt-2">{fmt((Number(li.quantity) || 0) * (Number(li.unitPrice) || 0))}</span>
                  {form.lineItems.length > 1 && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, j) => j !== i) }))} className="p-1 mt-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, lineItems: [...f.lineItems, emptyLineItem()] }))} className="mt-2 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Plus size={13} /> Tambah Item</button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">PPN %</label><input type="number" className="input" min="0" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: e.target.value }))} /></div>
            <div><label className="label">Diskon</label><input type="number" className="input" min="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
            <div><label className="label">Catatan</label><input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ background: 'linear-gradient(135deg, #f0f0ff, #f5f5ff)', border: '1px solid #e0e0ff' }}>
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">PPN ({form.taxPercent}%)</span><span className="font-medium">{fmt(taxAmt)}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-gray-500">Diskon</span><span className="font-medium text-red-500">-{fmt(Number(form.discount) || 0)}</span></div>
            <div className="flex justify-between border-t border-indigo-200 pt-2 text-[15px] font-bold text-gray-900"><span>Total</span><span>{fmt(total)}</span></div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan Invoice'}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Generate Modal */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Generate Invoice">
        <form onSubmit={handleBulk} className="space-y-4">
          <div className="rounded-xl p-4 bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
            Generate invoice otomatis untuk semua tenant yang memiliki kontrak aktif. Invoice akan dibuat berdasarkan sewa tetap per bulan.
          </div>
          <div><label className="label">Periode *</label><input className="input" placeholder="2026-07" value={bulkForm.period} onChange={e => setBulkForm(f => ({ ...f, period: e.target.value }))} required /></div>
          <div><label className="label">Tipe Invoice</label>
            <select className="input" value={bulkForm.invoiceType} onChange={e => setBulkForm(f => ({ ...f, invoiceType: e.target.value }))}>
              {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div><label className="label">Jatuh Tempo *</label><input type="date" className="input" value={bulkForm.dueDate} onChange={e => setBulkForm(f => ({ ...f, dueDate: e.target.value }))} required /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setBulkOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Generating...' : 'Generate'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Invoice" message="Invoice yang dihapus tidak bisa dikembalikan. Lanjutkan?" />
    </div>
  );
}
