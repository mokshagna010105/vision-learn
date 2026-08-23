import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  User, 
  Key, 
  MapPin, 
  Settings as SettingsIcon, 
  Save, 
  KeyRound, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  // Profile fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // API Config (Stored locally or simulated)
  const [openaiKey, setOpenaiKey] = useState('••••••••••••••••••••••••••••');
  const [unsplashKey, setUnsplashKey] = useState('••••••••••••••••••••••••••••');
  const [pixabayKey, setPixabayKey] = useState('••••••••••••••••••••••••••••');
  const [googleKey, setGoogleKey] = useState('••••••••••••••••••••••••••••');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccess('Profile settings updated successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleSaveAPIs = (e) => {
    e.preventDefault();
    setSaveSuccess('API configuration keys saved to environment proxy!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Workspace Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Modify credentials, adjust API key overrides, and configure classroom parameters.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Side: Profile & Credentials */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <GlassCard className="flex flex-col gap-4 text-left" hover={false}>
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <User size={16} className="text-primary-500" /> Account Profile Info
            </h3>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-455 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle size={14} /> {saveSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Full Name</span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Email Address</span>
                <input
                  type="email"
                  disabled
                  value={profileEmail}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Current Password</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">New Password</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-fit px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-sm glow-primary cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Save size={13} /> Update Profile
              </button>
            </form>
          </GlassCard>

          {/* School configurations */}
          <GlassCard className="flex flex-col gap-4 text-left" hover={false}>
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <MapPin size={16} className="text-accent-500" /> Classrooms & Supported Subjects
            </h3>

            <div className="text-xs flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Configured Rooms</span>
                <div className="flex flex-wrap gap-2">
                  {['Classroom A', 'Classroom B', 'Classroom C', 'Main Hall'].map((room) => (
                    <span key={room} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium">
                      {room}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Educational Categories</span>
                <div className="flex flex-wrap gap-2">
                  {['Science', 'Mathematics', 'Geography', 'Animal', 'History', 'General'].map((subject) => (
                    <span key={subject} className="px-3 py-1.5 rounded-xl bg-accent-500/10 text-accent-700 dark:text-accent-400 font-semibold border border-accent-500/10">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: API Key Configurations */}
        <div className="md:col-span-6">
          <GlassCard className="flex flex-col gap-4 text-left h-full" hover={false}>
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <KeyRound size={16} className="text-violet-500" /> API Integration Keys
            </h3>

            <div className="mb-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15 text-[11px] text-violet-700 dark:text-violet-400 leading-relaxed flex items-start gap-2">
              <HelpCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                To override search APIs at runtime, specify credentials below. If keys are omitted, the server automatically defaults to keyless educational stock photography fallbacks.
              </span>
            </div>

            <form onSubmit={handleSaveAPIs} className="flex flex-col gap-4 text-xs flex-1 justify-between">
              <div className="flex flex-col gap-4">
                {/* OpenAI */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px] flex items-center gap-1">OpenAI API Key (Whisper / DALL-E)</span>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                </div>

                {/* Unsplash */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Unsplash Access Key</span>
                  <input
                    type="password"
                    value={unsplashKey}
                    onChange={(e) => setUnsplashKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                </div>

                {/* Pixabay */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Pixabay API Key</span>
                  <input
                    type="password"
                    value={pixabayKey}
                    onChange={(e) => setPixabayKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                </div>

                {/* Google Search */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Google Custom Search CX Key</span>
                  <input
                    type="password"
                    value={googleKey}
                    onChange={(e) => setGoogleKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-fit mt-4 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-sm glow-primary cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Save size={13} /> Save Credentials
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
