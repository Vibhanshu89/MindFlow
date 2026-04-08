import { useState } from 'react';
import { aiAPI, projectAPI } from '../../services/api';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  high: { bg: 'rgba(249,115,22,0.1)', color: '#EA580C' },
  medium: { bg: 'rgba(234,179,8,0.1)', color: '#CA8A04' },
  low: { bg: 'rgba(34,197,94,0.1)', color: '#16A34A' },
};

export default function GenerateTab({ selectedProject, projects }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleGenerate = async () => {
    if (!selectedProject) return toast.error('Select a project first');
    const project = projects?.find(p => p._id === selectedProject);
    setLoading(true);
    try {
      const data = await aiAPI.generateTasks({
        projectName: project?.name,
        projectDescription: project?.description,
        existingTasks: [],
      });
      setSuggestions(data.suggestions || []);
      toast.success('AI generated task suggestions!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Action */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#A78BFA,#6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(167,139,250,0.4)' }}>
            <Sparkles size={15} color="white" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>AI Task Generator</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>
          Let AI generate smart task suggestions based on your project name and goals. These are suggested tasks you can add to your project.
        </p>
        <button onClick={handleGenerate} disabled={loading || !selectedProject} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
          {loading ? 'Generating...' : 'Generate Task Suggestions'}
        </button>
        {!selectedProject && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>← Select a project above to generate tasks</p>}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }} className="animate-fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            {suggestions.length} Task Suggestions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => {
              const pc = PRIORITY_COLORS[s.priority] || PRIORITY_COLORS.medium;
              return (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)', animationDelay: `${i * 0.06}s` }} className="animate-slide-in-up">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{s.title}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: pc.bg, color: pc.color, flexShrink: 0, textTransform: 'capitalize' }}>{s.priority}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    {s.estimatedHours && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>⏱ {s.estimatedHours}h estimated</span>}
                    {s.tags?.length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{s.tags.map(t => <span key={t} className="tag" style={{ padding: '1px 7px', fontSize: 10 }}>#{t}</span>)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
