import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.1)', color: '#DC2626' },
  high: { bg: 'rgba(249,115,22,0.1)', color: '#EA580C' },
  medium: { bg: 'rgba(234,179,8,0.1)', color: '#CA8A04' },
  low: { bg: 'rgba(34,197,94,0.1)', color: '#16A34A' },
};

export default function PrioritizeTab({ selectedProject }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePrioritize = async () => {
    if (!selectedProject) return toast.error('Select a project first');
    setLoading(true);
    try {
      const data = await aiAPI.prioritizeTasks({ projectId: selectedProject });
      setResult(data);
      toast.success('Tasks prioritized by AI!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Action */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#F59E0B,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
            <Zap size={15} color="white" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Task Prioritization</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>
          AI analyzes and ranks your pending tasks based on deadlines, dependencies, impact, and team capacity to determine the optimal order.
        </p>
        <button onClick={handlePrioritize} disabled={loading || !selectedProject} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
          {loading ? 'Analyzing Tasks...' : 'Prioritize with AI'}
        </button>
        {!selectedProject && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>← Select a project above to prioritize tasks</p>}
      </div>

      {/* Results */}
      {result && (
        <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }} className="animate-fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            {result.rankedTasks?.length} Tasks Ranked by AI Priority
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.rankedTasks?.map((rt, i) => {
              const task = result.tasks?.find(t => t._id.toString() === rt.taskId?.toString());
              const pc = PRIORITY_COLORS[rt.suggestedPriority] || PRIORITY_COLORS.medium;
              return (
                <div key={rt.taskId} style={{
                  padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
                  background: i === 0 ? 'rgba(245,158,11,0.05)' : 'var(--bg-surface-2)',
                  border: `1.5px solid ${i === 0 ? 'rgba(245,158,11,0.25)' : 'var(--border-light)'}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    background: i === 0 ? 'linear-gradient(135deg,#F59E0B,#EA580C)' : i < 3 ? 'rgba(108,99,255,0.1)' : 'var(--bg-surface-3)',
                    color: i === 0 ? 'white' : i < 3 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    boxShadow: i === 0 ? '0 4px 10px rgba(245,158,11,0.4)' : 'none',
                  }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task?.title || 'Task'}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.reasoning}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, flexShrink: 0, textTransform: 'capitalize', background: pc.bg, color: pc.color }}>{rt.suggestedPriority}</span>
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
