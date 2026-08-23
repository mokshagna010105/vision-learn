import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Mic, 
  Search, 
  Tv, 
  ShieldCheck, 
  ArrowRight,
  BookOpen, 
  TrendingUp, 
  Cpu 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-[150px] pointer-events-none animate-pulse-slow"></div>

      {/* Header */}
      <header className="h-20 max-w-7xl mx-auto w-full px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white shadow-sm glow-primary">
            <BookOpen size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Vision<span className="text-primary-500">Learn</span>
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-all"
          >
            Dashboard Login
          </Link>
          <Link
            to="/classroom-display"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-accent-500 hover:bg-accent-600 transition-all shadow-sm glow-accent flex items-center gap-1.5"
          >
            <Tv size={14} /> Classroom Screen
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-20 z-10 grid md:grid-cols-12 gap-12 items-center flex-1">
        <div className="md:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 font-bold text-xs w-fit">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: '3s' }} /> Next-Generation Visual Learning
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Bring Lessons to Life with{' '}
            <span className="bg-gradient-to-r from-primary-500 to-accent-400 bg-clip-text text-transparent">
              Real-Time AI
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            VisionLearn listens to teachers speaking during class, instantly extracts educational key words, retrieves or generates rich visual aids, and displays them dynamically on screen—without interrupting the classroom flow.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg glow-primary flex items-center gap-2 group transition-all"
            >
              Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/classroom-display"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Demo Classroom
            </Link>
          </div>
        </div>

        {/* Hero Image Mockup */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-accent-500/20 rounded-3xl blur-2xl opacity-60"></div>
          <GlassCard className="border border-white/40 dark:border-slate-850 p-1 bg-white/80 dark:bg-slate-900/80 shadow-2xl relative" hover={false}>
            <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video border border-slate-900 relative shadow-inner">
              {/* Classroom screen mockup content */}
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop" 
                alt="Solar System Mockup" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="px-2.5 py-1 bg-accent-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-md w-fit mb-2">
                  Science
                </span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Solar System</h3>
                <p className="text-[10px] text-slate-400 mt-1">Real-time classroom display visualization</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 border-t border-slate-200/50 dark:border-slate-850 z-10">
        <h2 className="text-2xl font-bold text-center mb-12">Core Features for Smarter Classrooms</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <GlassCard className="flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Mic size={20} />
            </div>
            <h3 className="text-sm font-semibold">Continuous Speech-to-Text</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              OpenAI Whisper API continuously converts class speeches into written transcripts with high accuracy and minimal delays.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="text-sm font-semibold">Lightweight NLP</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Extracts nouns and biological, mathematical, or scientific concepts while skipping filler phrases in under 300 ms.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Search size={20} />
            </div>
            <h3 className="text-sm font-semibold">Instant Retrieval & AI Fallback</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Searches Unsplash, Pixabay, and Google Custom Search simultaneously. Generates DALL-E illustrations if no stock matches are found.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-semibold">Moderation & Override</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Ensures kids only see safe educational materials. Allows teachers to manually edit keywords or clear display.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-200/50 dark:border-slate-850 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md px-6 flex items-center justify-between text-xs text-slate-400">
        <span>&copy; {new Date().getFullYear()} VisionLearn Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
