import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { api } from '../services/api';
import { initiateSocketConnection, disconnectSocket } from '../services/socket';
import { 
  Play, 
  Square, 
  Mic, 
  MicOff, 
  Sparkles, 
  Image as ImageIcon, 
  Trash2, 
  History, 
  Upload, 
  Timer, 
  Cpu, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  // Settings State
  const [selectedClassroom, setSelectedClassroom] = useState(user?.classrooms?.[0] || 'Classroom A');
  const [selectedSubject, setSelectedSubject] = useState(user?.subject || 'Science');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [speechMode, setSpeechMode] = useState('webspeech'); // 'webspeech' or 'whisper'

  // Session State
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null);

  // Speech Hook
  const {
    isListening,
    transcript,
    error: speechError,
    latestKeyword,
    startListening,
    stopListening
  } = useSpeechToText(session?._id, speechMode);

  // UI Override State
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [currentSource, setCurrentSource] = useState('');
  const [overrideUrlInput, setOverrideUrlInput] = useState('');
  const [dalleLoading, setDalleLoading] = useState(false);
  const [sessionKeywords, setSessionKeywords] = useState([]);

  // Socket Connection
  useEffect(() => {
    if (session && session.isActive) {
      const socket = initiateSocketConnection(selectedClassroom);
      
      socket.on('new-image', (data) => {
        setCurrentImageUrl(data.imageUrl);
        setCurrentKeyword(data.keyword);
        setCurrentSource(data.source);
        
        // Add to local keyword history list
        setSessionKeywords((prev) => {
          if (prev.some(k => k.keyword === data.keyword)) return prev;
          return [{ keyword: data.keyword, category: data.category, imageUrl: data.imageUrl, timestamp: new Date() }, ...prev];
        });
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [session]);

  // Session Timer
  useEffect(() => {
    if (session?.isActive && isListening) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session, isListening]);

  // Sync state when latestKeyword updates from the speech hook
  useEffect(() => {
    if (latestKeyword) {
      setCurrentKeyword(latestKeyword.keyword);
    }
  }, [latestKeyword]);

  const handleStartSession = async () => {
    try {
      const res = await api.startSession({
        classroom: selectedClassroom,
        subject: selectedSubject,
        language: selectedLanguage
      });
      setSession(res.data);
      setTimer(0);
      setSessionKeywords([]);
      setCurrentImageUrl('');
      setCurrentKeyword('');
      setCurrentSource('');
      console.log('Session started:', res.data);
    } catch (err) {
      console.error('Failed to start session:', err.message);
    }
  };

  const handleStopSession = async () => {
    if (!session) return;
    stopListening();
    try {
      await api.stopSession({ sessionId: session._id });
      setSession(null);
      setTimer(0);
      console.log('Session stopped');
    } catch (err) {
      console.error('Failed to stop session:', err.message);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Image manual override
  const handleOverrideImage = async (e) => {
    e.preventDefault();
    if (!session || !overrideUrlInput.trim() || !currentKeyword) return;
    try {
      const res = await api.overrideImage(session._id, currentKeyword, overrideUrlInput.trim());
      setCurrentImageUrl(res.data.imageUrl);
      setCurrentSource('Override');
      setOverrideUrlInput('');
    } catch (err) {
      console.error('Override image failed:', err.message);
    }
  };

  // Remove displayed image
  const handleRemoveImage = async () => {
    if (!session) return;
    try {
      await api.removeImage(session._id);
      setCurrentImageUrl('');
      setCurrentKeyword('');
      setCurrentSource('');
    } catch (err) {
      console.error('Remove image failed:', err.message);
    }
  };

  // Generate DALL-E Image (Fallback)
  const handleGenerateDalle = async () => {
    if (!session || !currentKeyword) return;
    setDalleLoading(true);
    try {
      const res = await api.generateImage(session._id, currentKeyword);
      setCurrentImageUrl(res.data.imageUrl);
      setCurrentSource('DALL-E');
    } catch (err) {
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setDalleLoading(false);
    }
  };

  // Format timer values
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to highlight keywords in raw transcript
  const getHighlightedTranscript = () => {
    if (!transcript) return <span className="text-slate-400 dark:text-slate-500 italic">Listening speech transcript appears here...</span>;
    
    let words = transcript.split(' ');
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
      const isKeyword = sessionKeywords.some(sk => sk.keyword.toLowerCase().includes(cleanWord) && cleanWord.length > 2);
      
      if (isKeyword) {
        return (
          <span key={idx} className="bg-primary-500/20 text-primary-600 dark:bg-primary-500/30 dark:text-primary-300 font-semibold px-1 rounded transition-colors duration-300">
            {word}{' '}
          </span>
        );
      }
      return <span key={idx}>{word} </span>;
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Teacher Control Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure parameters, toggle microphone, and override classroom display visuals.</p>
        </div>

        {/* Live indicator badge */}
        {session?.isActive && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Session Live in {session.classroom}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Side: Setup & Transcription Panel */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Setup Panel */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Session Parameters</h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              {/* Classroom */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Classroom</span>
                <select
                  disabled={session?.isActive}
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                >
                  <option value="Classroom A">Classroom A</option>
                  <option value="Classroom B">Classroom B</option>
                  <option value="Classroom C">Classroom C</option>
                </select>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Subject</span>
                <select
                  disabled={session?.isActive}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                >
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Geography">Geography</option>
                  <option value="History">History</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Language */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Language</span>
                <select
                  disabled={session?.isActive}
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Speech Recognition Engine */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">STT Engine</span>
                <select
                  disabled={session?.isActive}
                  value={speechMode}
                  onChange={(e) => setSpeechMode(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                >
                  <option value="webspeech">Browser Speech (Free/Fast)</option>
                  <option value="whisper">OpenAI Whisper (Premium)</option>
                </select>
              </div>
            </div>

            {/* Start/Stop Session Actions */}
            <div className="flex gap-3 mt-2 border-t border-slate-100 dark:border-slate-850 pt-4">
              {!session?.isActive ? (
                <button
                  onClick={handleStartSession}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 shadow-sm glow-primary cursor-pointer transition-all"
                >
                  <Play size={14} /> Start Session
                </button>
              ) : (
                <button
                  onClick={handleStopSession}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Square size={14} /> Stop Session
                </button>
              )}
            </div>
          </GlassCard>

          {/* Transcript Panel */}
          <GlassCard className="flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Mic size={16} className={isListening ? 'text-primary-500 animate-pulse' : 'text-slate-400'} /> 
                Live Speech Transcript
              </h3>
              
              {/* Mic Toggles */}
              {session?.isActive && (
                <button
                  onClick={handleToggleListening}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-xl flex items-center gap-1 cursor-pointer transition-all ${
                    isListening 
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                      : 'bg-primary-500/10 text-primary-600 border border-primary-500/20 hover:bg-primary-500/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff size={12} /> Stop Mic
                    </>
                  ) : (
                    <>
                      <Mic size={12} /> Start Mic
                    </>
                  )}
                </button>
              )}
            </div>

            {speechError && (
              <div className="mb-4 p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                {speechError}
              </div>
            )}

            {/* Transcript scrollbox */}
            <div className="flex-1 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 text-xs leading-relaxed overflow-y-auto max-h-[220px]">
              {getHighlightedTranscript()}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Active Image Overview & Controls */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Active Image Preview */}
          <GlassCard className="flex flex-col gap-4 text-center">
            <h3 className="text-sm font-bold text-left border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <ImageIcon size={16} className="text-primary-500" /> Currently Displayed
            </h3>

            {/* Image Preview Block */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 flex items-center justify-center relative shadow-inner group">
              {currentImageUrl ? (
                <>
                  <img
                    src={currentImageUrl}
                    alt={currentKeyword}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                    <span className="text-[9px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded uppercase tracking-wider w-fit mb-1">
                      {currentSource}
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">{currentKeyword}</h4>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600">
                  <ImageIcon size={28} strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">No image displayed</span>
                </div>
              )}
            </div>

            {/* Image actions */}
            {session?.isActive && currentImageUrl && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {/* DALL-E Fallback Generation */}
                <button
                  onClick={handleGenerateDalle}
                  disabled={dalleLoading}
                  className="py-2 bg-gradient-to-r from-violet-500/10 to-primary-500/10 hover:from-violet-500/20 hover:to-primary-500/20 text-primary-600 dark:text-primary-400 font-semibold text-[10px] border border-primary-500/20 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  title="Generate custom AI illustration of this concept"
                >
                  {dalleLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles size={12} /> AI Generate (DALL-E)
                    </>
                  )}
                </button>

                {/* Remove displayed image */}
                <button
                  onClick={handleRemoveImage}
                  className="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl font-semibold text-[10px] border border-rose-500/20 flex items-center justify-center gap-1 cursor-pointer transition-all"
                  title="Clear display screen"
                >
                  <Trash2 size={12} /> Remove Display
                </button>
              </div>
            )}

            {/* Manual Image URL Override Form */}
            {session?.isActive && currentKeyword && (
              <form onSubmit={handleOverrideImage} className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Override Image URL</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/image.jpg"
                    value={overrideUrlInput}
                    onChange={(e) => setOverrideUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer shadow-sm glow-primary transition-all"
                  >
                    <Upload size={12} /> Apply
                  </button>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Quick Session Stats */}
          <GlassCard className="flex flex-col gap-3">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Session Telemetry</h3>
            
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1"><Timer size={13} /> Active Duration</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatTime(timer)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1"><Cpu size={13} /> Keywords Found</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{sessionKeywords.length}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1"><History size={13} /> Current Concept</span>
                <span className="font-bold text-primary-500 truncate max-w-[120px]" title={currentKeyword}>
                  {currentKeyword || 'None'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Detected Keywords Timeline (Bottom row) */}
      <GlassCard className="flex flex-col gap-4">
        <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-2">Detected Concepts Timeline</h3>
        {sessionKeywords.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-6">Keywords and visual thumbnails will populate here in real-time as you speak.</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {sessionKeywords.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentImageUrl(item.imageUrl);
                  setCurrentKeyword(item.keyword);
                  setCurrentSource(item.category || 'Historical');
                }}
                className="flex flex-col gap-2 p-2 rounded-2xl border border-slate-100 hover:border-primary-500/30 dark:border-slate-850 dark:hover:border-primary-500/25 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 cursor-pointer min-w-[130px] w-[130px] shrink-0 text-left transition-all"
              >
                <img
                  src={item.imageUrl}
                  alt={item.keyword}
                  className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-200/50 dark:border-slate-800"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold truncate text-slate-800 dark:text-slate-200" title={item.keyword}>
                    {item.keyword}
                  </span>
                  <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 truncate uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default TeacherDashboard;
