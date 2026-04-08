import { useState, useEffect } from 'react';
import { aiAPI, projectAPI } from '../../services/api';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function SentimentBadge({ sentiment }) {
  const cfg = {
    positive: { bg: 'rgba(34,197,94,0.1)', color: '#16A34A', label: '😊 Positive' },
    neutral: { bg: 'rgba(59,130,246,0.1)', color: '#2563EB', label: '😐 Neutral' },
    negative: { bg: 'rgba(249,115,22,0.1)', color: '#EA580C', label: '😟 Negative' },
    concerning: { bg: 'rgba(239,68,68,0.1)', color: '#DC2626', label: '⚠️ Concerning' },
  }[sentiment] || { bg: 'rgba(100,116,139,0.1)', color: '#475569', label: sentiment };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

export default function StandupTab({ selectedProject, projects }) {
  const [loading, setLoading] = useState(false);
  const [standup, setStandup] = useState({ yesterday: '', today: '', blockers: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (selectedProject) {
      aiAPI.getStandups(selectedProject).then(d => setHistory(d.standups || [])).catch(() => {});
    } else {
      setHistory([]);
    }
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return toast.error('Select a project first');
    if (!standup.yesterday || !standup.today) return toast.error('Fill in yesterday and today fields');
    setLoading(true);
    try {
      const data = await aiAPI.submitStandup({ ...standup, projectId: selectedProject });
      setResult(data.aiInsights);
      setHistory(prev => [data.standup, ...prev]);
      setStandup({ yesterday: '', today: '', blockers: '' });
      toast.success('AI has analyzed your standup!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="animate-fade-in">
      {/* Form */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            <MessageSquare size={15} color="white" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Submit Standup</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[{ key: 'yesterday', label: 'Yesterday', placeholder: 'What did you work on yesterday?' },
            { key: 'today', label: 'Today', placeholder: 'What will you work on today?' },
            { key: 'blockers', label: 'Blockers', placeholder: 'Any blockers or impediments?' }
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.label}</label>
              <textarea className="textarea-field" rows={f.key === 'blockers' ? 2 : 3} placeholder={f.placeholder} value={standup[f.key]} onChange={e => setStandup({ ...standup, [f.key]: e.target.value })} style={{ fontSize: 13, resize: 'vertical' }} />
            </div>
          ))}
          <button type="submit" disabled={loading || !selectedProject} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {loading ? 'Analyzing...' : 'Submit Standup'}
          </button>
        </form>
        {!selectedProject && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>← Select a project above to submit your standup</p>}

        {/* AI Result */}
        {result && (
          <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 14, background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Sparkles size={13} color="var(--accent-primary)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)' }}>AI Analysis</span>
              <SentimentBadge sentiment={result.sentiment} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.summary}</p>
            {result.blockers?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>🚫 Blockers:</p>
                {result.blockers.map((b, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 12 }}>• {b}</p>)}
              </div>
            )}
            {result.suggestions?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>💡 Suggestions:</p>
                {result.suggestions.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 12 }}>• {s}</p>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Standups</p>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontSize: 13 }}>{selectedProject ? 'No standups submitted yet' : 'Select a project to see standup history'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
            {history.map(s => (
              <div key={s._id} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{s.user?.name}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <SentimentBadge sentiment={s.aiSentiment} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(s.date), 'MMM d')}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{s.aiSummary || s.today}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
