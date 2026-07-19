import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerTenant } from '../services/api';
import { Building2, Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-10 lg:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">MallManager</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Tenant Management</p>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-md">
            <h2 className="text-[32px] lg:text-[36px] font-bold text-white leading-tight tracking-tight">
              Akses portal tenant Anda secara mandiri
            </h2>
            <p className="text-slate-400 mt-4 text-base leading-relaxed">
              Daftar untuk melihat kontrak, tagihan, dan melakukan pembayaran secara online kapan saja dan di mana saja.
            </p>

            {/* Feature cards */}
            <div className="mt-8 space-y-3">
              {[
                { icon: Shield, title: 'Kontrak Sewa', desc: 'Lihat detail kontrak, masa berlaku, dan riwayat perpanjangan' },
                { icon: BarChart3, title: 'Tagihan & Pembayaran', desc: 'Pantau tagihan, bayar online, dan unduh bukti pembayaran' },
                { icon: Users, title: 'Portal Mandiri', desc: 'Kelola data kontak, unggah dokumen, dan ajukan permintaan' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3.5 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                    <f.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{f.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-slate-500">© 2026 MallManager. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14" style={{ background: '#fafafa' }}>
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">MallManager</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Buat Akun Tenant</h2>
            <p className="text-base text-gray-500 mt-1.5">Daftar untuk mengakses portal tenant Anda</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Kode Tenant</label>
              <input
                className="input"
                value={form.tenantCode}
                onChange={e => setForm({ ...form, tenantCode: e.target.value.toUpperCase() })}
                placeholder="TNT-0001"
                required
                autoFocus
              />
              <p className="text-[11px] text-gray-400 mt-1">Kode diberikan oleh manajemen mall</p>
            </div>

            <div>
              <label className="label">Nama Lengkap</label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nama pemilik/penanggung jawab"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                required
              />
            </div>

            <div>
              <label className="label">No. Telepon <span className="text-gray-300">(opsional)</span></label>
              <input
                className="input"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-11"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Konfirmasi</label>
                <input
                  type="password"
                  className="input"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Ulangi password"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl px-3.5 py-3 text-xs text-blue-700 flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <span>Setelah registrasi, Anda bisa langsung login untuk melihat tagihan, kontrak, dan melakukan pembayaran.</span>
            </div>

            <button
              type="submit"
              className="btn w-full justify-center py-2.5 text-[14px] mt-2"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Daftar <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Sudah punya akun?{' '}
            <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
