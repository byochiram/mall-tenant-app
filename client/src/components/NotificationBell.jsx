import { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { Bell, Check, CheckCheck, AlertTriangle, CreditCard, FileText, Info } from 'lucide-react';

const typeIcons = {
  reminder: AlertTriangle,
  overdue: AlertTriangle,
  payment: CreditCard,
  invoice: FileText,
  info: Info,
};

const typeColors = {
  reminder: 'text-amber-500',
  overdue: 'text-red-500',
  payment: 'text-emerald-500',
  invoice: 'text-indigo-500',
  info: 'text-gray-400',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const loadUnread = async () => {
    try { const { data } = await getUnreadCount(); setUnread(data.count); } catch {}
  };

  const loadNotifications = async () => {
    try { const { data } = await getNotifications({ isRead: false }); setNotifications(data); } catch {}
  };

  useEffect(() => { loadUnread(); const i = setInterval(loadUnread, 30000); return () => clearInterval(i); }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRead = async (id) => {
    try { await markNotificationRead(id); setNotifications(n => n.filter(x => x.id !== id)); setUnread(u => Math.max(0, u - 1)); } catch {}
  };

  const handleReadAll = async () => {
    try { await markAllNotificationsRead(); setNotifications([]); setUnread(0); } catch {}
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}j`;
    return `${Math.floor(hrs / 24)}h`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell size={18} className="text-gray-500" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
            {unread > 0 && (
              <button onClick={handleReadAll} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <CheckCheck size={13} /> Baca semua
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">Tidak ada notifikasi baru</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = typeIcons[n.type] || Info;
                const color = typeColors[n.type] || 'text-gray-400';
                return (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className={`mt-0.5 ${color}`}><Icon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button onClick={() => handleRead(n.id)} className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-emerald-500 transition-colors shrink-0" title="Tandai dibaca">
                      <Check size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
