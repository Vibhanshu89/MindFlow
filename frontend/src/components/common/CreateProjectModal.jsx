import { useState } from 'react';
import { X, FolderKanban, Calendar, Users, Tag } from 'lucide-react';
import { projectAPI, authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export default function CreateProjectModal({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    deadline: '',
    priority: 'medium',
    color: '#6366f1',
    tags: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.deadline) {
      toast.error('Name and deadline are required');
      return;
    }
    setLoading(true);
    try {
      const data = await projectAPI.create({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Project created successfully!');
      onClose();
      if (onSuccess) onSuccess(data.project);
      navigate(`/projects/${data.project._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: form.color + '20', border: `1px solid ${form.color}40` }}>
              <FolderKanban size={18} style={{ color: form.color }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">New Project</h2>
              <p className="text-xs text-slate-500">Fill in the project details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., E-commerce Platform Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              className="textarea-field"
              rows={3}
              placeholder="Brief project description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Deadline + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                <Calendar size={13} className="inline mr-1" />Deadline *
              </label>
              <input
                type="date"
                className="input-field"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select
                className="select-field"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Tag size={13} className="inline mr-1" />Tags (comma separated)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., frontend, backend, api"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                  style={{
                    background: color,
                    ring: form.color === color ? `2px solid white` : 'none',
                    outline: form.color === color ? `2px solid white` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
