import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Brain, Bell, User,
  LogOut, Zap, Settings, Users, ChevronRight, Sparkles, Calendar, BarChart3
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#6C63FF' },
  { to: '/projects', icon: FolderKanban, label: 'Projects', color: '#FF6584' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks', color: '#43CBFF' },
  { to: '/calendar', icon: Calendar, label: 'Calendar', color: '#22C55E' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights', color: '#A78BFA' },
  { to: '/notifications', icon: Bell, label: 'Notifications', color: '#F59E0B' },
  { to: '/reports', icon: BarChart3, label: 'Reports', color: '#6C63FF' },
];

const adminItems = [
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const getRoleConfig = (role) => {
  if (role === 'admin') return { label: 'Admin', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: '👑' };
  if (role === 'manager') return { label: 'Manager', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', icon: '🎯' };
  return { label: 'Developer', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', icon: '💻' };
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = getRoleConfig(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 260,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-light)',
      position: 'fixed',
      left: 0, top: 0,
      zIndex: 40,
      boxShadow: '4px 0 24px rgba(108,99,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(108,99,255,0.4)',
            flexShrink: 0,
          }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', lineHeight: 1 }}>
              MindFlow
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 8px 10px' }}>
          Main Menu
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-surface-2)',
                  flexShrink: 0,
                }}>
                  <Icon size={16} />
                </div>
                <span>{label}</span>
                <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.35 }} />
              </NavLink>
            </li>
          ))}
        </ul>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 8px 10px' }}>
              Admin
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-2)', flexShrink: 0 }}>
                      <Icon size={16} />
                    </div>
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* User card */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-light)' }}>
        <NavLink to="/profile" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
          borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s ease',
          marginBottom: 4,
        }}
          className="sidebar-item"
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 15,
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22C55E', border: '2px solid white', position: 'absolute', bottom: -1, right: -1 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <span style={{ fontSize: 11, fontWeight: 500 }} className={`${role.text}`}>{role.icon} {role.label}</span>
          </div>
          <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '9px 12px', borderRadius: 10,
            color: 'var(--text-muted)', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#DC2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
