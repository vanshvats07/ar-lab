import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export function ReportModal({
  isOpen,
  onClose,
  reportData,
  graphDataUrl,
  score,
  studentName = 'Student',
  experimentName = "Ohm's Law Circuit"
}) {
  const [revealedViva, setRevealedViva] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !reportData) return null;

  const toggleViva = (index) => {
    setRevealedViva((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const exportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 15;
      let y = 18;

      // Header Banner
      doc.setFillColor(15, 23, 42); // dark slate #0f172a
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(56, 189, 248); // cyan
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('AR PHYSICS LAB — HACKHOUNDS', margin, y);

      y += 6;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Official Academic Virtual Laboratory Report`, margin, y);

      // Student metadata
      y = 38;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student: ${studentName}`, margin, y);
      doc.text(`Score: ${score}/100`, 160, y);

      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`Experiment: ${experimentName}`, margin, y);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, y);

      // Divider line
      y += 4;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(margin, y, 195, y);

      // 1. Aim
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('1. AIM', margin, y);

      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const aimLines = doc.splitTextToSize(reportData.aim || '', 180);
      doc.text(aimLines, margin, y);
      y += aimLines.length * 4.5;

      // 2. Apparatus
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. APPARATUS & SIMULATION SETUP', margin, y);

      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      (reportData.apparatus || []).forEach((item) => {
        doc.text(`• ${item}`, margin + 3, y);
        y += 4.5;
      });

      // 3. Graph Snapshot
      if (graphDataUrl) {
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('3. EXPERIMENTAL PLOT (CANVAS)', margin, y);
        y += 4;
        try {
          doc.addImage(graphDataUrl, 'PNG', margin, y, 120, 55);
          y += 60;
        } catch (imgErr) {
          console.warn('Could not embed graph image:', imgErr);
        }
      }

      // 4. Calculated Result & % Error
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('4. RESULT & ACCURACY', margin, y);

      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const resLines = doc.splitTextToSize(reportData.calculatedResult || '', 180);
      doc.text(resLines, margin, y);
      y += resLines.length * 4.5 + 2;

      // Conclusion
      const concLines = doc.splitTextToSize(reportData.conclusion || '', 180);
      doc.text(concLines, margin, y);
      y += concLines.length * 4.5 + 4;

      // 5. Viva Voce Questions
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('5. VIVA VOCE EXAMINATION QUESTIONS', margin, y);
      y += 6;

      (reportData.vivaQuestions || []).forEach((v, idx) => {
        if (y > 265) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(2, 132, 199);
        doc.text(`Q${idx + 1}: ${v.question}`, margin, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const ansLines = doc.splitTextToSize(`Ans: ${v.answer}`, 175);
        doc.text(ansLines, margin + 4, y);
        y += ansLines.length * 4 + 3;
      });

      // Save PDF
      doc.save(`${experimentName.toLowerCase().replace(/\s+/g, '_')}_lab_report.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Could not export PDF: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-white/20 text-slate-100 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Automated Lab Report
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  {score}/100 Score
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {experimentName} • AI Generated with Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg glass-pill transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Report Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Aim & Objective */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">
              1. Aim &amp; Objective
            </h4>
            <p className="p-3 rounded-xl bg-slate-900/60 border border-white/5 leading-relaxed text-slate-200">
              {reportData.aim}
            </p>
          </div>

          {/* Apparatus */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">
              2. Apparatus
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(reportData.apparatus || []).map((app, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{app}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experimental Graph Snapshot */}
          {graphDataUrl && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">
                3. Experimental Graph Snapshot
              </h4>
              <div className="rounded-xl overflow-hidden border border-white/10 max-w-sm mx-auto shadow-md">
                <img src={graphDataUrl} alt="Laboratory Graph" className="w-full" />
              </div>
            </div>
          )}

          {/* Result & Conclusion */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">
              4. Calculation &amp; Conclusion
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <p className="font-semibold text-emerald-300">{reportData.calculatedResult}</p>
              <p className="text-slate-300 leading-relaxed">{reportData.conclusion}</p>
            </div>
          </div>

          {/* 5 Viva Voce Questions with Revealable Answers */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> 5. Viva Voce Examination Questions
            </h4>
            <div className="space-y-2">
              {(reportData.vivaQuestions || []).map((v, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-900/70 border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleViva(i)}
                    className="w-full p-3 text-left font-semibold text-slate-200 flex items-center justify-between hover:bg-white/5"
                  >
                    <span>
                      Q{i + 1}: {v.question}
                    </span>
                    {revealedViva[i] ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {revealedViva[i] && (
                    <div className="px-3 pb-3 text-cyan-200/90 border-t border-white/5 bg-slate-950/40 text-[11px] leading-relaxed pt-2">
                      <strong className="text-cyan-400 font-mono">Answer: </strong>
                      {v.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Saved to Firestore &amp; Student Portfolio
          </div>

          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Lab Report (PDF)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
