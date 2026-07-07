import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building2, CreditCard, FileText, Grid3X3, Layers, Menu, X, Store, ChevronRight, LogOut, Globe } from 'lucide-react';
import NotificationBell from './NotificationBell';

const allNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin','leasing_manager','leasing_staff','finance_manager','accounting_staff','staff','tenant_user'] },
  { to: '/tenants', icon: Building2, label: 'Tenants', roles: ['super_admin','leasing_manager','leasing_staff','finance_manager','staff'] },
  { to: '/units', icon: Grid3X3, label: 'Units & Floors', roles: ['super_admin','leasing_manager','leasing_staff'] },
  { to: '/contracts', icon: FileText, label: 'Contracts', roles: ['super_admin','leasing_manager','leasing_staff','finance_manager'] },
  { to: '/billing', icon: Layers, label: 'Billing', roles: ['super_admin','finance_manager','accounting_staff'] },
  { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['super_admin','finance_manager','accounting_staff'] },
  { to: '/tenant-portal', icon: Globe, label: 'Portal Saya', roles: ['tenant_user'] },
];

function SidebarContent({ nav, onClose }) {
  const { user, logout } = useAuth();
  return (
    <>
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
          <Store size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">MallManager</h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Tenant Pillar</p>
        </div>
        {onClose && <button onClick={onClose} className="ml-auto p-2 text-slate-400 hover:text-white md:hidden"><X size={20} /></button>}
      </div>
      <div className="px-4"><div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" /></div>
      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto no-scrollbar">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <Icon size={16} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-4" />
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{user?.name?.[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );
}

export default function Layout({ children }) {
  const { user, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const nav = allNav.filter(n => hasRole(...n.roles));
  const current = nav.find(n => n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setOpen(false)} />}

      <aside className="hidden md:flex md:w-[272px] md:shrink-0 flex-col" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <SidebarContent nav={nav} />
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 w-[272px] flex flex-col transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <SidebarContent nav={nav} onClose={() => setOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu size={20} className="text-gray-600" /></button>
          <span className="text-gray-900 font-semibold text-sm">{current?.label || ''}</span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/25">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
