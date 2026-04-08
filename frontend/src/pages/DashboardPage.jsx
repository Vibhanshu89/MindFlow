import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../services/api';
import {
  FolderKanban, CheckSquare, TrendingUp, AlertTriangle, ArrowRight,
  Clock, Activity, Calendar, BarChart3, Zap, Star, Plus
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler,
} from 'chart.js';
import { format, isPast } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

function StatCard({ icon: Icon, label, value, sub, gradient, trend, delay = 0 }) {
  return (
    <div className="stat-card animate-slide-in-up" style={{ animationDelay: `${delay}s`, opacity: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(108,99,255,0.25)',
        }}>
          <Icon size={20} color="white" />
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: trend > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: trend > 0 ? '#16A34A' : '#DC2626',
            border: `1px solid ${trend > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Plus Jakarta Sans' }}>{value}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function ProjectCard({ project }) {
  const isOverdue = isPast(new Date(project.deadline)) && project.status !== 'completed';
  return (
    <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 14, padding: '14px 16px',
        borderLeft: `4px solid ${project.color || '#6C63FF'}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{project.name}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(108,99,255,0.08)', color: 'var(--accent-primary)' }}>
            {project.status}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{project.progress}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--bg-surface-2)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${project.progress}%`, background: project.color || 'var(--accent-primary)', borderRadius: 9999, transition: 'width 0.7s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isOverdue ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
          <Clock size={10} />
          {isOverdue ? '⚠ Overdue · ' : ''}{format(new Date(project.deadline), 'MMM d, yyyy')}
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          projectAPI.getStats(),
          taskAPI.getMyTasks(),
        ]);
        setStats(statsData.stats);
        setMyTasks(tasksData.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [{
      data: [
        stats?.taskStats?.find(t => t._id === 'todo')?.count || 0,
        stats?.taskStats?.find(t => t._id === 'in-progress')?.count || 0,
        stats?.taskStats?.find(t => t._id === 'review')?.count || 0,
        stats?.taskStats?.find(t => t._id === 'done')?.count || 0,
      ],
      backgroundColor: ['#C9C6E8', '#43CBFF', '#A78BFA', '#22C55E'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const projectStatusData = {
    labels: ['Active', 'Completed', 'On Hold'],
    datasets: [{
      label: 'Projects',
      data: [stats?.activeProjects || 0, stats?.completedProjects || 0, Math.max((stats?.totalProjects || 0) - (stats?.activeProjects || 0) - (stats?.completedProjects || 0), 0)],
      backgroundColor: ['rgba(108,99,255,0.75)', 'rgba(34,197,94,0.75)', 'rgba(155,149,180,0.5)'],
      borderColor: 'transparent',
      borderRadius: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#5C5470', font: { size: 11 }, boxWidth: 10, padding: 12 } },
    },
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#9B95B4', font: { size: 12 } }, grid: { color: 'rgba(196,194,220,0.3)' } },
      y: { ticks: { color: '#9B95B4', font: { size: 12 } }, grid: { color: 'rgba(196,194,220,0.3)' } },
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="page-enter">
      {/* Hero welcome banner */}
      <div style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, #6C63FF 0%, #9F8FFF 50%, #FF6584 100%)',
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(108,99,255,0.35)',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: 20, right: 180, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: 'white',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
              {greeting}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 400, marginBottom: 12 }}>
              Here's your project overview for today.
            </p>
            <Link to="/projects" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--accent-primary)', border: 'none' }}>
              <Plus size={16} /> New Project
            </Link>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 14px' }}>
            <Calendar size={14} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.totalProjects || 0} sub={`${stats?.activeProjects || 0} active`} gradient="linear-gradient(135deg,#6C63FF,#9F8FFF)" trend={12} delay={0.05} />
        <StatCard icon={CheckSquare} label="My Tasks" value={stats?.totalTasks || 0} sub={`${myTasks.filter(t => t.status === 'done').length} completed`} gradient="linear-gradient(135deg,#FF6584,#FF9CAE)" delay={0.1} />
        <StatCard icon={TrendingUp} label="Completed" value={stats?.completedProjects || 0} sub="projects finished" gradient="linear-gradient(135deg,#22C55E,#4ADE80)" trend={8} delay={0.15} />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={myTasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done').length} sub="need attention" gradient="linear-gradient(135deg,#F59E0B,#FCD34D)" delay={0.2} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Activity size={15} color="var(--accent-primary)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Task Distribution</h3>
          </div>
          <div style={{ height: 200 }}>
            <Doughnut data={taskStatusData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={15} color="#A78BFA" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Project Overview</h3>
          </div>
          <div style={{ height: 200 }}>
            <Bar data={projectStatusData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Projects + My Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Projects */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderKanban size={14} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Projects</h3>
            </div>
            <Link to="/projects" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(stats?.recentProjects || []).map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
            {!stats?.recentProjects?.length && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <FolderKanban size={32} style={{ margin: '0 auto 10px', opacity: 0.4, display: 'block' }} />
                No projects yet. Create your first!
              </div>
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,101,132,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={14} color="var(--accent-secondary)" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>My Recent Tasks</h3>
            </div>
            <Link to="/tasks" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myTasks.slice(0, 6).map((task) => {
              const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
              const dotColor = task.status === 'done' ? '#22C55E' : task.priority === 'critical' ? '#EF4444' : task.priority === 'high' ? '#F97316' : 'var(--accent-primary)';
              return (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 10, background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-light)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.project?.name}</p>
                  </div>
                  {isOverdue && <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0 }} />}
                  {task.deadline && !isOverdue && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{format(new Date(task.deadline), 'MMM d')}</span>
                  )}
                </div>
              );
            })}
            {myTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <Star size={32} style={{ margin: '0 auto 10px', opacity: 0.4, display: 'block' }} />
                No tasks assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
