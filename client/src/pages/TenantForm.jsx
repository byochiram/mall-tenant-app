import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTenant, createTenant, updateTenant, getCategories } from '../services/api';
import { PageHeader, Loading } from '../components/UI';
import { Save, ArrowLeft } from 'lucide-react';

const TENANT_TYPES = [
  { value: 'inline', label: 'Inline' },
  { value: 'anchor', label: 'Anchor' },
  { value: 'kiosk', label: 'Kiosk' },
  { value: 'popup', label: 'Popup' },
  { value: 'seasonal', label: 'Seasonal' },
];

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
];

const emptyForm = {
  businessName: '',
  legalName: '',
  brandName: '',
  categoryId: '',
  tenantType: 'inline',
  status: 'prospect',
  joinDate: '',
  website: '',
  notes: '',
};

export default function TenantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getTenant(id)
      .then(({ data }) => {
        setForm({
          businessName: data.businessName || '',
          legalName: data.legalName || '',
          brandName: data.brandName || '',
          categoryId: data.categoryId || data.category?.id || '',
          tenantType: data.tenantType || 'inline',
          status: data.status || 'prospect',
          joinDate: data.joinDate ? data.joinDate.slice(0, 10) : '',
          website: data.website || '',
          notes: data.notes || '',
        });
      })
      .catch(() => navigate('/tenants'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateTenant(id, form);
        toast.success('Tenant berhasil diperbarui');
      } else {
        await createTenant(form);
        toast.success('Tenant berhasil ditambahkan');
      }
      navigate('/tenants');
    } catch (err) {
      toast.error('Gagal menyimpan tenant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Tenant' : 'Tambah Tenant'}
        subtitle={isEdit ? 'Perbarui informasi tenant' : 'Daftarkan tenant baru'}
        actions={
          <button
            className="btn btn-secondary flex items-center gap-2"
            onClick={() => navigate('/tenants')}
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="card p-6 space-y-6" aria-disabled={saving}>
        <fieldset disabled={saving} style={{ border: 'none', padding: 0, margin: 0 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              Nama Usaha <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
              placeholder="Masukkan nama usaha"
            />
          </div>

          <div>
            <label className="label">Nama Legal</label>
            <input
              className="input"
              name="legalName"
              value={form.legalName}
              onChange={handleChange}
              placeholder="Nama sesuai dokumen resmi"
            />
          </div>

          <div>
            <label className="label">Nama Brand</label>
            <input
              className="input"
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              placeholder="Nama brand / merek dagang"
            />
          </div>

          <div>
            <label className="label">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              className="input"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tipe Tenant</label>
            <select
              className="input"
              name="tenantType"
              value={form.tenantType}
              onChange={handleChange}
            >
              {TENANT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Tanggal Bergabung</label>
            <input
              className="input"
              type="date"
              name="joinDate"
              value={form.joinDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Website</label>
            <input
              className="input"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="label">Catatan</label>
          <textarea
            className="input min-h-[100px] resize-y"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Catatan tambahan mengenai tenant..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tenants')}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
