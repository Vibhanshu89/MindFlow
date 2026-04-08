import { Users, Crown, Shield, Code2, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const ROLE_CONFIG = {
  owner: { label: 'Owner', icon: Crown, color: '#DC2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  admin: { label: 'Admin', icon: Crown, color: '#DC2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  manager: { label: 'Manager', icon: Shield, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
  developer: { label: 'Developer', icon: Code2, color: '#2563EB', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)' },
  member: { label: 'Member', icon: Users, color: '#5C5470', bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.15)' },
};

function MemberCard({ name, email, role, joined, avatarChar, isCurrentUser }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const Icon = cfg.icon;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
      background: isCurrentUser ? 'linear-gradient(135deg, rgba(108,99,255,0.05), rgba(255,101,132,0.03))' : 'var(--bg-surface-2)',
      border: `1.5px solid ${isCurrentUser ? 'rgba(108,99,255,0.2)' : 'var(--border-light)'}`,
      borderRadius: 16, transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      {/* Avatar */}
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0, boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
        {avatarChar}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
          {isCurrentUser && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: 'rgba(108,99,255,0.1)', color: 'var(--accent-primary)', fontWeight: 700 }}>YOU</span>}
        </div>
        {email && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={11} />{email}
          </p>
        )}
        {joined && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} />Joined {format(new Date(joined), 'MMM d, yyyy')}
          </p>
        )}
      </div>
      {/* Role badge */}
      <div style={{ padding: '6px 12px', borderRadius: 20, background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <Icon size={12} color={cfg.color} />
        <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
      </div>
    </div>
  );
}

export default function ProjectTeamTab({ project }) {
  const { user } = useAuth();
  if (!project) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Members', value: (project.members?.length || 0) + 1, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
          { label: 'Tasks Completed', value: project.tasks?.filter(t => t.status === 'done').length || 0, color: '#16A34A', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Project Progress', value: `${project.progress || 0}%`, color: '#FF6584', bg: 'rgba(255,101,132,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px 20px', borderRadius: 16, background: s.bg, border: `1px solid ${s.color}25`, textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans' }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Team list */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={14} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Team Members</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Owner */}
          <MemberCard
            name={project.owner?.name || 'Unknown'}
            email={project.owner?.email}
            role="owner"
            avatarChar={project.owner?.name?.charAt(0)?.toUpperCase() || '?'}
            isCurrentUser={project.owner?._id === user?._id}
          />
          {/* Members */}
          {(project.members || []).map((m, i) => (
            <MemberCard
              key={m.user?._id || i}
              name={m.user?.name || 'Unknown'}
              email={m.user?.email}
              role={m.role || 'member'}
              joined={m.joinedAt}
              avatarChar={(m.user?.name || '?').charAt(0).toUpperCase()}
              isCurrentUser={m.user?._id === user?._id}
            />
          ))}
          {project.members?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No other members yet. Invite colleagues to your project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
