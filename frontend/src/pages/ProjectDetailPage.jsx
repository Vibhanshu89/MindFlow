import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  ArrowLeft, CheckSquare, Users, Settings, Calendar,
  AlertTriangle, TrendingUp, Clock
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const TAB_STYLE = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: 7,
  padding: '8px 16px', borderRadius: 9, textDecoration: 'none',
  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
  ...(isActive
    ? { background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,101,132,0.07))', color: 'var(--accent-primary)', border: '1.5px solid rgba(108,99,255,0.2)' }
    : { background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid transparent' }
  ),
});

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinProject, leaveProject, onEvent } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    try {
      const data = await projectAPI.getOne(id);
      setProject(data.project);
      setTasks(data.project.tasks || []);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
    joinProject(id);
    const cleanups = [
      onEvent('task:created', (task) => setTasks((prev) => [task, ...prev])),
      onEvent('task:updated', (task) => setTasks((prev) => prev.map((t) => t._id === task._id ? task : t))),
      onEvent('task:deleted', ({ taskId }) => setTasks((prev) => prev.filter((t) => t._id !== taskId))),
      onEvent('task:status_changed', (task) => setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, ...task } : t))),
    ];
    return () => { leaveProject(id); cleanups.forEach((fn) => fn && fn()); };
  }, [id, fetchProject, joinProject, leaveProject, onEvent]);

  const isOwner = project?.owner?._id === user?._id || user?.role === 'admin';
  const isOverdue = project && isPast(new Date(project.deadline)) && project.status !== 'completed';
  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  };
  const TABS = [
    { to: `/projects/${id}/tasks`, label: 'Tasks', icon: CheckSquare },
    { to: `/projects/${id}/team`, label: 'Team', icon: Users },
    ...(isOwner ? [{ to: `/projects/${id}/settings`, label: 'Settings', icon: Settings }] : []),
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 180, borderRadius: 20 }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
    </div>
  );

  if (!project) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)',
        borderRadius: 20, padding: '22px 26px', boxShadow: 'var(--shadow-sm)',
        borderTop: `4px solid ${project.color || '#6C63FF'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <button onClick={() => navigate('/projects')}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-surface-2)', border: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color || '#6C63FF', flexShrink: 0 }} />
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans' }}>{project.name}</h1>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize',
                ...(project.status === 'completed' ? { background: 'rgba(34,197,94,0.1)', color: '#16A34A', border: '1px solid rgba(34,197,94,0.25)' } :
                  project.status === 'active' ? { background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.25)' } :
                    { background: 'rgba(100,116,139,0.1)', color: '#475569', border: '1px solid rgba(100,116,139,0.2)' }),
              }}>{project.status}</span>
              {isOverdue && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={11} />Overdue
                </span>
              )}
            </div>
            {project.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>{project.description}</p>}
            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
              {[
                { Icon: Calendar, text: format(new Date(project.deadline), 'MMM d, yyyy'), danger: isOverdue },
                { Icon: Users, text: `${(project.members?.length || 0) + 1} members` },
                { Icon: CheckSquare, text: `${taskStats.done}/${taskStats.total} tasks done` },
                { Icon: TrendingUp, text: `${project.progress}% complete` },
              ].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: item.danger ? '#DC2626' : 'var(--text-muted)', fontWeight: item.danger ? 600 : 400 }}>
                  <item.Icon size={12} />{item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Overall Progress</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{project.progress}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-surface-2)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${project.progress}%`, background: project.color || 'linear-gradient(90deg, #6C63FF, #FF6584)', borderRadius: 9999, transition: 'width 0.8s ease' }} />
          </div>
        </div>
        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginTop: 18, padding: '4px', background: 'var(--bg-surface-2)', borderRadius: 13, width: 'fit-content' }}>
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => TAB_STYLE(isActive)}>
              <Icon size={13} />{label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Nested route content */}
      <Outlet context={{ project, tasks, onTasksUpdate: setTasks, projectId: id, onProjectUpdate: (p) => setProject(p) }} />
    </div>
  );
}
