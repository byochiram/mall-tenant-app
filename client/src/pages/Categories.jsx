import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X, Save } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const categoryIcons = ['🍽️', '🛍️', '🎮', '💇', '📱', '🏪', '🎬', '☕'];
const categoryGradients = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #22d3ee)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #ef4444, #f87171)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = () => {
    setLoading(true);
    getCategories()
      .then((r) => setCategories(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await updateCategory(editId, form);
      else await createCategory(form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      setEditId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving category');
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot delete category');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize tenants by business category</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '' }); }} className="btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-static p-6 max-w-lg slide-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Tag size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-bold text-gray-900">{editId ? 'Edit Category' : 'New Category'}</h2>
            </div>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="icon-btn">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Food & Beverage" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief description..." className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary">
              <Save size={16} />
              {editId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading categories...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card-static p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Tag size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">No categories yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first category to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <div key={cat.id} className="card group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
                      style={{ background: categoryGradients[i % categoryGradients.length] }}>
                      {categoryIcons[i % categoryIcons.length]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{cat.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(cat)} className="icon-btn hover:bg-indigo-50 hover:text-indigo-600">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="icon-btn hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-indigo-600">{cat._count?.tenants || 0}</span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">tenants</span>
                  </div>
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min((cat._count?.tenants || 0) * 20, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
