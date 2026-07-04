import { useState, useEffect } from 'react';
import { Plus, Check, X, CreditCard, DollarSign, Clock, AlertTriangle, Filter } from 'lucide-react';
import { getPayments, getTenants, createPayment, updatePaymentStatus, deletePayment } from '../services/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tenantId: '', amount: '', type: 'rent', dueDate: '', notes: '' });

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    getPayments(params)
      .then((r) => setPayments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterType]);
  useEffect(() => { getTenants().then((r) => setTenants(r.data)).catch(console.error); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPayment({ ...form, tenantId: parseInt(form.tenantId), amount: parseFloat(form.amount) });
      setShowForm(false);
      setForm({ tenantId: '', amount: '', type: 'rent', dueDate: '', notes: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating payment');
    }
  };

  const handleStatus = async (id, status) => {
    await updatePaymentStatus(id, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pembayaran ini?')) return;
    await deletePayment(id);
    load();
  };

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all tenant payments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> New Payment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-static p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <DollarSign size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Paid</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{fmt(totalPaid)}</p>
          </div>
        </div>
        <div className="card-static p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{fmt(totalPending)}</p>
          </div>
        </div>
        <div className="card-static p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Overdue</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{fmt(totalOverdue)}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-static p-6 slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard size={16} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900">Create New Payment</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tenant</label>
              <select value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required className="input-field">
                <option value="">Select Tenant</option>
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.unitNumber})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="input-field">
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (IDR)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary">Create Payment</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card-static p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={14} />
          <span className="font-medium">Filters:</span>
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto min-w-[130px]">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-auto min-w-[130px]">
          <option value="">All Types</option>
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="maintenance">Maintenance</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading payments...</p>
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="card-static p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">No payments found</p>
          <p className="text-sm text-gray-400 mt-1">Create a new payment to get started</p>
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Tenant</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="group">
                    <td>
                      <span className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg">{p.invoiceNo}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                          {p.tenant?.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{p.tenant?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="capitalize text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">{p.type}</span>
                    </td>
                    <td className="font-semibold text-gray-900">{fmt(p.amount)}</td>
                    <td className="text-sm text-gray-500">
                      {new Date(p.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'paid' ? 'badge-paid' : p.status === 'pending' ? 'badge-pending' : 'badge-overdue'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {p.paidDate
                        ? new Date(p.paidDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.status !== 'paid' && (
                          <button onClick={() => handleStatus(p.id, 'paid')} className="icon-btn hover:bg-emerald-50 hover:text-emerald-600" title="Mark as Paid">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id)} className="icon-btn hover:bg-red-50 hover:text-red-600" title="Delete">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
