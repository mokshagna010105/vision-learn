import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import { 
  Users, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Settings, 
  Terminal, 
  Cpu, 
  AlertTriangle,
  Mail,
  User,
  Lock,
  BookOpen
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'teachers', 'system'

  // Data State
  const [analytics, setAnalytics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State (New Teacher)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('Science');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resAnalytic, resTeachers, resLogs] = await Promise.all([
        api.getAnalytics(),
        api.getTeachers(),
        api.getLogs()
      ]);
      setAnalytics(resAnalytic.data);
      setTeachers(resTeachers.data);
      setLogs(resLogs.data);
    } catch (error) {
      console.error('Failed to load admin data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name || !email || !password) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      const res = await api.createTeacher({ name, email, password, subject });
      setTeachers([res.data, ...teachers]);
      setFormSuccess('Teacher account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create teacher account');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher account?')) return;
    try {
      await api.deleteTeacher(id);
      setTeachers(teachers.filter(t => t._id !== id));
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Convert raw API response formats to chart inputs
  const getKeywordChartData = () => {
    if (!analytics?.topKeywords) return [];
    return analytics.topKeywords.map(k => ({ label: k.keyword, value: k.count }));
  };

  const getSessionsChartData = () => {
    if (!analytics?.dailySessions || analytics.dailySessions.length === 0) {
      // Mock historical data if empty
      return [
        { label: 'Jul 24', value: 3 },
        { label: 'Jul 25', value: 5 },
        { label: 'Jul 26', value: 8 },
        { label: 'Jul 27', value: 12 },
        { label: 'Jul 28', value: 7 },
        { label: 'Jul 29', value: 15 },
        { label: 'Jul 30', value: 9 }
      ];
    }
    return analytics.dailySessions.map(d => ({ label: d.date.split('-').slice(1).join('/'), value: d.count }));
  };

  const getApiChartData = () => {
    if (!analytics?.apiUsage) return [];
    return [
      { label: 'Whisper STT', value: analytics.apiUsage.whisper || 0 },
      { label: 'Image Search', value: analytics.apiUsage.imageSearch || 0 },
      { label: 'AI Gen (DALL-E)', value: analytics.apiUsage.imageGeneration || 0 }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-850 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Admin Management Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add or remove teachers, view server API latency metrics, and read system diagnostics.</p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 w-fit">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'analytics' 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-250'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'teachers' 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-250'
            }`}
          >
            Teachers
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'system' 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-250'
            }`}
          >
            IT System Monitor
          </button>
        </div>
      </div>


      

      {/* Main Content Areas */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GlassCard className="flex items-center gap-4 text-left">
              <div className="p-3 bg-primary-500/10 text-primary-600 dark:bg-primary-500/25 dark:text-primary-400 rounded-xl">
                <Users size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Teachers</span>
                <span className="text-lg font-bold text-slate-850 dark:text-white">{analytics?.summary.totalTeachers || 0}</span>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-4 text-left">
              <div className="p-3 bg-accent-500/10 text-accent-600 dark:bg-accent-500/25 dark:text-accent-400 rounded-xl">
                <Activity size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Daily Sessions</span>
                <span className="text-lg font-bold text-slate-850 dark:text-white">{analytics?.summary.totalSessions || 0}</span>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-4 text-left">
              <div className="p-3 bg-violet-500/10 text-violet-600 dark:bg-violet-500/25 dark:text-violet-400 rounded-xl">
                <Clock size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Avg Latency</span>
                <span className="text-lg font-bold text-slate-850 dark:text-white">
                  {analytics?.summary.avgLatency ? `${analytics.summary.avgLatency}ms` : '1.2s'}
                </span>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-4 text-left">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Keywords Logged</span>
                <span className="text-lg font-bold text-slate-850 dark:text-white">{analytics?.summary.totalKeywords || 0}</span>
              </div>
            </GlassCard>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-12 gap-6">
            <GlassCard className="md:col-span-8 flex flex-col gap-4" hover={false}>
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Sessions History Trend</h3>
              <LineChart data={getSessionsChartData()} title="Classroom Sessions per day" />
            </GlassCard>

            <GlassCard className="md:col-span-4 flex flex-col gap-4" hover={false}>
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">API Service Load</h3>
              <PieChart data={getApiChartData()} />
            </GlassCard>
          </div>

          <GlassCard className="flex flex-col gap-4" hover={false}>
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Top Searched Classroom Concepts</h3>
            {analytics?.topKeywords.length === 0 ? (
              <div className="text-slate-500 text-xs py-6 text-center">No keywords detected yet.</div>
            ) : (
              <BarChart data={getKeywordChartData()} height={220} title="Keyword frequency counts across all rooms" />
            )}
          </GlassCard>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="grid md:grid-cols-12 gap-6">
          {/* Create Teacher Form */}
          <div className="md:col-span-4">
            <GlassCard className="flex flex-col gap-4 text-left" hover={false}>
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                <Plus size={16} className="text-primary-500" /> Create Teacher Account
              </h3>

              <form onSubmit={handleCreateTeacher} className="flex flex-col gap-4 text-xs">
                {formError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-xl">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-455 rounded-xl">
                    {formSuccess}
                  </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Full Name</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><User size={14} /></span>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Email Address</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Mail size={14} /></span>
                    <input
                      type="email"
                      required
                      placeholder="teacher@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Password</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock size={14} /></span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Teaching Subject</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><BookOpen size={14} /></span>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Geography">Geography</option>
                      <option value="History">History</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-md glow-primary cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Create Account
                </button>
              </form>
            </GlassCard>
          </div>

          {/* Teacher Directory List */}
          <div className="md:col-span-8">
            <GlassCard className="flex flex-col gap-4 text-left h-full" hover={false}>
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">School Teacher Directory</h3>
              
              {teachers.length === 0 ? (
                <div className="text-slate-500 text-xs py-10 text-center">No teacher accounts registered.</div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {teachers.map(teacher => (
                    <div 
                      key={teacher._id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs transition-all hover:border-slate-200 dark:hover:border-slate-800"
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-bold text-slate-800 dark:text-white">{teacher.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{teacher.email}</span>
                        <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 font-bold text-[9px] w-fit mt-1">
                          {teacher.subject}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteTeacher(teacher._id)}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl cursor-pointer transition-all"
                        title="Delete teacher account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="flex flex-col gap-6 text-left">
          {/* API Monitoring & Latency Summary */}
          <div className="grid md:grid-cols-4 gap-6">
            <GlassCard className="flex flex-col gap-1.5" hover={false}>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Whisper STT status</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${analytics?.apiHealth.whisper === 'online' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="text-xs font-bold capitalize">{analytics?.apiHealth.whisper || 'offline'}</span>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-1.5" hover={false}>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Unsplash API</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${analytics?.apiHealth.unsplash === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                <span className="text-xs font-bold capitalize">{analytics?.apiHealth.unsplash || 'offline'}</span>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-1.5" hover={false}>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pixabay API</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${analytics?.apiHealth.pixabay === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                <span className="text-xs font-bold capitalize">{analytics?.apiHealth.pixabay || 'offline'}</span>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-1.5" hover={false}>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Google Custom Search</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${analytics?.apiHealth.googleSearch === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                <span className="text-xs font-bold capitalize">{analytics?.apiHealth.googleSearch || 'offline'}</span>
              </div>
            </GlassCard>
          </div>

          {/* System logs console terminal */}
          <GlassCard className="flex flex-col gap-4 text-left" hover={false}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Terminal size={16} className="text-accent-500" /> Live System Logs & Errors
              </h3>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-semibold rounded-lg"
              >
                Refresh Logs
              </button>
            </div>

            {/* Log list terminal display */}
            <div className="p-4 bg-slate-950 text-slate-350 font-mono text-[10px] leading-relaxed rounded-2xl max-h-[300px] overflow-y-auto border border-slate-900 flex flex-col gap-1">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic">No system event logs recorded.</div>
              ) : (
                logs.map((log) => {
                  let levelColor = 'text-slate-400';
                  if (log.level === 'error') levelColor = 'text-rose-500 font-bold';
                  if (log.level === 'warn') levelColor = 'text-amber-500 font-bold';
                  
                  return (
                    <div key={log._id} className="flex gap-2 hover:bg-white/5 py-0.5 px-1 rounded transition-colors">
                      <span className="text-slate-600">[{new Date(log.timestamp).toISOString()}]</span>
                      <span className={`${levelColor} uppercase`}>[{log.level}]</span>
                      <span className="text-slate-300 flex-1">{log.message}</span>
                      {log.latencyMs !== undefined && (
                        <span className="text-accent-400 font-bold">({log.latencyMs}ms)</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
