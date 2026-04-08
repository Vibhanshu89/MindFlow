import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { AlertTriangle, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const getRiskColor = (level) => {
  const map = {
    low: { bg: 'rgba(34,197,94,0.08)', color: '#16A34A', border: 'rgba(34,197,94,0.25)' },
    medium: { bg: 'rgba(234,179,8,0.08)', color: '#CA8A04', border: 'rgba(234,179,8,0.25)' },
    high: { bg: 'rgba(249,115,22,0.08)', color: '#EA580C', border: 'rgba(249,115,22,0.25)' },
    critical: { bg: 'rgba(239,68,68,0.08)', color: '#DC2626', border: 'rgba(239,68,68,0.25)' },
  };
  return map[level] || map.medium;
};

export default function RiskTab({ selectedProject }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!selectedProject) return toast.error('Select a project first');
    setLoading(true);
    try {
      const data = await aiAPI.predictRisk({ projectId: selectedProject });
      setResult(data.riskAnalysis);
      toast.success('Risk analysis complete!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Action card */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#EF4444,#FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            <ShieldAlert size={15} color="white" />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Risk Prediction</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>
          AI analyzes your project's tasks, deadlines, team velocity, and blockers to predict delivery risks and suggest immediate actions.
        </p>
        <button onClick={handleAnalyze} disabled={loading || !selectedProject} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <AlertTriangle size={14} />}
          {loading ? 'Analyzing Risks...' : 'Analyze Project Risk'}
        </button>
        {!selectedProject && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>← Select a project above to analyze risk</p>}
      </div>

      {/* Result */}
      {result && (() => {
        const rc = getRiskColor(result.riskLevel);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
            {/* Risk Score */}
            <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Risk Assessment</p>
              <div style={{ padding: 20, borderRadius: 16, background: rc.bg, border: `1.5px solid ${rc.border}`, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: rc.color }}>Risk Level: {result.riskLevel?.toUpperCase()}</p>
                    <p style={{ fontSize: 13, color: rc.color, opacity: 0.85, marginTop: 3 }}>Delay probability: {result.delayProbability}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 36, fontWeight: 900, color: rc.color, fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>{result.riskScore}</p>
                    <p style={{ fontSize: 12, color: rc.color, opacity: 0.7 }}>/100</p>
                  </div>
                </div>
                <div style={{ height: 10, background: 'rgba(0,0,0,0.1)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.riskScore}%`, background: rc.color, borderRadius: 9999, transition: 'width 1s ease' }} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
            </div>
            {/* Risks + Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {result.keyRisks?.length > 0 && (
                <div style={{ background: 'var(--bg-surface)', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 18, padding: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} />Key Risks
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.keyRisks.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                        <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.immediateActions?.length > 0 && (
                <div style={{ background: 'var(--bg-surface)', border: '1.5px solid rgba(34,197,94,0.2)', borderRadius: 18, padding: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#16A34A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} />Immediate Actions
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.immediateActions.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                        <CheckCircle size={12} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
