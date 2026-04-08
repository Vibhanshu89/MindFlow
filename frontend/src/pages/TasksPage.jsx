import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { CheckSquare, Clock, AlertTriangle, Search, CheckCircle2, Loader, Eye, Circle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#DC2626', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', dot: '#EF4444' },
  high: { label: 'High', color: '#EA580C', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', dot: '#F97316' },
  medium: { label: 'Medium', color: '#CA8A04', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)', dot: '#EAB308' },
  low: { label: 'Low', color: '#16A34A', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', dot: '#22C55E' },
};

const STATUS_CONFIG = {
  'todo': { label: 'To Do', icon: Circle, color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' },
  'in-progress': { label: 'In Progress', icon: Loader, color: '#2563EB', bg: 'rgba(59,130,246,0.1)' },
  'review': { label: 'Review', icon: Eye, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
  'done': { label: 'Done', icon: CheckCircle2, color: '#16A34A', bg: 'rgba(34,197,94,0.1)' },
};

function getDeadlineInfo(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isPast(d)) return { label: 'Overdue', color: '#DC2626', bg: 'rgba(239,68,68,0.1)' };
  if (isToday(d)) return { label: 'Due today', color: '#CA8A04', bg: 'rgba(234,179,8,0.1)' };
  if (isTomorrow(d)) return { label: 'Due tomorrow', color: '#EA580C', bg: 'rgba(249,115,22,0.1)' };
  return { label: format(d, 'MMM d'), color: 'var(--text-muted)', bg: 'var(--bg-surface-2)' };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskAPI.getMyTasks();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const overdueCount = tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done').length;
  const completedCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(67,203,255,0.08) 0%, rgba(108,99,255,0.06) 100%)',
        border: '1px solid var(--border-light)', borderRadius: 20, padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #43CBFF, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(67,203,255,0.4)' }}>
            <CheckSquare size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>My Tasks</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {tasks.length} total · {completedCount} completed
              {overdueCount > 0 && <span style={{ color: '#DC2626', fontWeight: 600 }}> · {overdueCount} overdue</span>}
            </p>
          </div>
        </div>

        {/* Mini stats row */}
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = tasks.filter(t => t.status === key).length;
            const Icon = cfg.icon;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                <Icon size={12} color={cfg.color} />
                <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{count}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={16} color="#DC2626" />
          </div>
          <p style={{ fontSize: 14, color: '#DC2626', fontWeight: 600 }}>
            You have {overdueCount} overdue task{overdueCount > 1 ? 's' : ''}. Please review and update them.
          </p>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: 36 }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-field" style={{ width: 150 }}>
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="select-field" style={{ width: 150 }}>
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <CheckSquare size={52} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--border-medium)' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>No tasks found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{search ? 'Try a different search' : 'No tasks assigned to you yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((task, i) => {
            const deadlineInfo = getDeadlineInfo(task.deadline);
            const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
            const StatusIcon = status.icon;
            const isDone = task.status === 'done';

            return (
              <Link key={task._id} to={`/projects/${task.project?._id}`} style={{ textDecoration: 'none' }}>
                <div
                  className="animate-slide-in-up"
                  style={{
                    background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)',
                    borderLeft: `4px solid ${priority.dot}`,
                    borderRadius: 14, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.2s ease',
                    animationDelay: `${i * 0.04}s`, opacity: 0,
                    opacity: isDone ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = priority.dot; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderLeftColor = priority.dot; e.currentTarget.style.borderTopColor = 'var(--border-light)'; e.currentTarget.style.borderRightColor = 'var(--border-light)'; e.currentTarget.style.borderBottomColor = 'var(--border-light)'; }}
                >
                  {/* Status icon */}
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <StatusIcon size={15} color={status.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: task.project?.color || '#6C63FF', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.project?.name || 'Unknown Project'}</span>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: priority.bg, color: priority.color, border: `1px solid ${priority.border}`, flexShrink: 0 }}>
                    {priority.label}
                  </span>

                  {/* Status Badge */}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: status.bg, color: status.color, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StatusIcon size={10} />
                    {status.label}
                  </span>

                  {/* Deadline */}
                  {deadlineInfo && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: deadlineInfo.bg, color: deadlineInfo.color, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <Clock size={10} />
                      {deadlineInfo.label}
                    </span>
                  )}

                  {/* AI Score bar */}
                  {task.aiPriorityScore > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <div style={{ width: 48, height: 5, background: 'var(--bg-surface-2)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${task.aiPriorityScore}%`, background: `hsl(${120 - task.aiPriorityScore * 1.2}, 65%, 50%)`, borderRadius: 9999 }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI {task.aiPriorityScore}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
