import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  Sparkles, 
  Settings as SettingsIcon, 
  RefreshCw,
  ChevronDown,
  Layers
} from 'lucide-react';

export const Navbar = () => {
  const { 
    datasets, 
    selectedDataset, 
    setSelectedDataset, 
    aiStatus, 
    fetchDatasets, 
    setIsSettingsOpen 
  } = useApp();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-white tracking-tight">AIBIDS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium border border-brand-500/20">
              v1.0 AI-BI & DSS
            </span>
          </div>
          <p className="text-xs text-slate-400">Smart Data Analytics & Decision Support System</p>
        </div>
      </div>

      {/* Dataset Selector & AI Status */}
      <div className="flex items-center space-x-4">
        {/* Active Dataset Dropdown */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 space-x-2.5">
          <Database className="w-4 h-4 text-brand-400" />
          <span className="text-xs text-slate-400">Active Dataset:</span>
          <select
            value={selectedDataset?.id || ''}
            onChange={(e) => {
              const ds = datasets.find(d => d.id === e.target.value);
              if (ds) setSelectedDataset(ds);
            }}
            className="bg-transparent text-sm font-medium text-slate-100 focus:outline-none cursor-pointer pr-2"
          >
            {datasets.map(ds => (
              <option key={ds.id} value={ds.id} className="bg-slate-900 text-slate-100">
                {ds.display_name} ({ds.row_count} rows)
              </option>
            ))}
          </select>
        </div>

        {/* AI Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <span className={`w-2 h-2 rounded-full ${aiStatus?.active_provider === 'gemini' ? 'bg-emerald-400 animate-pulse' : aiStatus?.active_provider === 'openai' ? 'bg-indigo-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-slate-300">
            AI Engine: <strong className="text-white capitalize">{aiStatus?.active_provider || 'Adaptive'}</strong>
          </span>
        </div>

        {/* Quick Refresh Button */}
        <button
          onClick={fetchDatasets}
          title="Refresh Datasets"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="AI & System Settings"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-colors text-xs font-medium"
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Config</span>
        </button>
      </div>
    </header>
  );
};
