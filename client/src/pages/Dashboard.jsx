import { useState, useEffect } from 'react';
import { Building2, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Users, Wallet } from 'lucide-react';
import { getDashboard } from '../services/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const gradients = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
];

function StatCard({ icon: Icon, label, value, trend, trendUp, gradient, delay }) {
  return (
    <div className="stat-card fade-in" style={{ background: gradient, animationDelay: `${delay}ms` }}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon size={20} className="text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trendUp ? 'bg-white/20' : 'bg-white/20'}`}>
              {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend}
            </div>
          )}
        </div>
        <p className="text-white/70 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="card-static p-8 text-center">
      <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">Gagal memuat data dashboard</p>
    </div>
  );

  const maxFloorCount = Math.max(...data.tenantsByFloor.map(f => f._count), 1);
  const floorColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of mall tenant management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Tenants" value={data.totalTenants} trend="+12%" trendUp gradient={gradients[0]} delay={0} />
        <StatCard icon={Building2} label="Active Tenants" value={data.activeTenants} trend="+5%" trendUp gradient={gradients[2]} delay={50} />
        <StatCard icon={Wallet} label="Total Revenue" value={fmt(data.totalRevenue)} trend="+18%" trendUp gradient={gradients[1]} delay={100} />
        <StatCard icon={AlertTriangle} label="Overdue Payments" value={fmt(data.totalOverdue)} trend="-3%" gradient={gradients[4]} delay={150} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-static p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Revenue by Category</h2>
              <p className="text-xs text-gray-400 mt-0.5">Breakdown of paid revenue per category</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-indigo-600" />
            </div>
          </div>
          <div className="space-y-5">
            {data.categoryRevenue.map((cat, i) => {
              const maxRev = Math.max(...data.categoryRevenue.map(c => c.revenue), 1);
              return (
                <div key={cat.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: gradients[i % gradients.length] }} />
                      <span className="font-semibold text-sm text-gray-700">{cat.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.tenantCount} tenants</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900">{fmt(cat.revenue)}</span>
                  </div>
                  <ProgressBar value={cat.revenue} max={maxRev} color={gradients[i % gradients.length]} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-static p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">By Floor</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tenant distribution</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Building2 size={16} className="text-cyan-600" />
            </div>
          </div>
          <div className="space-y-4">
            {data.tenantsByFloor.map((f, i) => (
              <div key={f.floor}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-700">Floor {f.floor}</span>
                  <span className="text-sm font-bold text-gray-900">{f._count}</span>
                </div>
                <ProgressBar value={f._count} max={maxFloorCount} color={floorColors[i % floorColors.length]} />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Floors</span>
              <span className="font-bold text-lg text-gray-900">{data.tenantsByFloor.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-static p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-gray-900">Recent Payments</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 10 payment transactions</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CreditCard size={16} className="text-emerald-600" />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Tenant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.map((p) => (
                <tr key={p.id}>
                  <td><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md">{p.invoiceNo}</span></td>
                  <td className="font-medium text-gray-900">{p.tenant?.name}</td>
                  <td>
                    <span className="capitalize text-gray-600">{p.type}</span>
                  </td>
                  <td className="font-semibold text-gray-900">{fmt(p.amount)}</td>
                  <td>
                    <span className={`badge ${p.status === 'paid' ? 'badge-paid' : p.status === 'pending' ? 'badge-pending' : 'badge-overdue'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
