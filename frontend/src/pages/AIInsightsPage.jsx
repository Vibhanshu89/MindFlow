import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Brain, MessageSquare, AlertTriangle, Zap, Sparkles } from 'lucide-react';

const TABS = [
  { to: '/ai-insights/standup', label: 'Standup', icon: MessageSquare },
  { to: '/ai-insights/risk', label: 'Risk Analysis', icon: AlertTriangle },
  { to: '/ai-insights/prioritize', label: 'Prioritize', icon: Zap },
  { to: '/ai-insights/generate', label: 'Generate Tasks', icon: Sparkles },
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

export default function AIInsightsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    projectAPI.getAll().then(d => setProjects(d.projects || [])).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">
      {/* AI Hub Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 50%, #FF6584 100%)',
        borderRadius: 22, padding: '26px 30px',
        position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(108,99,255,0.35)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 60, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>AI Insights Hub</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={12} color="rgba(255,255,255,0.8)" />
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Your intelligent project assistant</p>
              </div>
            </div>
          </div>
          {/* Project selector */}
          <div style={{ minWidth: 240 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>🎯 Analyzing Project</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              <option value="" style={{ color: '#1A1033', background: 'white' }}>Choose a project...</option>
              {projects.map(p => <option key={p._id} value={p._id} style={{ color: '#1A1033', background: 'white' }}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 16, width: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => TAB_STYLE(isActive)}>
            <Icon size={13} />{label}
          </NavLink>
        ))}
      </div>

      {/* Nested content */}
      <Outlet context={{ selectedProject, projects }} />
    </div>
  );
}
