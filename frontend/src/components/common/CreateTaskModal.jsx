import { useState } from 'react';
import { X, CheckSquare, Calendar, User, AlertCircle } from 'lucide-react';
import { taskAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ projectId, members = [], onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignedTo: '',
    deadline: '',
    estimatedHours: '',
    tags: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    setLoading(true);
    try {
      const data = await taskAPI.create({
        ...form,
        project: projectId,
        assignedTo: form.assignedTo || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Task created!');
      onSuccess?.(data.task);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <CheckSquare size={18} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">New Task</h2>
              <p className="text-xs text-slate-500">Add a task to this project</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Task Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Implement login API endpoint"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              className="textarea-field"
              rows={3}
              placeholder="Task details, acceptance criteria..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select className="select-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select className="select-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                <User size={13} className="inline mr-1" />Assign To
              </label>
              <select className="select-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
                    {m.user?.name || m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                <Calendar size={13} className="inline mr-1" />Deadline
              </label>
              <input
                type="date"
                className="input-field"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Est. Hours</label>
            <input
              type="number"
              min="0"
              className="input-field"
              placeholder="e.g., 4"
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
