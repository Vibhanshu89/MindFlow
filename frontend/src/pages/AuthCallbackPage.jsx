import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
          <Zap size={28} className="text-white" />
        </div>
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mt-4" />
        <p className="text-slate-400 mt-4 text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}
