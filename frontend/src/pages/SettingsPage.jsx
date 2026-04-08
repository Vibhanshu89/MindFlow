import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Settings, Bell, Users, Sliders, Shield, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
  { to: '/settings/general', label: 'General', icon: Sliders },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/team', label: 'Team & Roles', icon: Users },
];

const TAB_STYLE = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '9px 18px', borderRadius: 10, textDecoration: 'none',
  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
  ...(isActive
    ? { background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,101,132,0.07))', color: 'var(--accent-primary)', border: '1.5px solid rgba(108,99,255,0.2)' }
    : { background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid transparent' }
  ),
});

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,101,132,0.04) 100%)',
        border: '1px solid var(--border-light)', borderRadius: 20, padding: '22px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
            <Settings size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>Settings</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage your workspace preferences and configuration</p>
          </div>
        </div>
        {/* Sub-navigation */}
        <div style={{ display: 'flex', gap: 6, padding: '4px', background: 'var(--bg-surface-2)', borderRadius: 14, width: 'fit-content' }}>
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => TAB_STYLE(isActive)}>
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Nested page content */}
      <Outlet />
    </div>
  );
}

/* ─── General Settings Sub-page ─── */
export function SettingsGeneral() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('aurora-light');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* App preferences */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={15} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>App Preferences</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Theme picker */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Theme</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ value: 'aurora-light', label: 'Aurora Light', preview: 'linear-gradient(135deg, #F5F4FF, #FFFFFF)' }, { value: 'dark', label: 'Dark Mode (soon)', preview: 'linear-gradient(135deg, #1A1033, #2D1B69)', disabled: true }].map(t => (
                <button key={t.value} disabled={t.disabled} onClick={() => setTheme(t.value)}
                  style={{ padding: '12px 18px', borderRadius: 12, border: `2px solid ${theme === t.value ? 'var(--accent-primary)' : 'var(--border-light)'}`, cursor: t.disabled ? 'not-allowed' : 'pointer', background: 'var(--bg-surface)', transition: 'all 0.2s', opacity: t.disabled ? 0.5 : 1 }}>
                  <div style={{ width: 48, height: 28, borderRadius: 7, background: t.preview, marginBottom: 6, border: '1px solid var(--border-light)' }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: theme === t.value ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{t.label}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Language */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Language</label>
            <select className="select-field" value={language} onChange={e => setLanguage(e.target.value)} style={{ maxWidth: 300 }}>
              <option value="en">English (US)</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          {/* Timezone */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Timezone</label>
            <select className="select-field" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ maxWidth: 300 }}>
              <option value="Asia/Kolkata">IST — Asia/Kolkata (UTC+5:30)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">EST — America/New York (UTC-5)</option>
              <option value="Europe/London">GMT — Europe/London (UTC+0)</option>
              <option value="Asia/Tokyo">JST — Asia/Tokyo (UTC+9)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => toast.success('Preferences saved!')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Save Preferences
          </button>
        </div>
      </div>

      {/* Account info (read-only) */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Account Information</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'Full Name', value: user?.name }, { label: 'Email', value: user?.email }, { label: 'Role', value: user?.role }, { label: 'Account ID', value: user?._id?.slice(-8) }].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</label>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{f.value || '—'}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)', display: 'flex', gap: 8 }}>
          <Info size={14} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>To change your name or email, visit the <strong>Profile</strong> page.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications Settings Sub-page ─── */
export function SettingsNotifications() {
  const [prefs, setPrefs] = useState({
    emailTaskAssigned: true, emailTaskDue: true, emailProjectUpdates: false,
    pushMentions: true, pushDeadlines: true, pushTeamActivity: false,
    digestFrequency: 'daily',
  });
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const ToggleRow = ({ label, sub, fieldKey }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
      </div>
      <button
        onClick={() => toggle(fieldKey)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: prefs[fieldKey] ? 'linear-gradient(135deg, #6C63FF, #FF6584)' : 'var(--bg-surface-3)',
          position: 'relative', transition: 'all 0.3s ease', flexShrink: 0, boxShadow: prefs[fieldKey] ? '0 2px 8px rgba(108,99,255,0.4)' : 'none',
        }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: prefs[fieldKey] ? 23 : 3, transition: 'left 0.3s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={15} color="#F59E0B" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Email Notifications</h2>
        </div>
        <ToggleRow label="Task Assigned to Me" sub="Get notified when someone assigns a task" fieldKey="emailTaskAssigned" />
        <ToggleRow label="Task Due Reminders" sub="Reminders before task deadlines" fieldKey="emailTaskDue" />
        <ToggleRow label="Project Updates" sub="Updates when projects are modified" fieldKey="emailProjectUpdates" />
      </div>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={15} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>In-App Notifications</h2>
        </div>
        <ToggleRow label="Mentions" sub="When someone @mentions you" fieldKey="pushMentions" />
        <ToggleRow label="Deadline Alerts" sub="Alerts for upcoming and overdue tasks" fieldKey="pushDeadlines" />
        <ToggleRow label="Team Activity" sub="When teammates update tasks" fieldKey="pushTeamActivity" />
      </div>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={15} color="#22C55E" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Digest Frequency</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['none', 'daily', 'weekly'].map(f => (
            <button key={f} onClick={() => setPrefs(p => ({ ...p, digestFrequency: f }))}
              style={{ padding: '9px 20px', borderRadius: 10, border: `1.5px solid ${prefs.digestFrequency === f ? 'var(--accent-primary)' : 'var(--border-light)'}`, background: prefs.digestFrequency === f ? 'rgba(108,99,255,0.08)' : 'var(--bg-surface)', color: prefs.digestFrequency === f ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {f === 'none' ? 'No Digest' : f === 'daily' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => toast.success('Notification preferences saved!')}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Team & Roles Settings Sub-page ─── */
export function SettingsTeam() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={15} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Role Permissions</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { role: 'Admin', icon: '👑', color: '#DC2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', perms: ['Create/Delete projects', 'Manage team members', 'Access all settings', 'View all reports'] },
            { role: 'Manager', icon: '🎯', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', perms: ['Create/Edit projects', 'Assign tasks', 'View reports', 'Manage project settings'] },
            { role: 'Developer', icon: '💻', color: '#2563EB', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)', perms: ['View assigned projects', 'Update task status', 'Submit standups', 'View own profile'] },
          ].map(r => (
            <div key={r.role} style={{ padding: '16px 20px', borderRadius: 14, background: r.bg, border: `1.5px solid ${r.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{r.role}</p>
                {user?.role === r.role.toLowerCase() && (
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: r.bg, color: r.color, fontWeight: 700, border: `1px solid ${r.border}` }}>YOUR ROLE</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {r.perms.map(p => (
                  <span key={p} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.6)', color: r.color, fontWeight: 500 }}>✓ {p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!isAdmin && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)', display: 'flex', gap: 8 }}>
            <Shield size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Role changes can only be made by an Admin. Contact your workspace admin to update roles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
