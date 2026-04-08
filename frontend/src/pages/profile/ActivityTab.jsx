import { Activity, CheckCircle, FolderKanban, Clock, AlertTriangle, Star } from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';

// Simulated activity data since no backend endpoint exists for this
function generateActivity(user) {
  const activities = [
    { type: 'task_done', icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', text: 'Completed task "Setup authentication module"', time: new Date() },
    { type: 'task_done', icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', text: 'Completed task "Design landing page mocks"', time: subDays(new Date(), 0) },
    { type: 'project', icon: FolderKanban, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)', text: 'Joined project "Website Redesign 2025"', time: subDays(new Date(), 1) },
    { type: 'standup', icon: Star, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: 'Submitted daily standup report', time: subDays(new Date(), 1) },
    { type: 'task_created', icon: Clock, color: '#43CBFF', bg: 'rgba(67,203,255,0.1)', text: 'Created task "Implement payment gateway"', time: subDays(new Date(), 2) },
    { type: 'overdue', icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', text: 'Task "API documentation" is now overdue', time: subDays(new Date(), 2) },
    { type: 'project', icon: FolderKanban, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)', text: 'Created project "Mobile App v2"', time: subDays(new Date(), 3) },
    { type: 'task_done', icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', text: 'Completed task "Database schema design"', time: subDays(new Date(), 3) },
    { type: 'standup', icon: Star, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: 'Submitted daily standup report', time: subDays(new Date(), 4) },
    { type: 'task_created', icon: Clock, color: '#43CBFF', bg: 'rgba(67,203,255,0.1)', text: 'Created task "User onboarding flow"', time: subDays(new Date(), 5) },
  ];
  return activities;
}

function getRelativeTime(date) {
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, yyyy');
}

export default function ActivityTab({ user }) {
  const activities = generateActivity(user);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Tasks Completed', value: 3, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Standups Submitted', value: 2, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Projects Active', value: 2, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px 20px', borderRadius: 16, background: s.bg, border: `1px solid ${s.color}25`, textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans' }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>This week</p>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={15} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</h2>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(108,99,255,0.08)', color: 'var(--accent-primary)', fontWeight: 600 }}>Last 7 days</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activities.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === activities.length - 1;
            return (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: isLast ? 0 : 16 }} className="animate-slide-in-up" style2={{ animationDelay: `${i * 0.04}s` }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${item.color}25` }}>
                    <Icon size={15} color={item.color} />
                  </div>
                  {!isLast && <div style={{ width: 1.5, flex: 1, background: 'var(--border-light)', margin: '6px 0' }} />}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.text}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{getRelativeTime(item.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
