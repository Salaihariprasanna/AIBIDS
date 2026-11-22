import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Grid, 
  Sliders, 
  HelpCircle,
  Hash,
  Type
} from 'lucide-react';

export const AutoEDAStudio = () => {
  const { selectedDataset } = useApp();
  const [edaData, setEdaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    if (!selectedDataset) return;
    const fetchEDA = async () => {
      try {
        setLoading(true);
        const res = await api.getAutoEDA(selectedDataset.id);
        setEdaData(res.data);
        if (res.data.columns.length > 0) {
          setSelectedColumn(res.data.columns[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEDA();
  }, [selectedDataset]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Computing automated statistical distributions & data health...</p>
      </div>
    );
  }

  const corrCols = Object.keys(edaData?.correlations || {});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Automated Exploratory Data Analysis</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Data Profiling & Quality Diagnostics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep statistical metrics, column nullability, and correlation matrix for <strong>{selectedDataset?.display_name}</strong>.
        </p>
      </div>

      {/* Health Score & Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Overall Data Quality Health</h2>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-4 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-emerald-400">{edaData?.health_score?.score}</span>
            <span className="text-slate-500 text-base">/ 100</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Completeness:</span>
              <strong className="text-slate-200">{edaData?.health_score?.completeness}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Uniqueness:</span>
              <strong className="text-slate-200">{edaData?.health_score?.uniqueness}%</strong>
            </div>
          </div>
        </div>

        {/* Issues Identified */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Diagnostics & Quality Alerts</h2>
          </div>
          <div className="space-y-2">
            {edaData?.health_score?.issues_found?.length ? (
              edaData.health_score.issues_found.map((issue, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-500/20 px-3 py-2 rounded-lg">
                  <span>•</span>
                  <span>{issue}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero structural issues found. Dataset is primed for analytics and ML modeling.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columns Statistical Profile Table */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Column Statistical Profiles ({edaData?.columns?.length})</h2>
          <span className="text-xs text-slate-400">Click column row for deep drill-down</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase">Column</th>
                <th className="px-4 py-3 font-semibold uppercase">Type</th>
                <th className="px-4 py-3 font-semibold uppercase">Missing %</th>
                <th className="px-4 py-3 font-semibold uppercase">Distinct</th>
                <th className="px-4 py-3 font-semibold uppercase">Mean / Frequency</th>
                <th className="px-4 py-3 font-semibold uppercase">Min</th>
                <th className="px-4 py-3 font-semibold uppercase">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {edaData?.columns?.map((col) => {
                const isSelected = selectedColumn?.name === col.name;
                return (
                  <tr
                    key={col.name}
                    onClick={() => setSelectedColumn(col)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-950/30' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-white flex items-center space-x-2">
                      {col.mean !== null ? <Hash className="w-3.5 h-3.5 text-brand-400" /> : <Type className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{col.name}</span>
                    </td>
                    <td className="px-4 py-3 code-font text-slate-400 text-[11px]">{col.dtype}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${col.null_percentage > 10 ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                        {col.null_percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{col.unique_count.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">
                      {col.mean !== null ? col.mean.toLocaleString() : (col.top_values?.[0]?.value || '—')}
                    </td>
                    <td className="px-4 py-3 font-mono">{col.min !== null ? String(col.min) : '—'}</td>
                    <td className="px-4 py-3 font-mono">{col.max !== null ? String(col.max) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Matrix Heatmap */}
      {corrCols.length > 1 && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Grid className="w-5 h-5 text-brand-400" />
            <div>
              <h2 className="text-base font-bold text-white">Pearson Correlation Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated correlation coefficients across numerical dimensions</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 p-4 bg-slate-950/60">
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-400">Metric</th>
                  {corrCols.map((c) => (
                    <th key={c} className="p-2 font-semibold text-slate-400 max-w-[100px] truncate" title={c}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {corrCols.map((r) => (
                  <tr key={r}>
                    <td className="p-2 text-left font-medium text-slate-300 max-w-[120px] truncate" title={r}>
                      {r}
                    </td>
                    {corrCols.map((c) => {
                      const val = edaData.correlations[r][c];
                      const isHigh = Math.abs(val) > 0.6 && r !== c;
                      return (
                        <td
                          key={c}
                          className="p-2 font-mono"
                          style={{
                            backgroundColor:
                              r === c
                                ? 'rgba(51, 65, 85, 0.4)'
                                : val > 0
                                ? `rgba(14, 165, 233, ${Math.abs(val) * 0.7})`
                                : `rgba(244, 63, 94, ${Math.abs(val) * 0.7})`
                          }}
                        >
                          <span className={isHigh ? 'text-white font-bold' : 'text-slate-300'}>
                            {val.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
