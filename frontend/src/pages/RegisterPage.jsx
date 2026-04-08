import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'developer', label: '💻 Developer', desc: 'Work on tasks' },
  { value: 'manager', label: '🎯 Manager', desc: 'Manage projects' },
  { value: 'admin', label: '👑 Admin', desc: 'Full access' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'developer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill in all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/dashboard');
      toast.success('Account created! Welcome to MindFlow 🚀');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(145deg, #FF6584 0%, #A78BFA 50%, #6C63FF 100%)',
        display: 'none', position: 'relative', overflow: 'hidden', padding: '60px 56px',
        flexDirection: 'column', justifyContent: 'space-between',
      }} className="desktop-panel">
        <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -40, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: 'white', fontFamily: 'Plus Jakarta Sans' }}>MindFlow</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.2, marginBottom: 16 }}>
            Start your<br />journey today
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of teams already using MindFlow to ship faster and smarter.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { value: '10k+', label: 'Active Users' },
              { value: '50k+', label: 'Tasks Done' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9★', label: 'Rating' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 18px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'Plus Jakarta Sans' }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1 }}>
          Free to start. No credit card required.
        </p>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', maxWidth: 520 }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
          {/* Mobile Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#FF6584,#6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(255,101,132,0.4)' }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>MindFlow</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)', marginBottom: 6 }}>
            Create your account 🚀
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Free forever. No credit card required.</p>

          {/* Google */}
          <a href="/api/auth/google" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: 'var(--bg-surface)', border: '1.5px solid var(--border-light)',
            color: 'var(--text-primary)', textDecoration: 'none', marginBottom: 22,
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
            Sign up with Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" id="reg-name" className="input-field" style={{ paddingLeft: 36 }} placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" id="reg-email" className="input-field" style={{ paddingLeft: 36 }} placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <Shield size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Select Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.value} type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      border: '1.5px solid',
                      ...(form.role === r.value
                        ? { background: 'linear-gradient(135deg,rgba(108,99,255,0.1),rgba(255,101,132,0.07))', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }
                        : { background: 'var(--bg-surface)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }
                      ),
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{r.label.split(' ')[0]}</div>
                    <div>{r.label.split(' ').slice(1).join(' ')}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} id="reg-password" className="input-field" style={{ paddingLeft: 36, paddingRight: 40 }} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" id="reg-confirm" className="input-field" style={{ paddingLeft: 36 }} placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: '13px 24px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .desktop-panel { display: flex !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
