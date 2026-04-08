import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Camera, Shield, Clock, Mail, Save, Edit3, Star, Zap, Award, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_CONFIG = {
  admin: { label: 'Admin', desc: 'Full system access', icon: '👑', gradient: 'linear-gradient(135deg,#EF4444,#F97316)', lightBg: 'rgba(239,68,68,0.08)', color: '#DC2626', border: 'rgba(239,68,68,0.2)' },
  manager: { label: 'Manager', desc: 'Manage projects and teams', icon: '🎯', gradient: 'linear-gradient(135deg,#A78BFA,#6C63FF)', lightBg: 'rgba(108,99,255,0.08)', color: '#6C63FF', border: 'rgba(108,99,255,0.2)' },
  developer: { label: 'Developer', desc: 'Work on assigned tasks', icon: '💻', gradient: 'linear-gradient(135deg,#43CBFF,#6C63FF)', lightBg: 'rgba(67,203,255,0.08)', color: '#0284C7', border: 'rgba(67,203,255,0.2)' },
};

const TABS = [
  { to: '/profile/info', label: 'Profile', icon: User },
  { to: '/profile/activity', label: 'Activity', icon: Activity },
];

const TAB_STYLE = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: 7,
  padding: '9px 16px', borderRadius: 10, textDecoration: 'none',
  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
  ...(isActive
    ? { background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,101,132,0.07))', color: 'var(--accent-primary)', border: '1.5px solid rgba(108,99,255,0.2)' }
    : { background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid transparent' }
  ),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.developer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
      {/* Profile Hero Card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {/* Gradient Banner */}
        <div style={{ height: 120, background: role.gradient, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        </div>
        <div style={{ padding: '0 28px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {/* Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 20px rgba(108,99,255,0.25)', marginTop: -40 }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: role.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: 'white', fontFamily: 'Plus Jakarta Sans' }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: role.lightBg, color: role.color, border: `1px solid ${role.border}`, marginBottom: 4 }}>
              {role.icon} {role.label}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans', marginTop: 10, marginBottom: 3 }}>{user?.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email} · {role.desc}</p>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16, padding: '4px', background: 'var(--bg-surface-2)', borderRadius: 13, width: 'fit-content' }}>
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => TAB_STYLE(isActive)}>
                <Icon size={13} />{label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Nested route */}
      <Outlet context={{ user }} />
    </div>
  );
}

/* ─── Profile Info Sub-page ─── */
export function ProfileInfo() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.developer;

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = await authAPI.updateProfile(form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
      {/* Edit panel */}
      {editing && (
        <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Edit Profile</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <input type="text" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Avatar URL (optional)</label>
              <input type="url" className="input-field" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setEditing(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { icon: Mail, label: 'Email Address', value: user?.email, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
          { icon: Shield, label: 'Role & Permissions', value: `${role.label} — ${role.desc}`, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
          { icon: Clock, label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
          { icon: Star, label: 'Auth Method', value: user?.googleId ? '🔵 Google OAuth' : '🔒 Email & Password', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Button */}
      {!editing && (
        <button onClick={() => setEditing(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content' }}>
          <Edit3 size={15} /> Edit Profile
        </button>
      )}

      {/* Achievements */}
      <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.05) 0%, rgba(255,101,132,0.03) 100%)', border: '1px solid var(--border-light)', borderRadius: 20, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Award size={16} color="var(--accent-primary)" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Account Highlights</h3>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { icon: Zap, label: 'Smart Workflows', desc: 'Predictive insights', color: '#A78BFA' },
            { icon: Shield, label: 'Secure', desc: 'JWT protected', color: '#22C55E' },
            { icon: Star, label: 'Premium', desc: 'All features', color: '#F59E0B' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '14px 16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon size={16} color={color} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
