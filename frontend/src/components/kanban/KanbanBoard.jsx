import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, GripVertical, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { taskAPI } from '../../services/api';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'from-slate-500/20 to-slate-600/10', dot: 'bg-white/80', count_bg: 'bg-white/80/20 text-slate-400' },
  { id: 'in-progress', label: 'In Progress', color: 'from-blue-500/20 to-blue-600/10', dot: 'bg-blue-500', count_bg: 'bg-blue-500/20 text-blue-400' },
  { id: 'review', label: 'Review', color: 'from-violet-500/20 to-violet-600/10', dot: 'bg-violet-500', count_bg: 'bg-violet-500/20 text-violet-400' },
  { id: 'done', label: 'Done', color: 'from-green-500/20 to-green-600/10', dot: 'bg-green-500', count_bg: 'bg-green-500/20 text-green-400' },
];

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', className: 'priority-critical', icon: '🔴' },
  high: { label: 'High', className: 'priority-high', icon: '🟠' },
  medium: { label: 'Medium', className: 'priority-medium', icon: '🟡' },
  low: { label: 'Low', className: 'priority-low', icon: '🟢' },
};

function TaskCard({ task, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
  const isDueToday = task.deadline && isToday(new Date(task.deadline));
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'shadow-2xl shadow-indigo-500/20 rotate-1 scale-105' : ''}`}
    >
      {/* Drag handle + priority */}
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${priority.className}`}>
          {priority.icon} {priority.label}
        </span>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors">
          <GripVertical size={13} className="text-slate-400" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {/* Assignee */}
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5">
            {task.assignedTo.avatar ? (
              <img src={task.assignedTo.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-500/40 flex items-center justify-center text-xs text-indigo-300 font-bold">
                {task.assignedTo.name?.charAt(0)}
              </div>
            )}
            <span className="text-xs text-slate-500 max-w-20 truncate">{task.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <User size={11} /> Unassigned
          </span>
        )}

        {/* Deadline */}
        {task.deadline && (
          <span className={`text-xs flex items-center gap-1 ${
            isOverdue ? 'text-red-400' : isDueToday ? 'text-yellow-400' : 'text-slate-500'
          }`}>
            <Clock size={10} />
            {isOverdue ? '⚠' : ''} {format(new Date(task.deadline), 'MMM d')}
          </span>
        )}
      </div>

      {/* Comments indicator */}
      {task.comments?.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <MessageSquare size={10} />
          {task.comments.length}
        </div>
      )}

      {/* AI priority score */}
      {task.aiPriorityScore > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${task.aiPriorityScore}%`,
                  background: `hsl(${120 - task.aiPriorityScore * 1.2}, 70%, 50%)`,
                }}
              />
            </div>
            <span className="text-xs text-slate-400">AI {task.aiPriorityScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ column, tasks, onAddTask }) {
  return (
    <div className={`kanban-column bg-gradient-to-b ${column.color} flex flex-col gap-3 min-w-72 max-w-80 flex-1`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.dot}`} />
          <h3 className="text-sm font-semibold text-white">{column.label}</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${column.count_bg}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all text-lg leading-none"
        >
          +
        </button>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-white/5 rounded-xl">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTasksUpdate, projectId, members, onAddTask }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t._id === active.id));
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    const overTask = tasks.find((t) => t._id === over.id);

    // Find which column the item was dropped on
    let targetStatus = null;

    // Check if dropped on a column ID
    const column = COLUMNS.find((c) => c.id === over.id);
    if (column) {
      targetStatus = column.id;
    } else if (overTask) {
      targetStatus = overTask.status;
    }

    if (!activeTask || !targetStatus || activeTask.status === targetStatus) return;

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t._id === activeTask._id ? { ...t, status: targetStatus } : t
    );
    onTasksUpdate(updatedTasks);

    try {
      await taskAPI.updateStatus(activeTask._id, { status: targetStatus });
      toast.success(`Task moved to ${COLUMNS.find((c) => c.id === targetStatus)?.label}`);
    } catch (err) {
      // Revert
      onTasksUpdate(tasks);
      toast.error('Failed to update task status');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
