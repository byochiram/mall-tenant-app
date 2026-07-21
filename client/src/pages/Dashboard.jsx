import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboard, getPortalProfile, getPortalInvoices, getPortalPayments } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Badge, Loading, fmt } from '../components/UI';
import { Users, Building2, TrendingUp, DollarSign, AlertTriangle, CreditCard, Layers, MapPin, Calendar, FileText, ArrowRight, ArrowUpRight, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { gradients } from '../utils/constants';

function StatCard({ icon: Icon, label, value, sub, index = 0, trend, trendUp }) {
  return (
    <div className="card overflow-hidden fade-in">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: gradients[index % gradients.length] }}>
            <Icon size={18} className="text-white" />
          </div>
          {trend && (
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {trendUp ? <ArrowUpRight size={11} /> : <ArrowUpRight size={11} className="rotate-90" />}
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[22px] font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
        {sub && <p className="text-[12px] text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="h-1" style={{ background: gradients[index % gradients.length] }} />
    </div>
  );
}

function SectionCard({ icon: Icon, iconColor, title, subtitle, children, action }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}12` }}>
            <Icon size={15} style={{ color: iconColor }} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return <div className="empty-state"><div className="emoji">⚠️</div><p>Gagal memuat data dashboard</p></div>;

  const { overview, occupancy, financial, contracts, recentPayments, categoryStats, floorStats } = data;
  const maxCat = Math.max(...(categoryStats || []).map(c => c.count), 1);
  const maxFloor = Math.max(...(floorStats || []).map(f => f.count), 1);
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Ringkasan operasional mall hari ini</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Tenant" value={overview.totalTenants} sub={`${overview.activeTenants} aktif, ${overview.prospectTenants} prospek`} index={0} trend="+12%" trendUp />
        <StatCard icon={TrendingUp} label="Occupancy" value={`${occupancy.occupancyRate}%`} sub={`${occupancy.occupiedUnits} dari ${occupancy.totalUnits} unit terisi`} index={1} trend="+5%" trendUp />
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(financial.totalRevenue)} sub={`${contracts.activeContracts} kontrak aktif`} index={2} trend="+18%" trendUp />
        <StatCard icon={AlertTriangle} label="Overdue" value={fmt(financial.totalOverdue)} sub={`${contracts.expiringContracts} kontrak akan habis`} index={4} trend="-3%" />
      </div>

      {/* Revenue + Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard icon={DollarSign} iconColor="#10b981" title="Revenue Breakdown" subtitle="Total pemasukan berdasarkan status">
          <div className="space-y-4">
            {[
              { label: 'Lunas', value: financial.totalRevenue, color: '#10b981', icon: CheckCircle },
              { label: 'Pending', value: financial.totalPending, color: '#f59e0b', icon: Clock },
              { label: 'Overdue', value: financial.totalOverdue, color: '#ef4444', icon: AlertTriangle },
            ].map(r => {
              const total = financial.totalRevenue + financial.totalPending + financial.totalOverdue || 1;
              return (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <r.icon size={13} style={{ color: r.color }} />
                      <span className="text-[13px] text-gray-600">{r.label}</span>
                    </div>
                    <span className="text-[13px] font-bold text-gray-900">{fmt(r.value)}</span>
                  </div>
                  <ProgressBar value={r.value} max={total} color={r.color} />
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard icon={AlertTriangle} iconColor="#f59e0b" title="Kontrak Akan Habis" subtitle="Dalam 3 bulan ke depan">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 rounded-full border-4 border-amber-100 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-amber-600">{contracts.expiringContracts}</span>
            </div>
            <p className="text-[13px] text-gray-500 font-medium">kontrak perlu diperpanjang</p>
            {contracts.expiringContracts > 0 && (
              <button className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Lihat Detail <ChevronRight size={12} />
              </button>
            )}
          </div>
        </SectionCard>

        <SectionCard icon={Layers} iconColor="#6366f1" title="Occupancy" subtitle="Distribusi unit">
          <div className="space-y-4">
            {[
              { label: 'Terisi', value: occupancy.occupiedUnits, total: occupancy.totalUnits, color: '#6366f1' },
              { label: 'Kosong', value: occupancy.availableUnits, total: occupancy.totalUnits, color: '#a5b4fc' },
            ].map(o => (
              <div key={o.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-gray-600">{o.label}</span>
                  <span className="text-[13px] font-bold text-gray-900">{o.value} unit</span>
                </div>
                <ProgressBar value={o.value} max={o.total} color={o.color} />
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[12px] text-gray-400">Total Lantai</span>
              <span className="text-[15px] font-bold text-gray-900">{(floorStats || []).length}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Category + Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard icon={TrendingUp} iconColor="#6366f1" title="Tenant per Kategori" subtitle="Distribusi berdasarkan jenis usaha" className="lg:col-span-2">
          <div className="space-y-3.5">
            {(categoryStats || []).map((cat, i) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
                    <span className="text-[13px] font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">{cat.count} tenant</span>
                    <span className="text-[12px] font-bold text-gray-700 w-8 text-right">{Math.round((cat.count / maxCat) * 100)}%</span>
                  </div>
                </div>
                <ProgressBar value={cat.count} max={maxCat} color={colors[i % colors.length]} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Building2} iconColor="#06b6d4" title="Tenant per Lantai" subtitle="Distribusi per lantai">
          <div className="space-y-3.5">
            {(floorStats || []).map((f, i) => (
              <div key={f.floor}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-gray-700">{f.name || `Lantai ${f.floor}`}</span>
                  <span className="text-[12px] font-bold text-gray-700">{f.count}</span>
                </div>
                <ProgressBar value={f.count} max={maxFloor} color={colors[i % colors.length]} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent Payments */}
      <SectionCard icon={CreditCard} iconColor="#10b981" title="Pembayaran Terakhir" subtitle={`${(recentPayments || []).length} transaksi terbaru`}>
        <div className="table-container">
          <table>
            <thead><tr><th>Invoice</th><th>Tenant</th><th>Metode</th><th style={{ textAlign: 'right' }}>Jumlah</th><th>Status</th></tr></thead>
            <tbody>
              {(recentPayments || []).length > 0 ? recentPayments.map((p, i) => (
                <tr key={p.paymentNo || i}>
                  <td><span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded">{p.invoice?.invoiceNo || '-'}</span></td>
                  <td>
                    <p className="font-medium text-gray-800 text-[13px]">{p.tenant?.businessName || '-'}</p>
                    <p className="text-[11px] text-gray-400">{p.tenant?.code || ''}</p>
                  </td>
                  <td className="text-gray-500 capitalize text-[12px]">{(p.paymentMethod || '').replace(/_/g, ' ')}</td>
                  <td style={{ textAlign: 'right' }} className="font-bold text-gray-900 text-[13px]">{fmt(p.amount)}</td>
                  <td><Badge status={p.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-[13px]">Belum ada pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function TenantDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPortalProfile().then(r => setProfile(r.data)).catch(() => {}),
      getPortalInvoices().then(r => setInvoices(r.data)).catch(() => {}),
      getPortalPayments().then(r => setPayments(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!profile) return <div className="text-center py-12 text-gray-400">Gagal memuat data</div>;

  const unit = profile.tenantUnits?.[0]?.unit;
  const contract = profile.contracts?.[0];
  const unpaid = invoices.filter(i => ['sent', 'pending', 'overdue'].includes(i.status));
  const totalUnpaid = unpaid.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.totalAmount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Halo, {profile.businessName}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Berikut ringkasan akun Anda hari ini</p>
      </div>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="h-2" style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)' }} />
        <div className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f0ff, #e0f2fe)' }}>
            <Building2 size={26} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{profile.businessName}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-gray-400 font-mono">{profile.code}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{profile.category?.name}</span>
              {unit && <><span className="text-gray-300">·</span><span className="flex items-center gap-1 text-gray-500"><MapPin size={12} /> L{unit.floor?.number} / {unit.unitNumber}</span></>}
            </div>
          </div>
          <Badge status={profile.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Belum Dibayar', value: unpaid.length, sub: fmt(totalUnpaid), color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
          { icon: CheckCircle, label: 'Sudah Dibayar', value: paidCount, sub: fmt(totalPaid), color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
          { icon: AlertTriangle, label: 'Jatuh Tempo', value: overdueCount, sub: overdueCount > 0 ? 'Segera bayar!' : 'Aman', color: overdueCount > 0 ? '#ef4444' : '#10b981', gradient: overdueCount > 0 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)' },
          { icon: Calendar, label: 'Kontrak Hingga', value: contract ? new Date(contract.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-', sub: contract ? `${contract.durationMonths} bulan` : '-', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
        ].map((s, i) => (
          <div key={s.label} className="card overflow-hidden fade-in">
            <div className="p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: s.gradient }}>
                <s.icon size={16} className="text-white" />
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
            <div className="h-1" style={{ background: s.gradient }} />
          </div>
        ))}
      </div>

      {/* Contract + Unpaid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard icon={FileText} iconColor="#6366f1" title="Informasi Kontrak" subtitle="Detail kontrak aktif Anda">
          {contract ? (
            <div className="space-y-0">
              {[
                { l: 'No. Kontrak', v: contract.contractNumber },
                { l: 'Periode', v: `${new Date(contract.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — ${new Date(contract.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` },
                { l: 'Sewa Tetap', v: fmt(contract.fixedRent) },
                { l: 'Service Charge', v: fmt(contract.serviceCharge) },
                { l: 'Jatuh Tempo Bayar', v: `Tanggal ${contract.paymentDueDay} setiap bulan` },
              ].map(f => (
                <div key={f.l} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{f.l}</span>
                  <span className="text-sm font-semibold text-gray-800">{f.v}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ada kontrak aktif</p>
          )}
        </SectionCard>

        <SectionCard icon={AlertTriangle} iconColor="#f59e0b" title="Tagihan Belum Dibayar" action={
          <button onClick={() => navigate('/tenant-portal')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Lihat Semua <ArrowRight size={12} />
          </button>
        }>
          {unpaid.length > 0 ? (
            <div className="space-y-0">
              {unpaid.slice(0, 4).map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{inv.invoiceNo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{inv.period} · Jatuh tempo {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{fmt(inv.totalAmount)}</p>
                    <Badge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle size={40} className="mx-auto text-emerald-300 mb-2" />
              <p className="text-sm text-gray-400">Semua tagihan sudah lunas</p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recent payments */}
      {payments.length > 0 && (
        <SectionCard icon={CreditCard} iconColor="#10b981" title="Riwayat Pembayaran" subtitle={`${payments.length} pembayaran tercatat`} action={
          <button onClick={() => navigate('/tenant-portal')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Lihat Semua <ArrowRight size={12} />
          </button>
        }>
          <div className="space-y-0">
            {payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CreditCard size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.paymentNo}</p>
                    <p className="text-xs text-gray-400">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID') : '-'} · {(p.paymentMethod || '').replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{fmt(p.amount)}</p>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'tenant_user') return <TenantDashboard />;
  return <AdminDashboard />;
}
