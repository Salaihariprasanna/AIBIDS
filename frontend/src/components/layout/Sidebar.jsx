import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  BarChart3, 
  TrendingUp, 
  Sliders, 
  FileSpreadsheet, 
  FolderPlus,
  Calculator,
  Compass
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useApp();

  const navigation = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'chat', name: 'AI Data Chat (Text-to-SQL)', icon: MessageSquareCode, badge: 'AI' },
    { id: 'eda', name: 'AutoEDA & Quality Studio', icon: BarChart3 },
    { id: 'predictive', name: 'Forecasting & Anomalies', icon: TrendingUp },
    { id: 'simulator', name: 'What-If Scenario Studio', icon: Sliders, badge: 'DSS' },
    { id: 'semantic', name: 'Semantic Metrics Layer', icon: Calculator, badge: 'KPI' },
    { id: 'reports', name: 'Strategic Reports', icon: FileSpreadsheet },
    { id: 'datasets', name: 'Dataset Manager (Import)', icon: FolderPlus },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Decision Modules
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  item.badge === 'AI' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : item.badge === 'DSS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-brand-500/20 text-brand-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 text-xs text-slate-500 space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
          <Compass className="w-3.5 h-3.5 text-brand-400" />
          <span>Decision Support System</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Powered by In-Memory DuckDB OLAP & Intelligent LLM Reasoning.
        </p>
      </div>
    </aside>
  );
};
