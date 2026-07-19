import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { Building2, Eye, EyeOff, ArrowRight, Shield, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            <h2 className="text-[28px] lg:text-[32px] font-bold text-white leading-tight tracking-tight">
              Kelola seluruh tenant mall Anda dalam satu platform
            </h2>
            <p className="text-slate-400 mt-4 text-[15px] leading-relaxed">
              Pantau kontrak sewa, tagihan, pembayaran, dan performa tenant secara real-time untuk operasional yang lebih efisien.
            </p>

            {/* Feature cards */}
            <div className="mt-8 space-y-3">
              {[
                { icon: Shield, title: 'Manajemen Kontrak', desc: 'Kelola kontrak sewa, perpanjangan, dan terminasi' },
                { icon: BarChart3, title: 'Billing & Payment', desc: 'Tagihan otomatis, tracking pembayaran, aging report' },
                { icon: Users, title: 'Tenant Directory', desc: 'Database tenant, kontak, dokumen, dan catatan' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3.5 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                    <f.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{f.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
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
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Selamat datang kembali</h2>
            <p className="text-sm text-gray-500 mt-1">Masukkan akun Anda untuk melanjutkan</p>
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
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@mall.com"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  style={{ color: '#1a1a2e', WebkitTextSecurity: showPw ? 'none' : 'disc' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
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
                  Masuk <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Akun Demo</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { e: 'admin@mall.com', r: 'Super Admin', color: '#6366f1' },
                { e: 'leasing@mall.com', r: 'Leasing', color: '#06b6d4' },
                { e: 'finance@mall.com', r: 'Finance', color: '#10b981' },
                { e: 'staff@mall.com', r: 'Staff', color: '#f59e0b' },
              ].map(u => (
                <button
                  key={u.e}
                  type="button"
                  onClick={() => fillDemo(u.e)}
                  className={`text-left px-3 py-2.5 rounded-xl border transition-all ${email === u.e ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: u.color }} />
                    <p className="text-xs font-semibold text-gray-800 truncate">{u.r}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate pl-4">{u.e}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-3">Password: <span className="font-mono text-gray-500">password123</span></p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Belum punya akun tenant?{' '}
            <button onClick={() => navigate('/register')} className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Daftar di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
