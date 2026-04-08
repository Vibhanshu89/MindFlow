import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Plus, FolderKanban, Search, Clock, Users, AlertTriangle, Layers } from 'lucide-react';
import CreateProjectModal from '../components/common/CreateProjectModal';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = ['all', 'active', 'completed', 'on-hold'];

const STATUS_STYLES = {
  active: { bg: 'rgba(59,130,246,0.1)', color: '#2563EB', border: 'rgba(59,130,246,0.2)', label: 'Active' },
  completed: { bg: 'rgba(34,197,94,0.1)', color: '#16A34A', border: 'rgba(34,197,94,0.2)', label: 'Completed' },
  'on-hold': { bg: 'rgba(234,179,8,0.1)', color: '#CA8A04', border: 'rgba(234,179,8,0.2)', label: 'On Hold' },
  planning: { bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.2)', label: 'Planning' },
};

function ProjectCard({ project }) {
  const isOverdue = isPast(new Date(project.deadline)) && project.status !== 'completed';
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.planning;

  return (
    <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
        borderRadius: 18, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
      >
        {/* Colored top stripe */}
        <div style={{ height: 5, background: project.color || 'linear-gradient(90deg, #6C63FF, #FF6584)', borderRadius: '18px 18px 0 0' }} />

        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {project.description || 'No description provided'}
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, flexShrink: 0,
              background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
            }}>
              {statusStyle.label}
            </span>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, color: 'var(--text-muted)' }}>
              <span>Progress</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{project.progress}%</span>
            </div>
            <div style={{ height: 7, background: 'var(--bg-surface-2)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${project.progress}%`,
                background: project.color || 'linear-gradient(90deg, #6C63FF, #FF6584)',
                borderRadius: 9999, transition: 'width 0.7s ease',
              }} />
            </div>
          </div>

          {/* AI Risk */}
          {project.aiRiskScore > 0 && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                <AlertTriangle size={11} color="#EA580C" />
                <span style={{ color: '#EA580C', fontWeight: 600 }}>AI Risk Score: {project.aiRiskScore}/100</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex' }}>
                {project.members?.slice(0, 3).map((m, i) => (
                  <div key={m.user?._id || i} style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: `hsl(${(i * 80 + 240)}, 65%, 58%)`,
                    border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 10, fontWeight: 700,
                    marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i,
                    position: 'relative',
                  }}>
                    {(m.user?.name || m.name || '?').charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              {(project.members?.length || 0) > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{project.members.length + 1} members</span>
              )}
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isOverdue ? '#DC2626' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
              {isOverdue && '⚠ '}
              <Clock size={10} />
              {format(new Date(project.deadline), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectAPI.getAll();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.06) 0%, rgba(255,101,132,0.03) 100%)',
        border: '1px solid var(--border-light)', borderRadius: 20, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
              <FolderKanban size={18} color="white" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>
              Projects
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{projects.length}</span> total projects · <span style={{ color: 'var(--accent-success)' }}>{projects.filter(p => p.status === 'active').length} active</span>
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'color 0.2s' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.target.previousSibling.style.color = 'var(--accent-primary)'; }}
            onBlur={e => { e.target.previousSibling.style.color = 'var(--text-muted)'; }}
            className="input-field"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: '1.5px solid',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                ...(statusFilter === s
                  ? { background: 'linear-gradient(135deg, #6C63FF, #FF6584)', color: 'white', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(108,99,255,0.35)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border-light)' }
                ),
              }}
            >
              {s.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18 }} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((project, i) => (
            <div key={project._id} className="animate-slide-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <ProjectCard project={project} />
            </div>
          ))}
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: 'var(--bg-surface)', border: '2px dashed var(--border-medium)',
              borderRadius: 18, padding: '40px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(108,99,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>New Project</span>
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Layers size={52} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--border-medium)' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>No projects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ margin: '0 auto', display: 'inline-flex', gap: 8 }}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      )}

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onSuccess={fetchProjects} />
      )}
    </div>
  );
}
