import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, Tag, Menu, X, Store, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import TenantForm from './pages/TenantForm';
import Payments from './pages/Payments';
import Categories from './pages/Categories';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tenants', icon: Building2, label: 'Tenants' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/categories', icon: Tag, label: 'Categories' },
];

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8 fade-in">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const currentPage = navItems.find(
    (n) => n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40 w-[272px] h-full flex flex-col transition-transform duration-300 ease-out`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">MallManager</h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Tenant & Billing</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-2">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg shadow-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25' : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-slate-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-4" />
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-slate-400 font-medium">Mall Tenant System</p>
            <p className="text-[11px] text-slate-500 mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-gray-900 font-semibold">{currentPage?.label || 'Page'}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/25">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/new" element={<TenantForm />} />
          <Route path="/tenants/:id/edit" element={<TenantForm />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
