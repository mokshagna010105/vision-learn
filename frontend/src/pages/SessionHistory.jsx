import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  Globe, 
  Download, 
  FileSpreadsheet, 
  Clock, 
  User, 
  MapPin, 
  ExternalLink,
  ChevronDown,
  X 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const SessionHistory = () => {
  const { user } = useAuth();

  // Filter state
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('');
  const [date, setDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch History
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (subject) params.subject = subject;
      if (language) params.language = language;
      if (date) params.date = date;
      
      // If user is a teacher, only show their sessions. Admins see all.
      if (user && user.role === 'teacher') {
        params.teacherId = user._id;
      }

      const res = await api.getHistory(params);
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to load session history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [subject, language, date]);

  // Handle Search filtering
  const filteredSessions = sessions.filter(sess => {
    const teacherName = sess.teacherId?.name || '';
    const classroom = sess.classroom || '';
    const keywordsStr = sess.keywords?.map(k => k.keyword).join(' ') || '';
    const match = 
      teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      keywordsStr.toLowerCase().includes(searchTerm.toLowerCase());
    return match;
  });

  // Export to CSV Function
  const exportToCSV = () => {
    if (filteredSessions.length === 0) return;
    
    // Define headers
    const headers = ['Date', 'Teacher', 'Classroom', 'Subject', 'Language', 'Duration (Sec)', 'Keywords Extracted'];
    
    // Map rows
    const rows = filteredSessions.map(sess => [
      new Date(sess.startTime).toLocaleString(),
      sess.teacherId?.name || 'Unknown',
      sess.classroom,
      sess.subject,
      sess.language,
      sess.duration || 0,
      sess.keywords?.map(k => k.keyword).join('; ') || ''
    ]);

    // Construct CSV content
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visionlearn_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger PDF print format helper
  const handlePrintPDF = (sessionObj) => {
    const printWindow = window.open('', '_blank');
    const keywordsList = sessionObj.keywords?.map(k => `<li><strong>${k.keyword}</strong> (${k.category})</li>`).join('') || 'None';
    const transcriptsList = sessionObj.transcripts?.map(t => `<p class="transcript-line">[${new Date(t.timestamp).toLocaleTimeString()}] ${t.text}</p>`).join('') || 'No transcript saved';
    const imagesList = sessionObj.images?.map(img => `
      <div class="img-card">
        <img src="${img.imageUrl}" alt="${img.keyword}" />
        <p><strong>${img.keyword}</strong> (${img.source})</p>
      </div>
    `).join('') || 'No images saved';

    printWindow.document.write(`
      <html>
        <head>
          <title>VisionLearn Session Report - ${sessionObj._id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 30px; }
            h1 { color: #2563eb; margin: 0; font-size: 24px; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .meta-item { font-size: 13px; }
            .meta-item strong { color: #475569; }
            h2 { color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; }
            ul { padding-left: 20px; font-size: 13px; }
            .transcript-line { font-size: 12px; background: #fafafa; padding: 8px; border-radius: 4px; margin: 4px 0; border-left: 3px solid #cbd5e1; }
            .images-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; }
            .img-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center; font-size: 10px; background: #fff; }
            .img-card img { width: 100%; aspect-ratio: 4/3; object-cover: cover; border-radius: 4px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VisionLearn Smart Class Report</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Generated on ${new Date().toLocaleString()}</p>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><strong>Session ID:</strong> ${sessionObj._id}</div>
            <div class="meta-item"><strong>Date:</strong> ${new Date(sessionObj.startTime).toLocaleDateString()}</div>
            <div class="meta-item"><strong>Teacher:</strong> ${sessionObj.teacherId?.name || 'Jane Doe'}</div>
            <div class="meta-item"><strong>Classroom:</strong> ${sessionObj.classroom}</div>
            <div class="meta-item"><strong>Subject:</strong> ${sessionObj.subject}</div>
            <div class="meta-item"><strong>Language:</strong> ${sessionObj.language}</div>
            <div class="meta-item"><strong>Duration:</strong> ${Math.floor(sessionObj.duration / 60)}m ${sessionObj.duration % 60}s</div>
          </div>
          
          <h2>Extracted Concepts</h2>
          <ul>${keywordsList}</ul>

          <h2>Displayed Visuals</h2>
          <div class="images-grid">${imagesList}</div>

          <h2>Full Speech Transcript</h2>
          <div>${transcriptsList}</div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Session History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Search transcripts, view extracted visual timelines, and export class reports.</p>
        </div>

        {/* Global Export actions */}
        <button
          onClick={exportToCSV}
          disabled={filteredSessions.length === 0}
          className="px-4 py-2 text-xs font-semibold bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl shadow-sm glow-primary flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <FileSpreadsheet size={14} /> Export CSV
        </button>
      </div>

      {/* Filters & Search Row */}
      <GlassCard className="grid md:grid-cols-4 gap-4" hover={false}>
        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Search Details</span>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search teacher, class, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Subject</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
          >
            <option value="">All Subjects</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Geography">Geography</option>
            <option value="History">History</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Class Date</span>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
              <Calendar size={14} />
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
            />
          </div>
        </div>
      </GlassCard>

      {/* History Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <GlassCard className="py-16 text-center text-slate-400 dark:text-slate-500" hover={false}>
          No past teaching sessions found matching these criteria.
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredSessions.map((sess) => (
            <GlassCard
              key={sess._id}
              onClick={() => setSelectedSession(sess)}
              className="flex flex-col justify-between h-[210px] text-left border border-white/40 dark:border-slate-850"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-primary-500/10 text-primary-700 dark:text-primary-400 rounded-md uppercase tracking-wider">
                    {sess.subject}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    {new Date(sess.startTime).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-1 uppercase tracking-wide">
                  {sess.classroom}
                </h3>

                <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  <div className="flex items-center gap-1"><User size={12} /> Teacher: {sess.teacherId?.name || 'Jane Doe'}</div>
                  <div className="flex items-center gap-1"><Clock size={12} /> Duration: {formatDuration(sess.duration)}</div>
                  <div className="flex items-center gap-1"><Globe size={12} /> Language: {sess.language}</div>
                </div>
              </div>

              {/* Keywords thumbnail timeline preview */}
              <div className="border-t border-slate-100 dark:border-slate-850/80 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>{sess.keywords?.length || 0} Concepts Found</span>
                <span className="text-primary-500 hover:underline flex items-center gap-0.5">
                  View Report <ExternalLink size={10} />
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal Detail Overlay */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-3xl max-h-[85vh] overflow-y-auto flex flex-col gap-6 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" hover={false}>
            {/* Close */}
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-accent-500/10 text-accent-700 dark:text-accent-400 rounded-md uppercase tracking-wider">
                  {selectedSession.subject}
                </span>
                <h2 className="text-lg font-bold mt-1.5 uppercase tracking-wide">{selectedSession.classroom} Session Details</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Report generated for {new Date(selectedSession.startTime).toLocaleString()}</p>
              </div>

              <button
                onClick={() => handlePrintPDF(selectedSession)}
                className="w-fit px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm glow-primary transition-all cursor-pointer mr-8"
              >
                <Download size={13} /> Save PDF
              </button>
            </div>



            
            {/* Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-left text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Teacher</span>
                <span className="font-semibold">{selectedSession.teacherId?.name || 'Jane Doe'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Duration</span>
                <span className="font-semibold">{formatDuration(selectedSession.duration)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Language</span>
                <span className="font-semibold">{selectedSession.language}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Words</span>
                <span className="font-semibold">
                  {selectedSession.transcripts?.reduce((acc, curr) => acc + curr.text.split(' ').length, 0) || 0} words
                </span>
              </div>
            </div>

            {/* Keyword Timeline */}
            <div className="text-left flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Visual Aids Log</h4>
              {selectedSession.images?.length === 0 ? (
                <div className="text-slate-500 text-xs py-2 italic">No images saved.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedSession.images?.map((img, i) => (
                    <div key={i} className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                      <img src={img.imageUrl} alt={img.keyword} className="w-full aspect-[4/3] object-cover rounded-lg border border-slate-200/50 dark:border-slate-800" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold truncate text-slate-800 dark:text-slate-200">{img.keyword}</span>
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">Source: {img.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Full Transcript */}
            <div className="text-left flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Speech Transcript Log</h4>
              <div className="max-h-[160px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs leading-relaxed flex flex-col gap-2">
                {selectedSession.transcripts?.length === 0 ? (
                  <span className="text-slate-500 italic">No transcript recorded.</span>
                ) : (
                  selectedSession.transcripts?.map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">
                        [{new Date(t.timestamp).toLocaleTimeString()}]
                      </span>
                      <p className="text-slate-700 dark:text-slate-350">{t.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
