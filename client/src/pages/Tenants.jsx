import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTenants, deleteTenant, getCategories } from '../services/api';
import { Badge, Loading, ConfirmModal, Pagination } from '../components/UI';
import { Plus, Search, Building2, Phone, MapPin, Edit, Trash2, Eye, Filter, Users, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';

const gradients = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
];

export default function Tenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      const { data } = await getTenants(params);
      setTenants(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (!search && !statusFilter && !categoryFilter) setTotalCount(data.total);
    } catch {} finally { setLoading(false); }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);
  useEffect(() => { getCategories().then(({ data }) => setCategories(data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteTenant(deleteTarget.id); setDeleteTarget(null); fetchTenants(); } catch {}
  };

  const stats = useMemo(() => ({
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    prospect: tenants.filter(t => t.status === 'prospect').length,
    terminated: tenants.filter(t => t.status === 'terminated').length,
  }), [tenants]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tenant</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Kelola seluruh tenant yang terdaftar di mall</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/tenants/new')}>
          <Plus size={15} /> Tambah Tenant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Building2, label: 'Total Tenant', value: total, color: '#6366f1', gradient: gradients[0] },
          { icon: Users, label: 'Aktif', value: stats.active, color: '#10b981', gradient: gradients[2] },
          { icon: TrendingUp, label: 'Prospek', value: stats.prospect, color: '#06b6d4', gradient: gradients[1] },
          { icon: AlertTriangle, label: 'Terminated', value: stats.terminated, color: '#f59e0b', gradient: gradients[3] },
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

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3 p-4">
          <div className="input-icon-wrapper flex-1 min-w-[200px]">
            <Search size={16} className="input-icon" />
            <input type="text" className="input" placeholder="Cari tenant berdasarkan nama, kode, atau brand..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="input-icon-wrapper">
            <Filter size={14} className="input-icon" />
            <select className="input pr-8 appearance-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="prospect">Prospek</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div className="input-icon-wrapper">
            <Building2 size={14} className="input-icon" />
            <select className="input pr-8 appearance-none cursor-pointer" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {(search || statusFilter || categoryFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); }} className="btn btn-secondary btn-sm">Reset</button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? <Loading /> : tenants.length === 0 ? (
        <div className="card p-10 text-center">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[13px] text-gray-500 font-medium">Tidak ada tenant ditemukan</p>
          <p className="text-[12px] text-gray-400 mt-1">
            {search || statusFilter || categoryFilter ? 'Coba ubah filter atau kata kunci pencarian' : 'Mulai dengan menambahkan tenant baru'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Kategori</th>
                  <th>Lokasi</th>
                  <th>Kontak Utama</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => {
                  const unit = t.tenantUnits?.[0]?.unit;
                  const contact = t.contacts?.[0];
                  return (
                    <tr key={t.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: gradients[t.id % gradients.length] }}>
                            {t.businessName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate(`/tenants/${t.id}`)}>{t.businessName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{t.code}</span>
                              {t.brandName && <span className="text-[11px] text-gray-400">{t.brandName}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-[12px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{t.category?.name || '-'}</span>
                      </td>
                      <td>
                        {unit ? (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                            <MapPin size={12} className="text-gray-400" />
                            <span>L{unit.floor?.number} / {unit.unitNumber}</span>
                          </div>
                        ) : <span className="text-[12px] text-gray-400">-</span>}
                      </td>
                      <td>
                        {contact ? (
                          <div>
                            <p className="text-[12px] text-gray-800 font-medium">{contact.name}</p>
                            {contact.phone && <span className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5"><Phone size={10} /> {contact.phone}</span>}
                          </div>
                        ) : <span className="text-[12px] text-gray-400">-</span>}
                      </td>
                      <td><Badge status={t.status} /></td>
                      <td>
                        <div className="flex items-center justify-end gap-0.5">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Detail" onClick={() => navigate(`/tenants/${t.id}`)}>
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit" onClick={() => navigate(`/tenants/${t.id}/edit`)}>
                            <Edit size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus" onClick={() => setDeleteTarget(t)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={10} onChange={setPage} />
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Tenant" message={`Yakin ingin menghapus "${deleteTarget?.businessName}"? Tindakan ini tidak dapat dibatalkan.`} />
    </div>
  );
}
