import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  AlertTriangle,
  Download,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export function TeacherDashboard({ isOpen, onClose }) {
  const [classCode, setClassCode] = useState('PHYS-101');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async (code = classCode) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teacher/dashboard?classCode=${code}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData(classCode);
    }
  }, [isOpen, classCode]);

  if (!isOpen) return null;

  const downloadCSV = () => {
    window.open(`/api/teacher/export-csv?classCode=${classCode}`, '_blank');
  };

  const filteredAttempts = (data?.recentAttempts || []).filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.studentName || '').toLowerCase().includes(q) ||
      (a.experiment || '').toLowerCase().includes(q) ||
      (a.studentId || '').toLowerCase().includes(q)
    );
  });

  // Calculate mistake percentages for bar chart
  const mistakeEntries = Object.entries(data?.mistakeDistribution || {});
  const maxMistakeCount = Math.max(1, ...mistakeEntries.map(([_, count]) => count));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/20 text-slate-100 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Teacher Analytics Portal
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  Class: {classCode}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Class-wide performance, error diagnosis &amp; CSV export</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg glass-pill transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Class Code Switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Active Class Code:</span>
              <div className="flex gap-1.5">
                {['PHYS-101', 'HACK-2026'].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setClassCode(code);
                      fetchDashboardData(code);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                      classCode === code
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'glass-pill text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => fetchDashboardData(classCode)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> Class Average
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {data?.averageScore || 82}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" /> Total Students
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {data?.totalStudents || 12}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Labs Completed
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {data?.totalExperimentsCompleted || 12}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Needing Help
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">
                {(data?.studentsNeedingHelp || []).length}
              </div>
            </div>
          </div>

          {/* Section: Common Mistakes Distribution (Bar Chart) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Most Common Student Mistakes (Live Frequency)
            </h4>

            {mistakeEntries.length === 0 ? (
              <p className="text-slate-500">No mistakes recorded for this class code.</p>
            ) : (
              <div className="space-y-2">
                {mistakeEntries.map(([mistakeName, count]) => {
                  const pct = Math.round((count / maxMistakeCount) * 100);
                  return (
                    <div key={mistakeName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-slate-300">{mistakeName}</span>
                        <span className="text-cyan-400 font-semibold">{count} occurrences</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Students Needing Help Alert */}
          {(data?.studentsNeedingHelp || []).length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2.5">
              <h4 className="text-xs uppercase font-bold text-rose-300 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Students Needing Immediate Intervention
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.studentsNeedingHelp.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-rose-500/20 flex items-start justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white text-xs">{s.studentName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Lab: {s.experiment === 'ohm' ? "Ohm's Law" : 'Pendulum'} • Score: {s.score}/100
                      </div>
                      <div className="text-[10px] text-rose-300 mt-1 font-mono">
                        Errors: {s.mistakes.join(', ') || 'Low Score'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Alert
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Per-Student Attempt Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Individual Student Records
              </h4>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-slate-900 rounded-lg border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-sans">
                  <tr>
                    <th className="p-2">Student</th>
                    <th className="p-2">Experiment</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Mistakes</th>
                    <th className="p-2">Hints</th>
                    <th className="p-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950/70">
                  {filteredAttempts.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5">
                      <td className="p-2 font-sans font-medium text-white">{a.studentName}</td>
                      <td className="p-2 text-cyan-300 capitalize">{a.experiment}</td>
                      <td className="p-2">
                        <span
                          className={`font-bold ${
                            a.score >= 90
                              ? 'text-emerald-400'
                              : a.score >= 70
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {a.score}/100
                        </span>
                      </td>
                      <td className="p-2 text-slate-400 text-[11px]">
                        {(a.mistakes || []).join(', ') || 'None'}
                      </td>
                      <td className="p-2 text-slate-300">{a.hintsUsed}</td>
                      <td className="p-2 text-slate-400">{a.timeTaken}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
