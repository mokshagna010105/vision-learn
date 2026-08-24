import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initiateSocketConnection, disconnectSocket } from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, ScreenShare, Sparkles, BookOpen } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const ClassroomDisplay = () => {
  const [searchParams] = useSearchParams();
  const [classroom, setClassroom] = useState(searchParams.get('classroom') || 'Classroom A');
  const [isClassroomSelected, setIsClassroomSelected] = useState(!!searchParams.get('classroom'));

  
  // Classroom Live State
  const [activeSession, setActiveSession] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const clearTimerRef = useRef(null);

  // Auto clear interval in seconds (configurable, default 15s)
  const [autoClearTimeout, setAutoClearTimeout] = useState(15); 

  useEffect(() => {
    if (isClassroomSelected && classroom) {
      console.log(`Connecting Classroom Display to ${classroom}`);
      const socket = initiateSocketConnection(classroom);

      // Listen for socket events
      socket.on('session-started', (data) => {
        setActiveSession(data);
        setCurrentImage(null);
      });

      socket.on('session-stopped', () => {
        setActiveSession(null);
        setCurrentImage(null);
      });

      socket.on('new-image', (data) => {
        setCurrentImage(data);
        
        // Reset auto clear timer
        if (clearTimerRef.current) {
          clearTimeout(clearTimerRef.current);
        }
        
        // Setup new clear timeout
        if (autoClearTimeout > 0) {
          clearTimerRef.current = setTimeout(() => {
            setCurrentImage(null);
          }, autoClearTimeout * 1000);
        }
      });

      socket.on('clear-image', () => {
        setCurrentImage(null);
      });

      return () => {
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        disconnectSocket();
      };
    }
  }, [isClassroomSelected, classroom, autoClearTimeout]);

  const handleSelectClassroom = (e) => {
    e.preventDefault();
    if (classroom) {
      setIsClassroomSelected(true);
    }
  };

  // Selector screen (if no classroom URL query was supplied)
  if (!isClassroomSelected) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden text-left">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary-500/10 blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-[130px] pointer-events-none"></div>

        <div className="w-full max-w-md z-10">
          <GlassCard className="border border-white/10 p-8 shadow-2xl bg-slate-950/70 text-slate-100" hover={false}>
            <div className="flex flex-col items-center gap-2 text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white shadow-lg glow-primary">
                <MonitorPlay size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-2">Classroom Projector</h2>
              <p className="text-xs text-slate-400">Select the classroom terminal to start the visual feed</p>
            </div>

            <form onSubmit={handleSelectClassroom} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose Classroom</label>
                <select
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                >
                  <option value="Classroom A">Classroom A</option>
                  <option value="Classroom B">Classroom B</option>
                  <option value="Classroom C">Classroom C</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Screen Clear Timeout</label>
                <select
                  value={autoClearTimeout}
                  onChange={(e) => setAutoClearTimeout(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-accent-500"
                >
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds (Recommended)</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="0">Never clear</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-xs rounded-xl shadow-lg glow-accent flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ScreenShare size={16} />
                <span>Launch Projector Feed</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden select-none">
      {/* Background abstract nebula */}
      <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary-600/5 blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent-600/5 blur-[180px] pointer-events-none"></div>

      {/* Floating Status Bar */}
      <div className="z-10 flex items-center justify-between w-full border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white">
            <BookOpen size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projector screen</span>
            <span className="text-xs font-semibold text-white">{classroom}</span>
          </div>
        </div>

        {/* Live Broadcast Pulse */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-400">
          <div className={`w-2 h-2 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          <span>{activeSession ? 'Broadcast Active' : 'Waiting for Teacher'}</span>
        </div>
      </div>

      {/* Main visual display area */}
      <div className="flex-1 flex items-center justify-center my-6 z-10 relative">
        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.div
              key={currentImage.imageUrl}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl h-[70vh] rounded-3xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col justify-end relative shadow-2xl glow-primary"
            >
              {/* Dynamic zooming background image */}
              <motion.img
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 15, ease: 'linear' }}
                src={currentImage.imageUrl}
                alt={currentImage.keyword}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Dark subtle overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

              {/* Keyword Metadata Overlay Card */}
              <div className="p-8 text-left z-10 flex items-end justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-lg">
                  <span className="px-3 py-1 rounded-lg bg-accent-500 text-white font-bold text-xs uppercase tracking-wider w-fit flex items-center gap-1.5 shadow-md">
                    <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} /> {currentImage.category || 'Science'}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
                    {currentImage.keyword}
                  </h2>
                </div>
                
                {/* Search attribution source */}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Source: {currentImage.source}
                </span>
              </div>
            </motion.div>
          ) : (
            /* Idle Screen */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center max-w-md p-8 border border-white/5 rounded-3xl bg-slate-950/40 backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-primary-400 animate-pulse">
                <MonitorPlay size={30} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Interactive Visual Blackboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeSession 
                  ? `Teaching session is running for "${activeSession.subject}". As your teacher explains concepts, rich diagrams and visual aids will be displayed here in real time.`
                  : "Waiting for the teacher to initiate a class session. Once started, educational illustrations will automatically display."
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen Footer */}
      <div className="z-10 text-[9px] text-slate-600 dark:text-slate-500 font-bold uppercase tracking-widest border-t border-white/5 pt-4 text-center">
        Powered by VisionLearn AI Classroom Technology
      </div>
    </div>
  );
};

export default ClassroomDisplay;
