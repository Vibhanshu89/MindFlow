import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Plus, Wifi, WifiOff, ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/api';

const PAGE_MAP = {
  '/dashboard': { title: 'Dashboard', crumbs: ['Home', 'Dashboard'] },
  '/projects': { title: 'Projects', crumbs: ['Home', 'Projects'] },
  '/tasks': { title: 'My Tasks', crumbs: ['Home', 'Tasks'] },
  '/ai-insights': { title: 'AI Insights', crumbs: ['Home', 'AI Insights'] },
  '/notifications': { title: 'Notifications', crumbs: ['Home', 'Notifications'] },
  '/profile': { title: 'Profile', crumbs: ['Home', 'Profile'] },
  '/team': { title: 'Team', crumbs: ['Home', 'Team'] },
  '/settings': { title: 'Settings', crumbs: ['Home', 'Settings'] },
};

export default function Navbar({ onCreateProject }) {
  const { user } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const isProjectDetail = location.pathname.startsWith('/projects/') && location.pathname.length > 10;
  const page = PAGE_MAP[location.pathname] || {
    title: isProjectDetail ? 'Project Details' : 'Dashboard',
    crumbs: ['Home', 'Projects', isProjectDetail ? 'Details' : 'Dashboard'],
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await notificationAPI.getAll({ limit: 1 });
        setUnreadCount(data.unreadCount || 0);
      } catch { /* ignore */ }
    };
    fetchUnread();
  }, []);

  return (
    <header style={{
      height: 64,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 1px 12px rgba(108,99,255,0.06)',
    }}>
      {/* Breadcrumb */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Home size={12} style={{ color: 'var(--text-muted)' }} />
          {page.crumbs.map((crumb, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <ChevronRight size={11} style={{ color: 'var(--text-muted)' }} />}
              <span style={{
                fontSize: 12,
                color: i === page.crumbs.length - 1 ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: i === page.crumbs.length - 1 ? 600 : 400,
              }}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans' }}>
          {page.title}
        </h2>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{
          position: 'absolute', left: 12,
          color: searchFocused ? 'var(--accent-primary)' : 'var(--text-muted)',
          transition: 'color 0.2s',
        }} />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            background: searchFocused ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
            border: `1.5px solid ${searchFocused ? 'var(--accent-primary)' : 'var(--border-light)'}`,
            borderRadius: 10,
            padding: '8px 14px 8px 34px',
            fontSize: 13,
            color: 'var(--text-primary)',
            outline: 'none',
            width: searchFocused ? 220 : 180,
            transition: 'all 0.25s ease',
            boxShadow: searchFocused ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
          }}
        />
      </div>

      {/* Connection status */}
      <div
        data-tooltip={connected ? 'Real-time connected' : 'Offline'}
        style={{
          width: 32, height: 32, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: connected ? '#16A34A' : '#DC2626',
          flexShrink: 0,
        }}
      >
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
      </div>

      {/* Create button */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <button
          onClick={onCreateProject}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 13, gap: 6, borderRadius: 10 }}
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      )}

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: 'var(--bg-surface-2)', border: '1.5px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent-secondary)', color: 'white',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-surface)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <button
        onClick={() => navigate('/profile')}
        style={{
          width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
          border: '2px solid var(--accent-primary)', cursor: 'pointer', flexShrink: 0,
          padding: 0, background: 'transparent',
          boxShadow: '0 0 0 3px rgba(108,99,255,0.12)',
          transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.12)'; }}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </button>
    </header>
  );
}
