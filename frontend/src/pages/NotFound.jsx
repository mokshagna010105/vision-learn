import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-left relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <GlassCard className="border border-white/50 dark:border-slate-850 p-8 shadow-xl text-center bg-white/70 dark:bg-slate-900/70" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-6">
            <Compass size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white uppercase tracking-wide">404 - Page Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <Link
            to="/"
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs rounded-xl shadow-md glow-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Safety</span>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFound;
