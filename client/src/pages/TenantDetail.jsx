import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTenant, addTenantContact, addTenantNote, addTenantDocument, deleteTenantContact } from '../services/api';
import { Badge, Modal, Loading, fmt, Tabs, ConfirmModal } from '../components/UI';
import { Pencil, Plus, Phone, Mail, MessageCircle, Star, Trash2, FileText, StickyNote, Users, Building2, Calendar, DollarSign, ChevronRight, MapPin, ExternalLink, ArrowUpRight, Clock, CheckCircle, AlertTriangle, Ruler, Globe } from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'contacts', label: 'Kontak' },
  { key: 'contracts', label: 'Kontrak' },
  { key: 'billing', label: 'Tagihan' },
  { key: 'notes', label: 'Catatan' },
];

import { gradients } from '../utils/constants';

function SectionHeader({ icon: Icon, iconColor, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}12` }}>
          <Icon size={14} style={{ color: iconColor }} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [contactModal, setContactModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', contactType: 'owner', phone: '', email: '', whatsapp: '', isPrimary: false });
  const [editContactId, setEditContactId] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await getTenant(id); setTenant(data); }
    catch { navigate('/tenants'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleAddContact = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editContactId) {
        const { tenantId, id: contactId, createdAt, updatedAt, ...updateData } = contactForm;
        await updateTenantContact(id, editContactId, updateData);
        toast.success('Kontak diperbarui');
      } else {
        await addTenantContact(id, contactForm);
        toast.success('Kontak ditambahkan');
      }
      setContactModal(false); setEditContactId(null);
      setContactForm({ name: '', contactType: 'owner', phone: '', email: '', whatsapp: '', isPrimary: false });
      load();
    }
    catch { toast.error(editContactId ? 'Gagal memperbarui kontak' : 'Gagal menambah kontak'); }
    finally { setSaving(false); }
  };

  const openEditContact = (contact) => {
    setEditContactId(contact.id);
    setContactForm({
      name: contact.name || '',
      contactType: contact.contactType || 'owner',
      phone: contact.phone || '',
      email: contact.email || '',
      whatsapp: contact.whatsapp || '',
      isPrimary: contact.isPrimary || false,
    });
    setContactModal(true);
  };

  const handleDeleteContact = async () => {
    if (!deleteContactId) return;
    try { await deleteTenantContact(id, deleteContactId); setDeleteContactId(null); toast.success('Kontak dihapus'); load(); } catch { toast.error('Gagal menghapus kontak'); }
  };

  const handleTogglePrimary = async (contact) => {
    try {
      await updateTenantContact(id, contact.id, {
        isPrimary: !contact.isPrimary,
      });
      toast.success(contact.isPrimary ? 'Kontak utama dihapus' : 'Kontak utama diatur');
      load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Gagal mengubah kontak utama'); console.error(err); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault(); if (!noteContent.trim()) return; setSaving(true);
    try { await addTenantNote(id, { content: noteContent }); setNoteModal(false); setNoteContent(''); toast.success('Catatan ditambahkan'); load(); }
    catch { toast.error('Gagal menambah catatan'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  if (!tenant) return null;

  const unit = tenant.tenantUnits?.[0]?.unit;
  const activeContract = tenant.contracts?.find(c => c.status === 'active') || tenant.contracts?.[0];
  const totalInvoices = tenant.invoices?.length || 0;
  const paidInvoices = tenant.invoices?.filter(i => i.status === 'paid').length || 0;
  const unpaidTotal = tenant.invoices?.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.totalAmount || 0), 0) || 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Profile Banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <Building2 size={26} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold">{tenant.businessName}</h1>
                  <Badge status={tenant.status} />
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-[13px] text-slate-400">
                  <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px]">{tenant.code}</span>
                  {tenant.brandName && <><span className="w-1 h-1 rounded-full bg-slate-600" /><span>{tenant.brandName}</span></>}
                  {tenant.category?.name && <><span className="w-1 h-1 rounded-full bg-slate-600" /><span>{tenant.category.name}</span></>}
                  {tenant.tenantType && <><span className="w-1 h-1 rounded-full bg-slate-600" /><span className="capitalize">{tenant.tenantType}</span></>}
                </div>
              </div>
            </div>
            <button className="btn btn-sm self-start" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate(`/tenants/${id}/edit`)}>
              <Pencil size={14} /> Edit Tenant
            </button>
          </div>

          {/* Quick stats in banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { icon: MapPin, label: 'Lokasi', value: unit ? `L${unit.floor?.number} / ${unit.unitNumber}` : '-' },
              { icon: Ruler, label: 'Luas Unit', value: unit ? `${unit.areaSqm} m²` : '-' },
              { icon: DollarSign, label: 'Sewa/bulan', value: activeContract ? fmt(activeContract.fixedRent) : '-' },
              { icon: Calendar, label: 'Bergabung', value: tenant.joinDate ? new Date(tenant.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon size={12} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-[14px] font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: 'Total Invoice', value: totalInvoices, color: '#6366f1', gradient: gradients[0] },
          { icon: CheckCircle, label: 'Sudah Dibayar', value: paidInvoices, color: '#10b981', gradient: gradients[2] },
          { icon: AlertTriangle, label: 'Belum Dibayar', value: fmt(unpaidTotal), color: '#f59e0b', gradient: gradients[3] },
          { icon: Users, label: 'Kontak', value: tenant.contacts?.length || 0, color: '#06b6d4', gradient: gradients[1] },
        ].map((s, i) => (
          <div key={s.label} className="card overflow-hidden fade-in">
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.gradient }}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                <p className="text-[17px] font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
            <div className="h-0.5" style={{ background: s.gradient }} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4 fade-in">
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <SectionHeader icon={Building2} iconColor="#6366f1" title="Informasi Tenant" subtitle="Data lengkap tenant" />
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                {[
                  { l: 'Nama Usaha', v: tenant.businessName },
                  { l: 'Nama Legal', v: tenant.legalName },
                  { l: 'Brand', v: tenant.brandName },
                  { l: 'Kategori', v: tenant.category?.name },
                  { l: 'Tipe Tenant', v: <span className="capitalize">{tenant.tenantType}</span> },
                  { l: 'Status', v: <Badge status={tenant.status} /> },
                  { l: 'Tanggal Masuk', v: tenant.joinDate ? new Date(tenant.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                  { l: 'Lantai / Unit', v: unit ? `Lantai ${unit.floor?.number} / ${unit.unitNumber}` : '-' },
                ].map(f => (
                  <div key={f.l} className="py-2 border-b border-gray-50 last:border-0">
                    <p className="text-[11px] text-gray-400 font-medium">{f.l}</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{f.v || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeContract && (
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <SectionHeader icon={FileText} iconColor="#10b981" title="Kontrak Aktif" subtitle={activeContract.contractNumber} />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                  {[
                    { l: 'Periode', v: `${new Date(activeContract.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — ${new Date(activeContract.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` },
                    { l: 'Sewa Tetap', v: fmt(activeContract.fixedRent) },
                    { l: 'Sewa/m²', v: fmt(activeContract.rentPerSqm) },
                    { l: 'Service Charge', v: fmt(activeContract.serviceCharge) },
                    { l: 'Revenue Share', v: `${activeContract.revenueSharePercent || 0}%` },
                    { l: 'Durasi', v: `${activeContract.durationMonths} bulan` },
                    { l: 'Jatuh Tempo Bayar', v: `Tanggal ${activeContract.paymentDueDay}` },
                    { l: 'Status', v: <Badge status={activeContract.status} /> },
                  ].map(f => (
                    <div key={f.l} className="py-2 border-b border-gray-50 last:border-0">
                      <p className="text-[11px] text-gray-400 font-medium">{f.l}</p>
                      <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{f.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tenant.notes && (
            <div className="card p-5">
              <SectionHeader icon={StickyNote} iconColor="#f59e0b" title="Catatan" />
              <p className="text-[13px] text-gray-600 leading-relaxed bg-amber-50 rounded-xl p-4 border border-amber-100">{tenant.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Contacts */}
      {tab === 'contacts' && (
        <div className="space-y-4 fade-in">
          <div className="flex justify-between items-center">
            <p className="text-[13px] text-gray-500">{tenant.contacts?.length || 0} kontak terdaftar</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditContactId(null); setContactForm({ name: '', contactType: 'owner', phone: '', email: '', whatsapp: '', isPrimary: false }); setContactModal(true); }}><Plus size={14} /> Tambah Kontak</button>
          </div>

          {tenant.contacts?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenant.contacts.map(c => (
                <div key={c.id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ background: c.isPrimary ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#d4d4d8' }}>
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{c.name}</p>
                        <span className="text-[11px] text-gray-400 capitalize">{c.contactType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleTogglePrimary(c)} className={`p-1 rounded-lg transition-colors ${c.isPrimary ? 'bg-indigo-50 text-indigo-500' : 'text-gray-300 hover:text-indigo-500 hover:bg-indigo-50'}`} title={c.isPrimary ? 'Hapus dari kontak utama' : 'Jadikan kontak utama'}>
                        <Star size={13} fill={c.isPrimary ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => openEditContact(c)} className="p-1 hover:bg-indigo-50 rounded-lg text-gray-300 hover:text-indigo-500 transition-colors" title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteContactId(c.id)} className="p-1 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors" title="Hapus">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 pl-12">
                    {c.phone && <div className="flex items-center gap-2 text-[12px] text-gray-500"><Phone size={12} className="text-gray-400" /> {c.phone}</div>}
                    {c.email && <div className="flex items-center gap-2 text-[12px] text-gray-500"><Mail size={12} className="text-gray-400" /> {c.email}</div>}
                    {c.whatsapp && <div className="flex items-center gap-2 text-[12px] text-gray-500"><MessageCircle size={12} className="text-gray-400" /> {c.whatsapp}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <Users size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[13px] text-gray-500 font-medium">Belum ada kontak</p>
              <p className="text-[12px] text-gray-400 mt-1">Tambahkan kontak untuk tenant ini</p>
            </div>
          )}

          <Modal open={contactModal} onClose={() => { setContactModal(false); setEditContactId(null); }} title={editContactId ? 'Edit Kontak' : 'Tambah Kontak'}>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Nama <span className="text-red-500">*</span></label><input className="input" required value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} /></div>
                <div><label className="label">Tipe</label>
                  <select className="input" value={contactForm.contactType} onChange={e => setContactForm({ ...contactForm, contactType: e.target.value })}>
                    <option value="owner">Owner</option><option value="manager">Manager</option><option value="finance">Finance</option><option value="operational">Operational</option><option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Telepon</label><input className="input" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} /></div>
                <div><label className="label">Email</label><input className="input" type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} /></div>
              </div>
              <div><label className="label">WhatsApp</label><input className="input" value={contactForm.whatsapp} onChange={e => setContactForm({ ...contactForm, whatsapp: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setContactModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </Modal>

          <ConfirmModal open={!!deleteContactId} onClose={() => setDeleteContactId(null)} onConfirm={handleDeleteContact} title="Hapus Kontak" message="Kontak yang dihapus tidak bisa dikembalikan." />
        </div>
      )}

      {/* Contracts */}
      {tab === 'contracts' && (
        <div className="space-y-4 fade-in">
          {tenant.contracts?.length > 0 ? tenant.contracts.map((c, i) => (
            <div key={c.id} className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: gradients[i % gradients.length] }}>
                    <FileText size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">{c.contractNumber}</p>
                    <p className="text-[11px] text-gray-400">{new Date(c.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(c.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <Badge status={c.status} />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { l: 'Sewa Tetap', v: fmt(c.fixedRent) },
                    { l: 'Sewa/m²', v: fmt(c.rentPerSqm) },
                    { l: 'Service Charge', v: fmt(c.serviceCharge) },
                    { l: 'Durasi', v: `${c.durationMonths} bulan` },
                  ].map(f => (
                    <div key={f.l} className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <p className="text-[10px] text-gray-400 uppercase">{f.l}</p>
                      <p className="text-[13px] font-bold text-gray-800 mt-0.5">{f.v}</p>
                    </div>
                  ))}
                </div>
                {c.renewals?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Riwayat Perpanjangan</p>
                    <div className="space-y-1.5">
                      {c.renewals.map((r, ri) => (
                        <div key={ri} className="flex items-center justify-between text-[12px] bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">{new Date(r.previousEndDate).toLocaleDateString('id-ID')} → {new Date(r.newEndDate).toLocaleDateString('id-ID')}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">{fmt(r.newFixedRent)}</span>
                            <Badge status={r.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="card p-10 text-center">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[13px] text-gray-500 font-medium">Belum ada kontrak</p>
            </div>
          )}
        </div>
      )}

      {/* Billing */}
      {tab === 'billing' && (
        <div className="space-y-4 fade-in">
          <div className="flex justify-between items-center">
            <p className="text-[13px] text-gray-500">{tenant.invoices?.length || 0} invoice</p>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/billing?tenantId=${id}`)}>Lihat Semua <ChevronRight size={14} /></button>
          </div>
          {tenant.invoices?.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="table-container">
                <table>
                  <thead><tr><th>Invoice</th><th>Periode</th><th>Tipe</th><th className="text-right">Jumlah</th><th>Jatuh Tempo</th><th>Status</th></tr></thead>
                  <tbody>
                    {tenant.invoices.map(inv => (
                      <tr key={inv.id}>
                        <td><span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">{inv.invoiceNo}</span></td>
                        <td className="text-gray-600">{inv.period}</td>
                        <td className="text-gray-600 capitalize text-[12px]">{(inv.invoiceType || '').replace(/_/g, ' ')}</td>
                        <td className="text-right font-semibold">{fmt(inv.totalAmount)}</td>
                        <td className="text-gray-500 text-[12px]">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('id-ID') : '-'}</td>
                        <td><Badge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center">
              <DollarSign size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[13px] text-gray-500 font-medium">Belum ada tagihan</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {tab === 'notes' && (
        <div className="space-y-4 fade-in">
          <div className="flex justify-between items-center">
            <p className="text-[13px] text-gray-500">{tenant.tenantNotes?.length || 0} catatan</p>
            <button className="btn btn-primary btn-sm" onClick={() => setNoteModal(true)}><Plus size={14} /> Tambah Catatan</button>
          </div>
          {tenant.tenantNotes?.length > 0 ? (
            <div className="space-y-3">
              {tenant.tenantNotes.map(n => (
                <div key={n.id} className="card p-4">
                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Users size={11} /> {n.createdBy || 'System'}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {n.noteType !== 'general' && <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded">{n.noteType}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <StickyNote size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[13px] text-gray-500 font-medium">Belum ada catatan</p>
              <p className="text-[12px] text-gray-400 mt-1">Tambahkan catatan tentang tenant ini</p>
            </div>
          )}

          <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Tambah Catatan">
            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea className="input min-h-[120px] resize-y" placeholder="Tulis catatan..." required value={noteContent} onChange={e => setNoteContent(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setNoteModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
