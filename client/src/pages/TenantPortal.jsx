import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getPortalProfile, getPortalInvoices, getPortalPayments, submitPortalPayment, uploadProof } from '../services/api';
import { Badge, Loading, fmt, Tabs, Modal, Pagination } from '../components/UI';
import { Building2, FileText, CreditCard, DollarSign, Upload, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

const TABS = [
  { key: 'invoices', label: 'Tagihan' },
  { key: 'payments', label: 'Riwayat Pembayaran' },
];

export default function TenantPortal() {
  const [profile, setProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('invoices');
  const [filter, setFilter] = useState('all');
  const [showPay, setShowPay] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({ amount: '', paymentMethod: 'transfer', bankName: '', referenceNo: '', paymentDate: '', notes: '' });
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const load = () => Promise.all([
    getPortalProfile().then(r => setProfile(r.data)).catch(() => {}),
    getPortalInvoices().then(r => setInvoices(r.data)).catch(() => {}),
    getPortalPayments().then(r => setPayments(r.data)).catch(() => {}),
  ]).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return invoices;
    return invoices.filter(i => i.status === filter);
  }, [invoices, filter]);

  const PER_PAGE = 6;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => { setPage(1); }, [filter, tab]);

  const openPay = (inv) => {
    setSelectedInvoice(inv);
    setForm({ amount: inv.totalAmount, paymentMethod: 'transfer', bankName: '', referenceNo: '', paymentDate: new Date().toISOString().slice(0, 10), notes: '' });
    setProofFile(null);
    setProofPreview(null);
    setShowPay(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setProofFile(file);
    if (file && file.type.startsWith('image/')) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let proofUrl = '';
      if (proofFile) {
        const uploadRes = await uploadProof(proofFile);
        proofUrl = uploadRes.data.url;
      }
      await submitPortalPayment({ ...form, invoiceId: selectedInvoice?.id, amount: Number(form.amount), proofUrl });
      setShowPay(false);
      setProofFile(null);
      toast.success('Pembayaran berhasil dikirim');
      load();
    } catch (err) { toast.error('Gagal mengirim pembayaran'); console.error(err); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  if (!profile) return <div className="text-center py-12 text-gray-400 text-sm">Gagal memuat data</div>;

  const unit = profile.tenantUnits?.[0]?.unit;
  const contract = profile.contracts?.[0];
  const unpaidCount = invoices.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).length;
  const totalUnpaid = invoices.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Header banner */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="h-2" style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)' }} />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f0ff, #e0f2fe)' }}>
                <Building2 size={26} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{profile.businessName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400 font-mono">{profile.code}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{profile.category?.name}</span>
                </div>
              </div>
            </div>
            <Badge status={profile.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: MapPin, label: 'Lokasi', value: unit ? `L${unit.floor?.number} / ${unit.unitNumber}` : '-', color: '#8b5cf6' },
              { icon: Calendar, label: 'Kontrak Hingga', value: contract ? new Date(contract.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', color: '#06b6d4' },
              { icon: DollarSign, label: 'Sewa/bulan', value: contract ? fmt(contract.fixedRent) : '-', color: '#10b981' },
              { icon: FileText, label: 'Belum Bayar', value: `${unpaidCount} tagihan`, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3.5 border border-gray-100 hover:border-gray-200 transition-colors" style={{ background: '#fafbfc' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}10` }}>
                    <s.icon size={14} style={{ color: s.color }} />
                  </div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unpaid alert */}
      {unpaidCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{unpaidCount} tagihan belum dibayar</p>
            <p className="text-sm text-amber-600">Total: {fmt(totalUnpaid)} — Segera lakukan pembayaran untuk menghindari denda</p>
          </div>
        </div>
      )}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <div className="space-y-4 fade-in">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Semua', count: invoices.length },
              { key: 'sent', label: 'Menunggu', count: invoices.filter(i => i.status === 'sent').length },
              { key: 'pending', label: 'Pending', count: invoices.filter(i => i.status === 'pending').length },
              { key: 'paid', label: 'Lunas', count: invoices.filter(i => i.status === 'paid').length },
              { key: 'overdue', label: 'Jatuh Tempo', count: invoices.filter(i => i.status === 'overdue').length },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label} <span className="opacity-60">{f.count}</span>
              </button>
            ))}
          </div>

          {paginated.length === 0 ? (
            <div className="card p-8 text-center"><FileText size={40} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-400">Tidak ada tagihan</p></div>
          ) : (
            <div className="space-y-3">
              {paginated.map(inv => {
                const isOverdue = inv.status === 'overdue';
                const isUnpaid = ['sent', 'pending', 'overdue'].includes(inv.status);
                return (
                  <div key={inv.id} className={`card p-5 ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm bg-gray-100 px-2.5 py-1 rounded">{inv.invoiceNo}</span>
                        <span className="text-sm text-gray-400">{inv.period}</span>
                        <span className="text-sm text-gray-400 capitalize">({(inv.invoiceType || '').replace(/_/g, ' ')})</span>
                      </div>
                      <Badge status={inv.status} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Total Tagihan</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(inv.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Jatuh Tempo</p>
                        <p className={`text-sm font-semibold mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {inv.status === 'paid' && <CheckCircle size={15} className="text-emerald-500" />}
                          {isOverdue && <AlertTriangle size={15} className="text-red-500" />}
                          {(inv.status === 'sent' || inv.status === 'pending') && <Clock size={15} className="text-amber-500" />}
                          <span className="text-sm font-medium text-gray-700 capitalize">{inv.status?.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {inv.lineItems?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        {inv.lineItems.map((li, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1.5">
                            <span className="text-gray-600">{li.description}</span>
                            <span className="font-semibold text-gray-800">{fmt(li.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        {inv.payments?.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle size={14} className="text-emerald-500" />
                            {inv.payments.length} pembayaran tercatat
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {inv.status === 'paid' && (
                          <button onClick={() => setPreviewInvoice(inv)} className="btn btn-sm text-sm" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                            <FileText size={14} /> Lihat Invoice
                          </button>
                        )}
                        {isUnpaid && (() => {
                          const hasPending = inv.payments?.some(p => p.status === 'pending_verification');
                          if (hasPending) {
                            return (
                              <button className="btn btn-sm text-sm opacity-60 cursor-not-allowed" disabled style={{ background: '#fef3c7', color: '#92400e', border: 'none' }}>
                                <Clock size={14} /> Menunggu Verifikasi
                              </button>
                            );
                          }
                          return (
                            <button onClick={() => openPay(inv)} className="btn btn-primary btn-sm text-sm">
                              <Upload size={14} /> Bayar Sekarang
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={PER_PAGE} onChange={setPage} />
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="fade-in">
          {payments.length === 0 ? (
            <div className="card p-8 text-center"><CreditCard size={40} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-400">Belum ada pembayaran</p></div>
          ) : (
            <div className="card overflow-hidden">
              <div className="table-container">
                <table>
                  <thead><tr><th>No. Bayar</th><th>Invoice</th><th className="text-right">Jumlah</th><th>Metode</th><th>Tanggal</th><th>Bukti</th><th>Status</th></tr></thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td><span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{p.paymentNo}</span></td>
                        <td className="text-gray-600 text-sm">{p.invoice?.invoiceNo || '-'}</td>
                        <td className="text-right font-semibold text-sm">{fmt(p.amount)}</td>
                        <td className="text-gray-600 capitalize text-sm">{(p.paymentMethod || '').replace(/_/g, ' ')}</td>
                        <td className="text-gray-600 text-sm">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID') : '-'}</td>
                        <td>
                          {p.proofUrl ? (
                            <button onClick={() => setPreviewUrl(p.proofUrl)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline cursor-pointer bg-transparent border-none">Lihat</button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td><Badge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pay Modal */}
      <Modal open={showPay} onClose={() => setShowPay(false)} title={`Bayar ${selectedInvoice?.invoiceNo || ''}`}>
        <form onSubmit={handlePay} className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #f0f0ff, #f5f5ff)' }}>
            <p className="text-sm text-gray-500 mb-1">Total Tagihan</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(selectedInvoice?.totalAmount)}</p>
            <p className="text-sm text-gray-400 mt-1">Jatuh tempo: {selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('id-ID') : '-'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Jumlah Bayar <span className="text-red-500">*</span></label><input type="number" className="input" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div><label className="label">Metode Pembayaran</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="transfer">Transfer Bank</option><option value="cash">Tunai</option><option value="virtual_account">Virtual Account</option><option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div><label className="label">Nama Bank</label><input className="input" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="BCA, Mandiri, BRI" /></div>
            <div><label className="label">No. Referensi</label><input className="input" value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} placeholder="No. bukti transfer" /></div>
            <div className="col-span-2"><label className="label">Tanggal Pembayaran <span className="text-red-500">*</span></label><input type="date" className="input" required value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} /></div>
          </div>

          <div><label className="label">Catatan (opsional)</label><input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Catatan untuk manajemen mall" /></div>

          <div>
            <label className="label">Bukti Transfer</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => document.getElementById('proof-input').click()}>
              {proofFile ? (
                <div>
                  {proofPreview ? (
                    <img src={proofPreview} alt="Preview bukti transfer" className="max-h-40 mx-auto rounded-lg mb-3 border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm text-gray-700 font-medium">{proofFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" className="text-sm text-red-500 hover:text-red-700 mt-2" onClick={(e) => { e.stopPropagation(); setProofFile(null); setProofPreview(null); }}>Hapus</button>
                </div>
              ) : (
                <div>
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Klik untuk upload bukti transfer</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, PDF (maks 5MB)</p>
                </div>
              )}
            </div>
            <input id="proof-input" type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
          </div>

          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
            Pembayaran Anda akan diverifikasi oleh manajemen mall. Status akan berubah menjadi "Terverifikasi" setelah dikonfirmasi.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowPay(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Mengirim...' : 'Kirim Pembayaran'}</button>
          </div>
        </form>
      </Modal>

      {/* Invoice Preview Modal */}
      <Modal open={!!previewInvoice} onClose={() => setPreviewInvoice(null)} title={`Invoice ${previewInvoice?.invoiceNo || ''}`}>
        {previewInvoice && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => {
                const w = window.open('', '_blank');
                w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${previewInvoice.invoiceNo}</title>
                <style>
                  body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1e293b;line-height:1.6}
                  h1{font-size:24px;margin-bottom:4px}
                  .muted{color:#94a3b8;font-size:13px}
                  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
                  .badge-paid{background:#d1fae5;color:#065f46}
                  .badge-sent{background:#fef3c7;color:#92400e}
                  .badge-overdue{background:#fee2e2;color:#991b1b}
                  table{width:100%;border-collapse:collapse;margin:16px 0}
                  th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:14px}
                  th{background:#f8fafc;font-weight:700;font-size:12px;text-transform:uppercase;color:#64748b}
                  .total-row{background:#f8fafc;font-weight:700}
                  .total-row td{border-top:2px solid #e2e8f0}
                  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
                  .info-box{background:#f8fafc;border-radius:8px;padding:12px}
                  .info-label{font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600}
                  .info-value{font-size:14px;font-weight:600;margin-top:4px}
                  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0}
                  .print-btn{background:#0f172a;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;margin-bottom:20px}
                  @media print{.print-btn{display:none}body{margin:20px}}
                </style></head><body>
                <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
                <div class="header">
                  <div>
                    <h1 style="margin:0;font-size:20px;color:#6366f1;font-weight:800">🏬 MallManager</h1>
                    <p class="muted" style="margin-top:2px">Manajemen Mall</p>
                  </div>
                  <div style="text-align:right">
                    <h1 style="margin:0">Invoice</h1>
                    <p class="muted">${previewInvoice.invoiceNo}</p>
                    <span class="badge badge-${previewInvoice.status}">${previewInvoice.status?.replace(/_/g,' ')}</span>
                  </div>
                </div>
                <div class="info-grid">
                  <div class="info-box"><div class="info-label">Kepada</div><div class="info-value">${profile?.businessName || '-'}</div></div>
                  <div class="info-box"><div class="info-label">Kode Tenant</div><div class="info-value">${profile?.code || '-'}</div></div>
                  <div class="info-box"><div class="info-label">Periode</div><div class="info-value">${previewInvoice.period || '-'}</div></div>
                  <div class="info-box"><div class="info-label">Tipe</div><div class="info-value">${(previewInvoice.invoiceType||'').replace(/_/g,' ')}</div></div>
                  <div class="info-box"><div class="info-label">Jatuh Tempo</div><div class="info-value">${previewInvoice.dueDate ? new Date(previewInvoice.dueDate).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-'}</div></div>
                  <div class="info-box"><div class="info-label">Total</div><div class="info-value">${new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(previewInvoice.totalAmount)}</div></div>
                </div>
                ${(previewInvoice.lineItems||[]).length > 0 ? `
                <table>
                  <thead><tr><th>Deskripsi</th><th style="text-align:right">Jumlah</th></tr></thead>
                  <tbody>
                    ${previewInvoice.lineItems.map(li => `<tr><td>${li.description}</td><td style="text-align:right">${new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(li.amount)}</td></tr>`).join('')}
                    <tr class="total-row"><td>Total</td><td style="text-align:right">${new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(previewInvoice.totalAmount)}</td></tr>
                  </tbody>
                </table>` : ''}
                ${(previewInvoice.payments||[]).length > 0 ? `
                <h3 style="margin-top:24px;font-size:16px">Pembayaran</h3>
                <table>
                  <thead><tr><th>No. Bayar</th><th>Tanggal</th><th style="text-align:right">Jumlah</th><th>Status</th></tr></thead>
                  <tbody>
                    ${previewInvoice.payments.map(p => `<tr><td>${p.paymentNo}</td><td>${p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID') : '-'}</td><td style="text-align:right">${new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(p.amount)}</td><td>${p.status?.replace(/_/g,' ')}</td></tr>`).join('')}
                  </tbody>
                </table>` : ''}
                <p style="margin-top:40px;font-size:12px;color:#94a3b8;text-align:center">Dicetak pada ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                </body></html>`);
                w.document.close();
              }} className="btn btn-sm text-sm" style={{ background: '#0f172a', color: 'white', border: 'none' }}>
                🖨️ Print / Download
              </button>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #f0f0ff, #f5f5ff)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm bg-white px-2.5 py-1 rounded">{previewInvoice.invoiceNo}</span>
                <Badge status={previewInvoice.status} />
              </div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Tagihan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(previewInvoice.totalAmount)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400 font-semibold">Periode</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{previewInvoice.period}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400 font-semibold">Tipe</p>
                <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{(previewInvoice.invoiceType || '').replace(/_/g, ' ')}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400 font-semibold">Jatuh Tempo</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{previewInvoice.dueDate ? new Date(previewInvoice.dueDate).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400 font-semibold">Status</p>
                <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{previewInvoice.status?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {previewInvoice.lineItems?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Rincian</p>
                <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
                  {previewInvoice.lineItems.map((li, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-sm text-gray-700">{li.description}</span>
                      <span className="text-sm font-semibold text-gray-900">{fmt(li.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="text-sm font-bold text-gray-900">{fmt(previewInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {previewInvoice.payments?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Pembayaran</p>
                <div className="space-y-2">
                  {previewInvoice.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.paymentNo}</p>
                        <p className="text-xs text-gray-400">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID') : '-'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{fmt(p.amount)}</span>
                        {p.proofUrl && (
                          <button onClick={() => setPreviewUrl(p.proofUrl)} className="text-xs text-indigo-600 hover:text-indigo-800 underline cursor-pointer bg-transparent border-none">Lihat Bukti</button>
                        )}
                        <Badge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Proof Preview Modal */}
      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Bukti Transfer">
        {previewUrl && (
          <div className="text-center">
            <img src={previewUrl} alt="Bukti transfer" className="max-w-full max-h-[70vh] rounded-lg mx-auto" style={{ objectFit: 'contain' }} />
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-800 underline">
              Buka di tab baru
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
