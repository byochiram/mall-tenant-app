import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { getTenant, createTenant, updateTenant, getCategories } from '../services/api';

export default function TenantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', categoryId: '', floor: '', unitNumber: '',
    contactName: '', contactPhone: '', contactEmail: '',
    status: 'active', leaseStart: '', leaseEnd: '', monthlyRent: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(console.error);
    if (id) {
      getTenant(id).then((r) => {
        const t = r.data;
        setForm({
          name: t.name,
          categoryId: t.categoryId,
          floor: t.floor,
          unitNumber: t.unitNumber,
          contactName: t.contactName,
          contactPhone: t.contactPhone,
          contactEmail: t.contactEmail || '',
          status: t.status,
          leaseStart: t.leaseStart?.split('T')[0] || '',
          leaseEnd: t.leaseEnd?.split('T')[0] || '',
          monthlyRent: t.monthlyRent,
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, categoryId: parseInt(form.categoryId), monthlyRent: parseFloat(form.monthlyRent) };
      if (id) await updateTenant(id, payload);
      else await createTenant(payload);
      navigate('/tenants');
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl fade-in">
      <button onClick={() => navigate('/tenants')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Tenants
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{id ? 'Edit Tenant' : 'Add New Tenant'}</h1>
        <p className="text-sm text-gray-500 mt-1">{id ? 'Update tenant information' : 'Fill in the details to register a new tenant'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-static p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={16} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tenant Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Warung Nusantara" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="input-field">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} required className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Floor</label>
              <input name="floor" value={form.floor} onChange={handleChange} required placeholder="e.g. GF, 1, 2" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Number</label>
              <input name="unitNumber" value={form.unitNumber} onChange={handleChange} required placeholder="e.g. GF-01" className="input-field" />
            </div>
          </div>
        </div>

        <div className="card-static p-6">
          <h2 className="font-bold text-gray-900 mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
              <input name="contactName" value={form.contactName} onChange={handleChange} required placeholder="Full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} required placeholder="08xxxxxxxxxx" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-gray-400 font-normal">(optional)</span></label>
              <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="email@example.com" className="input-field" />
            </div>
          </div>
        </div>

        <div className="card-static p-6">
          <h2 className="font-bold text-gray-900 mb-6">Lease Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lease Start</label>
              <input name="leaseStart" type="date" value={form.leaseStart} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lease End</label>
              <input name="leaseEnd" type="date" value={form.leaseEnd} onChange={handleChange} required className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rent (IDR)</label>
              <input name="monthlyRent" type="number" value={form.monthlyRent} onChange={handleChange} required placeholder="e.g. 15000000" className="input-field" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={16} />
            {loading ? 'Saving...' : id ? 'Update Tenant' : 'Create Tenant'}
          </button>
          <button type="button" onClick={() => navigate('/tenants')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}