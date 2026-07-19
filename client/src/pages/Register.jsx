import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerTenant } from '../services/api';
import { Building2, Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, CheckCircle, Mail, Lock, User, Phone, KeyRound, ChevronRight } from 'lucide-react';
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
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&q=80)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.88) 0%, rgba(30,41,59,0.82) 50%, rgba(15,23,42,0.92) 100%)' }} />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-10 lg:p-14 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">MallManager</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Tenant Management System</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-[34px] lg:text-[38px] font-bold text-white leading-[1.15] tracking-tight">
              Akses portal tenant Anda secara mandiri
            </h2>
            <p className="text-slate-300 mt-5 text-[15px] leading-relaxed">
              Daftar untuk melihat kontrak, tagihan, dan melakukan pembayaran secara online kapan saja dan di mana saja.
            </p>

            <div className="mt-10 space-y-3">
              {[
                { icon: Shield, title: 'Kontrak Sewa', desc: 'Lihat detail kontrak, masa berlaku, dan riwayat perpanjangan' },
                { icon: BarChart3, title: 'Tagihan & Pembayaran', desc: 'Pantau tagihan, bayar online, dan unduh bukti pembayaran' },
                { icon: Users, title: 'Portal Mandiri', desc: 'Kelola data kontak, unggah dokumen, dan ajukan permintaan' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3.5 rounded-xl p-4 transition-all hover:translate-x-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <f.icon size={18} className="text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{f.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">© 2026 MallManager. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto" style={{ background: '#fafafa' }}>
        <div className="w-full max-w-[400px] py-4">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">MallManager</span>
          </div>

          <div className="mb-7">
            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Buat Akun Tenant</h2>
            <p className="text-[15px] text-gray-500 mt-2">Daftar untuk mengakses portal tenant Anda</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100 animate-shake">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kode Tenant</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <KeyRound size={16} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                  value={form.tenantCode}
                  onChange={e => setForm({ ...form, tenantCode: e.target.value.toUpperCase() })}
                  placeholder="TNT-0001"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 pl-1">Kode diberikan oleh manajemen mall</p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama pemilik/penanggung jawab"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">No. Telepon <span className="font-normal text-gray-400">(opsional)</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Konfirmasi</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-[13px] text-blue-700 bg-blue-50 border border-blue-100">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">Setelah registrasi, Anda bisa langsung login untuk melihat tagihan, kontrak, dan melakukan pembayaran.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-[15px] font-semibold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Daftar
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-7">
            Sudah punya akun?{' '}
            <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors inline-flex items-center gap-0.5">
              Masuk <ChevronRight size={14} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
