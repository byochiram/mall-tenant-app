import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Building2, Filter, X } from 'lucide-react';
import { getTenants, deleteTenant, getCategories } from '../services/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    if (filterCategory) params.category = filterCategory;
    getTenants(params)
      .then((r) => setTenants(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus, filterCategory]);
  useEffect(() => { getCategories().then((r) => setCategories(r.data)).catch(console.error); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus tenant ini? Semua data pembayaran terkait juga akan dihapus.')) return;
    await deleteTenant(id);
    load();
  };

  const hasFilters = filterStatus || filterCategory;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all mall tenants</p>
        </div>
        <Link to="/tenants/new" className="btn-primary">
          <Plus size={16} /> Add Tenant
        </Link>
      </div>

      <div className="card-static p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, contact, or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto min-w-[130px]">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field w-auto min-w-[150px]">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {hasFilters && (
              <button onClick={() => { setFilterStatus(''); setFilterCategory(''); }} className="btn-secondary text-xs">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading tenants...</p>
          </div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="card-static p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">No tenants found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th>Lease End</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <>
                    <tr key={t.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {t.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">{t.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {t.category?.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-gray-600">{t.floor}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="font-medium text-gray-900">{t.unitNumber}</span>
                      </td>
                      <td>
                        <div>
                          <p className="text-gray-900 font-medium">{t.contactName}</p>
                          <p className="text-xs text-gray-400">{t.contactPhone}</p>
                        </div>
                      </td>
                      <td className="font-semibold text-gray-900">{fmt(t.monthlyRent)}</td>
                      <td>
                        <span className={`badge badge-${t.status}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {new Date(t.leaseEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelected(selected === t.id ? null : t.id)} className="icon-btn" title="View Payments">
                            {selected === t.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <Link to={`/tenants/${t.id}/edit`} className="icon-btn hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
                            <Edit size={14} />
                          </Link>
                          <button onClick={() => handleDelete(t.id)} className="icon-btn hover:bg-red-50 hover:text-red-600" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selected === t.id && (
                      <tr key={`${t.id}-payments`}>
                        <td colSpan={8} className="p-0">
                          <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-5 slide-in border-t border-b border-indigo-100">
                            <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                                <Eye size={10} className="text-indigo-600" />
                              </div>
                              Recent Payments — {t.name}
                            </h4>
                            {t.payments?.length > 0 ? (
                              <div className="grid gap-2">
                                {t.payments.map((p) => (
                                  <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-indigo-100/50">
                                    <div className="flex items-center gap-4">
                                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{p.invoiceNo}</span>
                                      <span className="text-sm capitalize text-gray-600">{p.type}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="font-semibold text-sm">{fmt(p.amount)}</span>
                                      <span className={`badge ${p.status === 'paid' ? 'badge-paid' : p.status === 'pending' ? 'badge-pending' : 'badge-overdue'}`}>
                                        {p.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No payment records</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
