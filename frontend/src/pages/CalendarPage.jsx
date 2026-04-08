import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isPast, isToday } from 'date-fns';
import { Link } from 'react-router-dom';

const PRIORITY_DOT = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
};

const STATUS_COLOR = {
  done: '#22C55E',
  'in-progress': '#6C63FF',
  review: '#A78BFA',
  todo: '#9B95B4',
};

function buildCalendarDays(currentMonth) {
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    taskAPI.getMyTasks().then((d) => {
      setTasks(d.tasks || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const days = buildCalendarDays(currentMonth);
  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getTasksForDay = (day) =>
    tasks.filter((t) => t.deadline && isSameDay(new Date(t.deadline), day));

  const selectedDayTasks = getTasksForDay(selectedDay);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(67,203,255,0.05) 100%)',
        border: '1px solid var(--border-light)', borderRadius: 20, padding: '22px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #6C63FF, #43CBFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
            <Calendar size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>Task Calendar</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tasks.length} tasks with deadlines</p>
          </div>
        </div>
        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', minWidth: 150, textAlign: 'center', fontFamily: 'Plus Jakarta Sans' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ChevronRight size={16} />
          </button>
          <button onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(108,99,255,0.35)' }}>
            Today
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Calendar Grid */}
        <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Week day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-light)' }}>
            {WEEK_DAYS.map(d => (
              <div key={d} style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDay);
              const isTodayDay = isToday(day);
              const hasOverdue = dayTasks.some(t => t.status !== 'done' && isPast(new Date(t.deadline)));

              return (
                <div key={idx}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    minHeight: 90, padding: '8px 10px',
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-light)' : 'none',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(108,99,255,0.06)' : 'transparent',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Day number */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: isTodayDay ? 'linear-gradient(135deg, #6C63FF, #FF6584)' : isSelected ? 'rgba(108,99,255,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: isTodayDay || isSelected ? 700 : 400,
                    color: isTodayDay ? 'white' : isSelected ? 'var(--accent-primary)' : isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginBottom: 4,
                    boxShadow: isTodayDay ? '0 2px 8px rgba(108,99,255,0.4)' : 'none',
                  }}>{format(day, 'd')}</div>
                  {/* Tasks dots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayTasks.slice(0, 3).map((t, i) => (
                      <div key={t._id} style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                        background: t.status === 'done' ? 'rgba(34,197,94,0.1)' : isPast(new Date(t.deadline)) ? 'rgba(239,68,68,0.1)' : 'rgba(108,99,255,0.08)',
                        color: t.status === 'done' ? '#16A34A' : isPast(new Date(t.deadline)) ? '#DC2626' : 'var(--accent-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        borderLeft: `2px solid ${PRIORITY_DOT[t.priority] || '#6C63FF'}`,
                      }}>{t.title}</div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, paddingLeft: 5 }}>+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                  {/* Overdue indicator */}
                  {hasOverdue && <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selected Day Header */}
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: isToday(selectedDay) ? 'linear-gradient(135deg, #6C63FF, #FF6584)' : 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday(selectedDay) ? '0 4px 14px rgba(108,99,255,0.4)' : 'none' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: isToday(selectedDay) ? 'white' : 'var(--accent-primary)', fontFamily: 'Plus Jakarta Sans' }}>{format(selectedDay, 'd')}</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{format(selectedDay, 'EEEE')}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(selectedDay, 'MMMM yyyy')}</p>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={13} color="var(--accent-primary)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''} due</span>
            </div>
          </div>

          {/* Task List for Selected Day */}
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: '18px 20px', boxShadow: 'var(--shadow-sm)', flex: 1, minHeight: 200 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Tasks Due</p>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)}
              </div>
            ) : selectedDayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                <Calendar size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>No tasks due this day</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedDayTasks.map((task) => {
                  const isOverdue = isPast(new Date(task.deadline)) && task.status !== 'done';
                  return (
                    <Link key={task._id} to={`/projects/${task.project?._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '10px 12px', borderRadius: 12,
                        background: task.status === 'done' ? 'rgba(34,197,94,0.04)' : isOverdue ? 'rgba(239,68,68,0.04)' : 'var(--bg-surface-2)',
                        border: `1.5px solid ${task.status === 'done' ? 'rgba(34,197,94,0.15)' : isOverdue ? 'rgba(239,68,68,0.15)' : 'var(--border-light)'}`,
                        borderLeft: `3px solid ${PRIORITY_DOT[task.priority] || '#6C63FF'}`,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {task.status === 'done' ? <CheckCircle2 size={13} color="#22C55E" /> : isOverdue ? <AlertTriangle size={13} color="#EF4444" /> : <Circle size={13} color={STATUS_COLOR[task.status]} />}
                          <p style={{ fontSize: 13, fontWeight: 600, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                        </div>
                        {task.project?.name && (
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 21 }}>{task.project.name}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: '14px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Priority Legend</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(PRIORITY_DOT).map(([p, c]) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 500 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
