import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: '🚀', text: 'Accelerated task prioritization' },
  { icon: '📊', text: 'Real-time analytics & insights' },
  { icon: '🤝', text: 'Team collaboration & roles' },
  { icon: '🔔', text: 'Smart notifications via Socket.io' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
      toast.success('Welcome back! 👋');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left Panel — Gradient Illustration */}
      <div style={{
        flex: 1, background: 'linear-gradient(145deg, #6C63FF 0%, #9F8FFF 50%, #FF6584 100%)',
        display: 'none', position: 'relative', overflow: 'hidden', padding: '60px 56px',
        flexDirection: 'column', justifyContent: 'space-between',
      }} className="desktop-panel">
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: 'white', fontFamily: 'Plus Jakarta Sans' }}>MindFlow</span>
        </div>

        {/* Tagline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.2, marginBottom: 16 }}>
            Elevate your<br />workflow
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 36, lineHeight: 1.7 }}>
            Beautiful Kanban boards, seamless automation, and real-time team collaboration.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1 }}>© 2025 MindFlow. All rights reserved.</p>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', maxWidth: 520 }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
          {/* Mobile Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#6C63FF,#FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(108,99,255,0.4)' }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>MindFlow</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome back 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Sign in to your workspace to continue
          </p>

          {/* Google OAuth */}
          <a href="/api/auth/google" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)',
            color: 'var(--text-primary)', textDecoration: 'none', marginBottom: 24,
            boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email" id="login-email" className="input-field"
                  style={{ paddingLeft: 38 }}
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'} id="login-password" className="input-field"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: '13px 24px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-panel { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
