import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { Building2, Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, Mail, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      loginUser(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e) => { setEmail(e); setPassword('password123'); };

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
              Kelola seluruh tenant mall Anda dalam satu platform
            </h2>
            <p className="text-slate-300 mt-5 text-[15px] leading-relaxed">
              Pantau kontrak sewa, tagihan, pembayaran, dan performa tenant secara real-time untuk operasional yang lebih efisien.
            </p>

            <div className="mt-10 space-y-3">
              {[
                { icon: Shield, title: 'Manajemen Kontrak', desc: 'Kelola kontrak sewa, perpanjangan, dan terminasi' },
                { icon: BarChart3, title: 'Billing & Payment', desc: 'Tagihan otomatis, tracking pembayaran, aging report' },
                { icon: Users, title: 'Tenant Directory', desc: 'Database tenant, kontak, dokumen, dan catatan' },
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14" style={{ background: '#fafafa' }}>
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">MallManager</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Selamat datang kembali</h2>
            <p className="text-[15px] text-gray-500 mt-2">Masukkan akun Anda untuk melanjutkan</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100 animate-shake">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@mall.com"
                  required
                  autoFocus
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-semibold text-gray-700">Password <span className="text-red-500">*</span></label>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 text-[14px] rounded-xl border-[1.5px] border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              onMouseOver={e => !loading && (e.target.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)')}
              onMouseOut={e => e.target.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3)'}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Akun Demo</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { e: 'admin@mall.com', r: 'Super Admin', color: '#6366f1', bg: '#eef2ff' },
                { e: 'leasing@mall.com', r: 'Leasing Mgr', color: '#06b6d4', bg: '#ecfeff' },
                { e: 'leasing.staff@mall.com', r: 'Leasing Stf', color: '#22d3ee', bg: '#ecfeff' },
                { e: 'finance@mall.com', r: 'Finance Mgr', color: '#10b981', bg: '#ecfdf5' },
                { e: 'accounting@mall.com', r: 'Accounting', color: '#34d399', bg: '#ecfdf5' },
                { e: 'staff@mall.com', r: 'Staff', color: '#f59e0b', bg: '#fffbeb' },
              ].map(u => (
                <button
                  key={u.e}
                  type="button"
                  onClick={() => fillDemo(u.e)}
                  className="text-left px-3.5 py-3 rounded-xl border-[1.5px] transition-all cursor-pointer group"
                  style={{
                    borderColor: email === u.e ? u.color : '#e5e7eb',
                    background: email === u.e ? u.bg : 'white',
                    boxShadow: email === u.e ? `0 2px 8px ${u.color}20` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: u.color }} />
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{u.r}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Tenant Portal</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { e: 'starbucks@tenant.com', r: 'Starbucks', color: '#00704a', bg: '#f0fdf4' },
                { e: 'mcdonalds@tenant.com', r: "McDonald's", color: '#ffc72c', bg: '#fffbeb' },
                { e: 'zara@tenant.com', r: 'Zara', color: '#2d2d2d', bg: '#f5f5f5' },
              ].map(u => (
                <button
                  key={u.e}
                  type="button"
                  onClick={() => fillDemo(u.e)}
                  className="text-left px-3.5 py-3 rounded-xl border-[1.5px] transition-all cursor-pointer group"
                  style={{
                    borderColor: email === u.e ? u.color : '#e5e7eb',
                    background: email === u.e ? u.bg : 'white',
                    boxShadow: email === u.e ? `0 2px 8px ${u.color}20` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: u.color }} />
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{u.r}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-4">
              Password: <span className="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">password123</span>
            </p>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Belum punya akun tenant?{' '}
            <button onClick={() => navigate('/register')} className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors inline-flex items-center gap-0.5">
              Daftar <ChevronRight size={14} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
