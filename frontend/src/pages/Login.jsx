import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <GlassCard className="border border-white/50 dark:border-slate-850 p-8 shadow-xl bg-white/70 dark:bg-slate-900/70" hover={false}>
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white shadow-md glow-primary">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-2">Welcome Back</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to access your classroom dashboard</p>
          </div>

          {/* Seeded Accounts Info */}
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-[11px] text-amber-700 dark:text-amber-400 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] mb-1">
              <ShieldAlert size={12} /> Seeded Accounts (For Testing)
            </div>
            <div><span className="font-semibold">Teacher:</span> teacher@visionlearn.com / teacherpassword</div>
            <div><span className="font-semibold">Admin:</span> admin@visionlearn.com / adminpassword</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {error && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold text-xs rounded-xl shadow-md glow-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
