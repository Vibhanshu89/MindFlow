import { useState } from 'react';
import { projectAPI } from '../../services/api';
import { Settings, Trash2, Save, AlertTriangle, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const PROJECT_COLORS = [
  '#6C63FF', '#FF6584', '#43CBFF', '#22C55E', '#F59E0B',
  '#EF4444', '#8B5CF6', '#06B6D4', '#10B981', '#F97316',
];

const STATUS_OPTIONS = ['active', 'on-hold', 'completed', 'planning'];

export default function ProjectSettingsTab({ project, onProjectUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#6C63FF',
    status: project?.status || 'active',
    deadline: project?.deadline ? project.deadline.slice(0, 10) : '',
  });
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = project?.owner?._id === user?._id || user?.role === 'admin';

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      const data = await projectAPI.update(project._id, form);
      onProjectUpdate && onProjectUpdate(data.project);
      toast.success('Project updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectAPI.delete(project._id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  if (!isOwner) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <AlertTriangle size={40} style={{ margin: '0 auto 14px', display: 'block', color: 'var(--text-muted)', opacity: 0.4 }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>Access Restricted</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Only the project owner or admin can modify settings.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* General settings */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={15} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Project Details</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Project Name *</label>
            <input type="text" className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Website Redesign" />
          </div>
          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Description</label>
            <textarea className="textarea-field" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief project description..." style={{ resize: 'vertical' }} />
          </div>
          {/* Status + Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Status</label>
              <select className="select-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Deadline</label>
              <input type="date" className="input-field" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
          {/* Color swatch */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              <Palette size={13} /> Project Color
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ width: 34, height: 34, borderRadius: 10, background: c, border: form.color === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', transform: form.color === c ? 'scale(1.15)' : 'scale(1)', boxShadow: form.color === c ? `0 4px 12px ${c}60` : 'none' }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={15} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#DC2626' }}>Danger Zone</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.04)', border: '1.5px solid rgba(239,68,68,0.15)' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Delete this project</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Permanently deletes the project and all its tasks. This action cannot be undone.</p>
          </div>
          <button onClick={() => setShowDelete(true)}
            style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}>
            <Trash2 size={14} /> Delete Project
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={24} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Delete Project?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>This will permanently delete <strong>"{project.name}"</strong> and all {project.tasks?.length || 0} tasks. This cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDelete(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '11px', borderRadius: 12, background: '#EF4444', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
