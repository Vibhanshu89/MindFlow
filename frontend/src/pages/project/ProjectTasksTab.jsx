import { useState, useCallback } from 'react';
import { taskAPI } from '../../services/api';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import CreateTaskModal from '../../components/common/CreateTaskModal';
import { Plus, LayoutGrid, List, CheckSquare, AlertTriangle, Circle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const PRIORITY_CONFIG = {
  critical: { color: '#DC2626', dot: '#EF4444' },
  high: { color: '#EA580C', dot: '#F97316' },
  medium: { color: '#CA8A04', dot: '#EAB308' },
  low: { color: '#16A34A', dot: '#22C55E' },
};

export default function ProjectTasksTab({ project, tasks, onTasksUpdate, projectId }) {
  const { user } = useAuth();
  const [view, setView] = useState('kanban');
  const [showCreate, setShowCreate] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  const handleTaskCreated = (task) => {
    onTasksUpdate((prev) => [...prev, task]);
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Status pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Total', count: taskStats.total, color: 'var(--text-muted)', bg: 'var(--bg-surface-2)' },
            { label: 'To Do', count: taskStats.todo, color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' },
            { label: 'In Progress', count: taskStats.inProgress, color: '#2563EB', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Review', count: taskStats.review, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
            { label: 'Done', count: taskStats.done, color: '#16A34A', bg: 'rgba(34,197,94,0.1)' },
          ].map(s => (
            <span key={s.label} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: s.bg, color: s.color }}>
              {s.label}: {s.count}
            </span>
          ))}
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-2)', borderRadius: 10, padding: 3, gap: 2 }}>
            {[{ v: 'kanban', Icon: LayoutGrid }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button key={v} onClick={() => setView(v)}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: view === v ? 'var(--bg-surface)' : 'transparent', color: view === v ? 'var(--accent-primary)' : 'var(--text-muted)', boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <button
            onClick={() => { setDefaultStatus('todo'); setShowCreate(true); }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13 }}>
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
        {view === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            onTasksUpdate={onTasksUpdate}
            projectId={projectId}
            members={project?.members || []}
            onAddTask={(status) => { setDefaultStatus(status); setShowCreate(true); }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <CheckSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No tasks yet</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Create your first task to get started</p>
              </div>
            ) : tasks.map((task) => {
              const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
              const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              return (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                  borderRadius: 12, background: 'var(--bg-surface-2)',
                  border: `1.5px solid var(--border-light)`,
                  borderLeft: `3px solid ${pConfig.dot}`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.04)'; e.currentTarget.style.borderLeftColor = pConfig.dot; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                    {task.assignedTo && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Assigned to {task.assignedTo.name}</p>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${pConfig.dot}15`, color: pConfig.color, flexShrink: 0, textTransform: 'capitalize' }}>{task.priority}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: task.status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(108,99,255,0.08)', color: task.status === 'done' ? '#16A34A' : 'var(--accent-primary)', flexShrink: 0, textTransform: 'capitalize' }}>{task.status}</span>
                  {isOverdue && <AlertTriangle size={13} color="#EF4444" style={{ flexShrink: 0 }} />}
                  {task.deadline && <span style={{ fontSize: 11, color: isOverdue ? '#DC2626' : 'var(--text-muted)', flexShrink: 0 }}>{format(new Date(task.deadline), 'MMM d')}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTaskModal
          projectId={projectId}
          members={[...(project?.members || []), { user: project?.owner }]}
          onClose={() => setShowCreate(false)}
          onSuccess={handleTaskCreated}
          defaultStatus={defaultStatus}
        />
      )}
    </div>
  );
}
