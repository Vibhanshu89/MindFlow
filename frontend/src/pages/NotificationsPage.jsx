import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCheck, Trash2, BellOff, RefreshCw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  task_assigned: { icon: '📋', color: '#2563EB', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  task_updated: { icon: '✏️', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.2)' },
  task_completed: { icon: '✅', color: '#16A34A', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  deadline_reminder: { icon: '⏰', color: '#EA580C', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' },
  project_invite: { icon: '📩', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.2)' },
  project_update: { icon: '📊', color: '#475569', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
  ai_insight: { icon: '🤖', color: '#FF6584', bg: 'rgba(255,101,132,0.08)', border: 'rgba(255,101,132,0.2)' },
  comment: { icon: '💬', color: '#CA8A04', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)' },
  mention: { icon: '@', color: '#0284C7', bg: 'rgba(3,105,161,0.08)', border: 'rgba(3,105,161,0.2)' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getAll({ limit: 50 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const handleDelete = async (id) => {
    await notificationAPI.delete(id);
    const deleted = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (!deleted?.read) setUnreadCount(c => Math.max(0, c - 1));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(108,99,255,0.06) 100%)',
        border: '1px solid var(--border-light)', borderRadius: 20, padding: '22px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#F59E0B,#FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245,158,11,0.35)', position: 'relative' }}>
            <Bell size={20} color="white" />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>Notifications</h1>
            <p style={{ fontSize: 13, color: unreadCount > 0 ? 'var(--accent-secondary)' : 'var(--text-muted)', fontWeight: unreadCount > 0 ? 600 : 400 }}>
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchNotifications} className="btn-secondary" style={{ padding: '9px 12px' }}>
            <RefreshCw size={14} />
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13 }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BellOff size={28} color="var(--border-medium)" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>No notifications yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You'll be notified about tasks, projects, and deadlines.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n, index) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.project_update;
            return (
              <div
                key={n._id}
                className="animate-slide-in-up"
                onClick={() => !n.read && handleMarkRead(n._id)}
                style={{
                  background: n.read ? 'var(--bg-surface)' : `rgba(108,99,255,0.02)`,
                  border: `1.5px solid ${n.read ? 'var(--border-light)' : 'rgba(108,99,255,0.2)'}`,
                  borderRadius: 16, padding: '14px 18px',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: n.read ? 0.75 : 1,
                  animationDelay: `${index * 0.03}s`,
                }}
                onMouseEnter={e => { if (!n.read) { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateX(3px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: config.bg, border: `1px solid ${config.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {config.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {n.title}
                        {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block', flexShrink: 0 }} />}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{n.message}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
                      style={{
                        width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#DC2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    {n.sender && <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600 }}>from {n.sender.name}</span>}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(n.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
