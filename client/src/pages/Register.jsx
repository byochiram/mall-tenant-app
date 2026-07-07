import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerTenant } from '../services/api';
import { Building2, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', tenantCode: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      const { data } = await registerTenant({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        tenantCode: form.tenantCode,
      });
      loginUser(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MallManager</h1>
          <p className="text-slate-400 mt-2 text-sm">Daftar Akun Tenant</p>
        </div>

        <div className="card p-8">
          <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Login
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Buat Akun Tenant</h2>
          <p className="text-sm text-gray-500 mb-6">Daftar untuk mengakses portal tenant Anda</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Kode Tenant *</label>
              <input className="input" value={form.tenantCode} onChange={e => setForm({ ...form, tenantCode: e.target.value.toUpperCase() })} placeholder="TNT-0001" required />
              <p className="text-[11px] text-gray-400 mt-1">Kode tenant diberikan oleh manajemen mall</p>
            </div>

            <div>
              <label className="label">Nama Lengkap *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama pemilik/penanggung jawab" required />
            </div>

            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" required />
            </div>

            <div>
              <label className="label">No. Telepon</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input pr-10" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 karakter" required />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Konfirmasi *</label>
                <input type="password" className="input" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Ulangi password" required />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl px-3.5 py-3 text-xs text-blue-700 flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <span>Setelah registrasi, Anda bisa langsung login untuk melihat tagihan, kontrak, dan melakukan pembayaran.</span>
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Memproses...' : <span className="flex items-center gap-1.5">Daftar <ArrowRight size={15} /></span>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Sudah punya akun? <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Masuk di sini</a>
          </p>
        </div>
      </div>
    </div>
  );
}
