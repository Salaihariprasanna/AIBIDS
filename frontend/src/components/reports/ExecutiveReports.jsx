import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertOctagon, 
  Compass, 
  Layers 
} from 'lucide-react';

export const ExecutiveReports = () => {
  const { selectedDataset } = useApp();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selectedDataset) return;
    try {
      setLoading(true);
      const res = await api.generateExecutiveReport(selectedDataset.id);
      setReport(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Strategic Synthesis Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Executive Intelligence Briefing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated LLM-synthesized narrative report for <strong>{selectedDataset?.display_name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-brand-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing...' : 'Generate New Briefing'}</span>
          </button>

          {report && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Generated Report View */}
      {report ? (
        <div className="glass-card rounded-2xl p-8 space-y-8 border-slate-800 bg-slate-900/60 print:bg-white print:text-black print:p-0">
          {/* Header Block */}
          <div className="border-b border-slate-800 pb-6">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
              CONFIDENTIAL • EXECUTIVE BRIEFING
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
              {report.title}
            </h2>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
              <span>Timestamp: {report.generated_at}</span>
              <span>•</span>
              <span>Dataset: {selectedDataset?.display_name}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Compass className="w-4 h-4 text-brand-400" />
              <span>1. Executive Summary & Overview</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {report.executive_summary}
            </p>
          </div>

          {/* Key Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. Core Analytical Takeaways</span>
            </h3>
            <ul className="space-y-2">
              {report.key_takeaways.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Identified Risks */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>3. Risk Matrix & Sensitivities</span>
            </h3>
            <ul className="space-y-2">
              {report.identified_risks.map((risk, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-amber-300/90 bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
                  <span>⚠️</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategic Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>4. Strategic Action Plan & Prescriptions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.strategic_recommendations.map((rec, idx) => (
                <div key={idx} className="glass-card rounded-xl p-4 border-brand-500/20 bg-brand-950/10 space-y-2">
                  <span className="text-xs font-bold text-brand-400">Step 0{idx + 1}</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-brand-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Generate Your First Strategic Briefing</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the button below to synthesize an automated executive briefing with high-level takeaways, risk assessments, and action plans.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold inline-flex items-center space-x-2 shadow-lg shadow-brand-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing...' : 'Synthesize Executive Briefing'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
