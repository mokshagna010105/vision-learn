const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const getLinks = () => {
    if (!user) return [];

    const teacherLinks = [
      { path: '/dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
      { path: '/classroom-display', label: 'Classroom Screen', icon: MonitorPlay, external: true },
      { path: '/history', label: 'Session History', icon: History },
      { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const adminLinks = [
      { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
      { path: '/history', label: 'System History', icon: History },
      { path: '/settings', label: 'System Settings', icon: Settings },
    ];

    return user.role === 'admin' ? adminLinks : teacherLinks;
  };

  const links = getLinks();

  if (!user) return null;

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md hidden md:flex flex-col justify-between py-6">
      <div className="flex flex-col gap-8 px-4">
        {/* Role Banner */}
        <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 dark:border-primary-500/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-500 animate-ping"></div>
          <span className="text-[11px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            {user.role} Workspace
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = path === link.path;
            
            if (link.external) {
              return (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-200"
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                  <ExternalLink size={12} className="ml-auto opacity-60" />
                </a>
              );
            }

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex 
                  items-center 
                  gap-3 
                  px-4 
                  py-3 
                  text-xs 
                  font-semibold 
                  rounded-xl 
                  transition-all 
                  duration-200
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-sm glow-primary' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-8 text-[10px] text-slate-400 dark:text-slate-500 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-850 pt-4 mx-4">
        <span>VisionLearn v1.0.0</span>
        <span>Environment: Development</span>
      </div>
    </aside>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MonitorPlay, 
  History, 
  Settings, 
  ExternalLink 
} from 'lucide-react';

export default Sidebar;
