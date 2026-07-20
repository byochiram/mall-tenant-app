import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getContracts, createContract, approveContract, terminateContract, deleteContract, getTenants } from '../services/api';
import { Badge, Modal, Loading, ConfirmModal, fmt, Tabs } from '../components/UI';
import { Plus, FileText, CheckCircle, XCircle, Trash2, Clock, AlertTriangle, Users, Calendar, DollarSign, Shield, ChevronRight } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'draft', label: 'Draft' },
  { key: 'expired', label: 'Expired' },
  { key: 'terminated', label: 'Terminated' },
  { key: 'expiring', label: 'Akan Habis' },
];

import { gradients } from '../utils/constants';

const emptyForm = {
  tenantId: '', contractType: 'new', startDate: '', endDate: '', durationMonths: '',
  fixedRent: '', rentPerSqm: '', revenueSharePercent: '', serviceCharge: '',
  securityDeposit: '', fitoutDeposit: '', paymentTerms: 'monthly', paymentDueDay: '',
  lateFeePercent: '', annualEscalationPercent: '', specialTerms: '',
};

function calcDuration(start, end) {
  if (!start || !end) return '';
  const s = new Date(start), e = new Date(end);
  if (isNaN(s) || isNaN(e) || e <= s) return '';
  const m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return m > 0 ? m : '';
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Contracts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('status') || 'all';
  const [contracts, setContracts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'expiring') params.expiringSoon = true;
      else if (activeTab !== 'all') params.status = activeTab;
      const { data } = await getContracts(params);
      setContracts(Array.isArray(data) ? data : data.data || []);
    } catch {} finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getTenants({ limit: 200 }).then(({ data }) => setTenants(data.data || [])).catch(() => {}); }, []);

  const handleTabChange = (key) => {
    if (key === 'all') setSearchParams({});
    else if (key === 'expiring') setSearchParams({ expiringSoon: 'true', status: 'expiring' });
    else setSearchParams({ status: key });
  };

  const handleFormChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'startDate' || field === 'endDate') next.durationMonths = calcDuration(next.startDate, next.endDate);
      return next;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      payload.tenantId = Number(payload.tenantId);
      ['durationMonths','fixedRent','rentPerSqm','revenueSharePercent','serviceCharge','securityDeposit','fitoutDeposit','paymentDueDay','lateFeePercent'].forEach(k => {
        payload[k] = payload[k] ? Number(payload[k]) : 0;
      });
      if (payload.annualEscalationPercent) {
        payload.annualEscalation = Number(payload.annualEscalationPercent);
        delete payload.annualEscalationPercent;
      } else {
        payload.annualEscalation = 0;
        delete payload.annualEscalationPercent;
      }
      if (!payload.rentPerSqm) payload.rentPerSqm = 0;
      if (!payload.paymentDueDay) payload.paymentDueDay = 5;
      if (!payload.durationMonths) payload.durationMonths = 0;
      await createContract(payload);
      setShowForm(false); setForm(emptyForm); toast.success('Kontrak berhasil dibuat'); load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Gagal membuat kontrak'); console.error(err); } finally { setSaving(false); }
  };

  const handleApprove = async (id) => { try { await approveContract(id); toast.success('Kontrak disetujui'); load(); } catch (err) { toast.error('Gagal approve'); console.error(err); } };
  const handleTerminate = async (id) => { try { await terminateContract(id); toast.success('Kontrak diterminasi'); load(); } catch (err) { toast.error('Gagal terminate'); console.error(err); } };
  const handleDelete = async () => { if (!deleteTarget) return; try { await deleteContract(deleteTarget.id); setDeleteTarget(null); toast.success('Kontrak dihapus'); load(); } catch (err) { toast.error('Gagal menghapus'); console.error(err); } };

  const handleRenewal = (contract) => {
    const nextYear = new Date(contract.endDate);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setForm({
      ...emptyForm,
      tenantId: String(contract.tenantId),
      contractType: 'renewal',
      startDate: contract.endDate,
      endDate: nextYear.toISOString().slice(0, 10),
      fixedRent: String(contract.fixedRent || ''),
      rentPerSqm: String(contract.rentPerSqm || ''),
      serviceCharge: String(contract.serviceCharge || ''),
      paymentTerms: contract.paymentTerms || 'monthly',
      paymentDueDay: String(contract.paymentDueDay || '5'),
    });
    setShowForm(true);
    toast('Form perpanjangan sudah diisi otomatis', { icon: 'ℹ️' });
  };

  const handleNewContract = (tenantId) => {
    setForm({ ...emptyForm, tenantId: String(tenantId) });
    setShowForm(true);
    toast('Buat kontrak baru untuk tenant ini', { icon: 'ℹ️' });
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    draft: contracts.filter(c => c.status === 'draft').length,
    expiring: contracts.filter(c => { const d = daysUntil(c.endDate); return d !== null && d <= 90 && d > 0 && c.status === 'active'; }).length,
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Contracts</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Kelola kontrak sewa seluruh tenant</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
          <Plus size={15} /> Tambah Kontrak
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: 'Total Kontrak', value: stats.total, gradient: gradients[0] },
          { icon: CheckCircle, label: 'Aktif', value: stats.active, gradient: gradients[2] },
          { icon: Clock, label: 'Draft', value: stats.draft, gradient: gradients[1] },
          { icon: AlertTriangle, label: 'Akan Habis', value: stats.expiring, gradient: gradients[3] },
        ].map(s => (
          <div key={s.label} className="card overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.gradient }}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
            <div className="h-0.5" style={{ background: s.gradient }} />
          </div>
        ))}
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={handleTabChange} />

      {/* Contract grid */}
      {loading ? <Loading /> : contracts.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[13px] text-gray-500 font-medium">Tidak ada kontrak ditemukan</p>
          <p className="text-[12px] text-gray-400 mt-1">{activeTab !== 'all' ? 'Coba ganti filter tab' : 'Mulai dengan menambahkan kontrak baru'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contracts.map((c, i) => {
            const days = daysUntil(c.endDate);
            const isExpiring = days !== null && days <= 90 && days > 0 && c.status === 'active';
            const isOverdue = days !== null && days < 0;
            return (
              <div key={c.id} className={`card overflow-hidden fade-in ${isOverdue ? 'border-red-200' : ''}`}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: gradients[i % gradients.length] }}>
                      <FileText size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{c.tenant?.businessName || '-'}</p>
                      <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{c.contractNumber}</span>
                    </div>
                  </div>
                  <Badge status={c.status} />
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Period */}
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <Calendar size={13} className="text-gray-400" />
                    <span>{c.startDate?.slice(0, 10)} — {c.endDate?.slice(0, 10)}</span>
                    {c.durationMonths && <span className="text-gray-400">({c.durationMonths} bln)</span>}
                  </div>

                  {/* Financial grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: 'Sewa Tetap', v: fmt(c.fixedRent) },
                      { l: 'Sewa/m²', v: fmt(c.rentPerSqm) },
                      { l: 'Service Charge', v: fmt(c.serviceCharge) },
                      { l: 'Revenue Share', v: `${c.revenueSharePercent ?? 0}%` },
                    ].map(f => (
                      <div key={f.l} className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[10px] text-gray-400 uppercase">{f.l}</p>
                        <p className="text-[12px] font-bold text-gray-800">{f.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Expiring warning */}
                  {isExpiring && (
                    <div className="flex items-center gap-2 text-[12px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                      <AlertTriangle size={14} />
                      <span className="font-medium">Habis dalam {days} hari</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {c.status === 'draft' && (
                      <>
                        <button className="btn btn-success btn-sm flex-1" onClick={() => handleApprove(c.id)}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => setDeleteTarget(c)}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {c.status === 'active' && (
                      <>
                        <button className="btn btn-secondary btn-sm flex-1" onClick={() => handleRenewal(c)}>
                          <Clock size={13} /> Perpanjang
                        </button>
                        <button className="btn btn-danger btn-sm flex-1" onClick={() => handleTerminate(c.id)}>
                          <XCircle size={13} /> Terminasi
                        </button>
                      </>
                    )}
                    {(c.status === 'expired' || c.status === 'terminated') && (
                      <button className="btn btn-primary btn-sm flex-1" onClick={() => handleNewContract(c.tenantId)}>
                        <Plus size={13} /> Buat Kontrak Baru
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom gradient strip */}
                <div className="h-0.5" style={{ background: gradients[i % gradients.length] }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Kontrak Baru" wide>
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
            <span className="font-semibold">ℹ️</span> Field bertanda <span className="font-bold">*</span> wajib diisi. Field kosong akan dianggap 0.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Tenant <span className="text-red-500">*</span></label>
              <select className="input" value={form.tenantId} onChange={e => handleFormChange('tenantId', e.target.value)} required>
                <option value="">Pilih tenant...</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.code} — {t.businessName}</option>)}
              </select>
            </div>
            <div><label className="label">Tipe Kontrak</label>
              <select className="input" value={form.contractType} onChange={e => handleFormChange('contractType', e.target.value)}>
                <option value="new">Baru</option><option value="renewal">Perpanjangan</option><option value="amendment">Amandemen</option>
              </select>
            </div>
            <div><label className="label">Tanggal Mulai <span className="text-red-500">*</span></label><input type="date" className="input" value={form.startDate} onChange={e => handleFormChange('startDate', e.target.value)} required /></div>
            <div><label className="label">Tanggal Berakhir <span className="text-red-500">*</span></label><input type="date" className="input" value={form.endDate} onChange={e => handleFormChange('endDate', e.target.value)} required /></div>
            <div><label className="label">Durasi (bulan)</label><input type="number" className="input bg-gray-50" value={form.durationMonths} readOnly placeholder="Otomatis" /></div>
            <div><label className="label">Sewa Tetap /bulan <span className="text-red-500">*</span></label><input type="number" className="input" value={form.fixedRent} onChange={e => handleFormChange('fixedRent', e.target.value)} placeholder="Contoh: 5000000" required /></div>
            <div><label className="label">Sewa /m²</label><input type="number" className="input" value={form.rentPerSqm} onChange={e => handleFormChange('rentPerSqm', e.target.value)} placeholder="0" /></div>
            <div><label className="label">Revenue Share %</label><input type="number" className="input" value={form.revenueSharePercent} onChange={e => handleFormChange('revenueSharePercent', e.target.value)} placeholder="0" step="0.01" /></div>
            <div><label className="label">Service Charge</label><input type="number" className="input" value={form.serviceCharge} onChange={e => handleFormChange('serviceCharge', e.target.value)} placeholder="0" /></div>
            <div><label className="label">Security Deposit</label><input type="number" className="input" value={form.securityDeposit} onChange={e => handleFormChange('securityDeposit', e.target.value)} placeholder="0" /></div>
            <div><label className="label">Fitout Deposit</label><input type="number" className="input" value={form.fitoutDeposit} onChange={e => handleFormChange('fitoutDeposit', e.target.value)} placeholder="0" /></div>
            <div><label className="label">Termin Pembayaran</label>
              <select className="input" value={form.paymentTerms} onChange={e => handleFormChange('paymentTerms', e.target.value)}>
                <option value="monthly">Bulanan</option><option value="quarterly">Quarterly</option><option value="yearly">Tahunan</option>
              </select>
            </div>
            <div><label className="label">Jatuh Tempo (tgl)</label><input type="number" className="input" value={form.paymentDueDay} onChange={e => handleFormChange('paymentDueDay', e.target.value)} placeholder="5" min="1" max="31" /></div>
            <div><label className="label">Denda Keterlambatan %</label><input type="number" className="input" value={form.lateFeePercent} onChange={e => handleFormChange('lateFeePercent', e.target.value)} placeholder="2" step="0.01" /></div>
            <div><label className="label">Eskalasi Tahunan %</label><input type="number" className="input" value={form.annualEscalationPercent} onChange={e => handleFormChange('annualEscalationPercent', e.target.value)} placeholder="5" step="0.01" /></div>
          </div>
          <div><label className="label">Syarat Khusus</label><textarea className="input" rows={3} value={form.specialTerms} onChange={e => handleFormChange('specialTerms', e.target.value)} placeholder="Syarat atau ketentuan tambahan..." /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Kontrak'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Kontrak" message={`Yakin ingin menghapus kontrak "${deleteTarget?.contractNumber}"? Tindakan ini tidak dapat dibatalkan.`} />
    </div>
  );
}
