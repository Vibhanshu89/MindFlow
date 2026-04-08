import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import { BarChart3, CheckSquare, FolderKanban, TrendingUp } from 'lucide-react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler
} from 'chart.js';
import { format, subDays, isSameDay } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const TABS = [
  { to: '/reports/overview', label: 'Overview', icon: BarChart3 },
  { to: '/reports/tasks', label: 'Task Analytics', icon: CheckSquare },
  { to: '/reports/projects', label: 'Projects', icon: FolderKanban },
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

export function ReportsContext({ children }) {
  return children;
}

export default function ReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,101,132,0.04) 100%)',
        border: '1px solid var(--border-light)', borderRadius: 20, padding: '22px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
            <BarChart3 size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>Reports & Analytics</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Track productivity, progress, and performance metrics</p>
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

/* ─── Overview Sub-page ─── */
export function ReportsOverview() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([projectAPI.getAll(), taskAPI.getMyTasks()])
      .then(([pd, td]) => { setProjects(pd.projects || []); setTasks(td.tasks || []); })
      .finally(() => setLoading(false));
  }, []);

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [{ data: ['todo', 'in-progress', 'review', 'done'].map(s => tasks.filter(t => t.status === s).length), backgroundColor: ['#C9C6E8', '#43CBFF', '#A78BFA', '#22C55E'], borderColor: 'transparent', borderWidth: 0, hoverOffset: 6 }],
  };

  const projectStatusData = {
    labels: projects.slice(0, 7).map(p => p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name),
    datasets: [{ label: 'Progress %', data: projects.slice(0, 7).map(p => p.progress), backgroundColor: 'rgba(108,99,255,0.7)', borderColor: 'transparent', borderRadius: 6 }],
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9B95B4', font: { size: 11 } }, grid: { display: false } }, y: { ticks: { color: '#9B95B4', font: { size: 11 } }, grid: { color: 'rgba(196,194,220,0.3)' }, max: 100 } } };
  const doughnutOpts = { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { color: '#5C5470', font: { size: 11 }, boxWidth: 10, padding: 12 } } } };

  const STATS = [
    { label: 'Total Tasks', value: tasks.length, sub: `${completedTasks} done`, gradient: 'linear-gradient(135deg,#6C63FF,#9F8FFF)', icon: CheckSquare },
    { label: 'Completion Rate', value: `${completionRate}%`, sub: 'all time', gradient: 'linear-gradient(135deg,#22C55E,#4ADE80)', icon: TrendingUp },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, sub: `${completedProjects} completed`, gradient: 'linear-gradient(135deg,#FF6584,#FF9CAE)', icon: FolderKanban },
    { label: 'Overdue Tasks', value: overdueTasks, sub: 'need attention', gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', icon: BarChart3 },
  ];

  if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {STATS.map(({ label, value, sub, gradient, icon: Icon }) => (
          <div key={label} className="stat-card animate-slide-in-up">
            <div style={{ width: 40, height: 40, borderRadius: 11, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 4px 12px rgba(108,99,255,0.25)' }}>
              <Icon size={18} color="white" />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans' }}>{value}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Task Status Breakdown</p>
          <div style={{ height: 220 }}><Doughnut data={taskStatusData} options={doughnutOpts} /></div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Project Progress</p>
          <div style={{ height: 220 }}><Bar data={projectStatusData} options={chartOpts} /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Analytics Sub-page ─── */
export function ReportsTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskAPI.getMyTasks().then(d => setTasks(d.tasks || [])).finally(() => setLoading(false));
  }, []);

  const priorityCounts = ['critical', 'high', 'medium', 'low'].map(p => tasks.filter(t => t.priority === p).length);
  const priorityData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{ data: priorityCounts, backgroundColor: ['rgba(239,68,68,0.8)', 'rgba(249,115,22,0.8)', 'rgba(234,179,8,0.8)', 'rgba(34,197,94,0.8)'], borderColor: 'transparent', borderRadius: 6 }],
  };

  const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), 6 - i));
  const completedPerDay = last7Days.map(d => tasks.filter(t => t.status === 'done' && t.updatedAt && isSameDay(new Date(t.updatedAt), d)).length);
  const lineData = {
    labels: last7Days.map(d => format(d, 'EEE')),
    datasets: [{ label: 'Completed', data: completedPerDay, borderColor: '#6C63FF', backgroundColor: 'rgba(108,99,255,0.08)', fill: true, tension: 0.4, pointBackgroundColor: '#6C63FF' }],
  };

  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9B95B4', font: { size: 11 } }, grid: { display: false } }, y: { ticks: { color: '#9B95B4', font: { size: 11 } }, grid: { color: 'rgba(196,194,220,0.3)' } } } };
  const lineOpts = { ...barOpts, scales: { ...barOpts.scales, y: { ...barOpts.scales.y, min: 0 } } };

  if (loading) return <div style={{ height: 300 }} className="skeleton" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Tasks by Priority</p>
          <div style={{ height: 220 }}><Bar data={priorityData} options={barOpts} /></div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Completion Trend (Last 7 Days)</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Tasks marked as done</p>
          <div style={{ height: 220 }}><Line data={lineData} options={lineOpts} /></div>
        </div>
      </div>
      {/* Task table */}
      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>All My Tasks</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
          {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>No tasks found</p> : tasks.map(t => {
            const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
            const P_COLOR = { critical: '#DC2626', high: '#EA580C', medium: '#CA8A04', low: '#16A34A' };
            return (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: P_COLOR[t.priority] || '#6C63FF', flexShrink: 0 }} />
                <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(108,99,255,0.08)', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'capitalize', flexShrink: 0 }}>{t.status}</span>
                {t.deadline && <span style={{ fontSize: 11, color: isOverdue ? '#DC2626' : 'var(--text-muted)', flexShrink: 0, fontWeight: isOverdue ? 600 : 400 }}>{format(new Date(t.deadline), 'MMM d')}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Projects Sub-page ─── */
export function ReportsProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getAll().then(d => setProjects(d.projects || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ height: 300 }} className="skeleton" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Project Health Overview</p>
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            <FolderKanban size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            No projects to report
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projects.map((project) => {
              const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
              const S_COLOR = { active: '#2563EB', completed: '#16A34A', 'on-hold': '#CA8A04', planning: '#475569' };
              return (
                <div key={project._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, background: 'var(--bg-surface-2)', border: '1.5px solid var(--border-light)', borderLeft: `4px solid ${project.color || '#6C63FF'}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${S_COLOR[project.status] || '#6C63FF'}15`, color: S_COLOR[project.status] || '#6C63FF', fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 }}>{project.status}</span>
                      {isOverdue && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', color: '#DC2626', fontWeight: 700, flexShrink: 0 }}>⚠ Overdue</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-surface-3)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${project.progress}%`, background: project.color || 'var(--accent-primary)', borderRadius: 9999, transition: 'width 0.7s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', flexShrink: 0 }}>{project.progress}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(project.members?.length || 0) + 1} members</span>
                    {project.deadline && <span style={{ fontSize: 11, color: isOverdue ? '#DC2626' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
