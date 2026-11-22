import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare,
  Sliders,
  ShieldCheck,
  Zap,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const ExecutiveDashboard = () => {
  const { selectedDataset, setActiveTab } = useApp();
  const [edaData, setEdaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    if (!selectedDataset) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [edaRes, prevRes] = await Promise.all([
          api.getAutoEDA(selectedDataset.id),
          api.getDatasetPreview(selectedDataset.id, 50)
        ]);
        setEdaData(edaRes.data);
        setPreviewRows(prevRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDataset]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading live executive telemetry for {selectedDataset?.display_name}...</p>
      </div>
    );
  }

  // Derive charts & aggregations
  const numColumns = edaData?.columns.filter(c => c.mean !== null) || [];
  const primaryMetric = numColumns[0] || { name: 'Volume', mean: 0, max: 0 };
  const secondaryMetric = numColumns[1] || numColumns[0] || { name: 'Yield', mean: 0 };
  const catColumns = edaData?.columns.filter(c => c.mean === null && c.top_values?.length > 0) || [];
  const primaryCategory = catColumns[0] || null;

  // Chart data 1: Category Breakdown
  const categoryChartData = primaryCategory?.top_values?.map(tv => ({
    name: tv.value,
    count: tv.count,
  })) || [];

  // Chart data 2: Preview Trend
  const trendData = previewRows.slice(0, 15).map((r, i) => ({
    index: `#${i + 1}`,
    val1: r[primaryMetric.name] || 0,
    val2: secondaryMetric ? r[secondaryMetric.name] || 0 : 0
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>Live Executive Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            {selectedDataset?.display_name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Table Source: <span className="code-font text-slate-300">{selectedDataset?.name}</span> • In-Memory OLAP Powered
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat With Data</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Scenario</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Dataset Rows</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {edaData?.total_rows.toLocaleString()}
          </div>
          <div className="flex items-center text-[11px] text-emerald-400 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{edaData?.total_columns} Dimensions & Features</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Data Health Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {edaData?.health_score?.score || 95}/100
          </div>
          <div className="text-[11px] text-slate-400">
            {edaData?.health_score?.completeness}% Completeness
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg {primaryMetric.name.replace('_', ' ').slice(0, 14)}</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {primaryMetric.mean ? `$${primaryMetric.mean.toLocaleString()}` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400">
            Max: ${primaryMetric.max?.toLocaleString() || 0}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Memory Ingestion</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {edaData?.memory_usage_kb} KB
          </div>
          <div className="text-[11px] text-brand-400">
            DuckDB Zero-Copy In-Memory
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Metric Progression & Trend ({primaryMetric.name.replace('_', ' ').toUpperCase()})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Sample time-ordered distribution across sequential rows</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
              Sample Batch (N=15)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="val1" name={primaryMetric.name} stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                {secondaryMetric && secondaryMetric.name !== primaryMetric.name && (
                  <Line type="monotone" dataKey="val2" name={secondaryMetric.name} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Category Distribution ({primaryCategory?.name?.replace('_', ' ').toUpperCase() || 'DIMENSIONS'})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top frequency clusters</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Executive Insights & Recommendations */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border-brand-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-brand-950/20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">AI Automated Findings & Health Diagnostics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Observed Data Patterns</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {edaData?.health_score?.issues_found?.length ? (
                edaData.health_score.issues_found.map((issue, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center space-x-2 text-emerald-400">
                  <span>✓ No critical missing value or duplicate anomalies detected.</span>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recommended Next Actions</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {edaData?.health_score?.recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-brand-400 mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
