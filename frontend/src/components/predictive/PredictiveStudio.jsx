import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Sliders,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart,
  BarChart,
  Bar
} from 'recharts';

export const PredictiveStudio = () => {
  const { selectedDataset } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('forecast'); // forecast or anomaly
  
  // Forecast State
  const [dateCol, setDateCol] = useState('');
  const [metricCol, setMetricCol] = useState('');
  const [horizon, setHorizon] = useState(6);
  const [forecastResult, setForecastResult] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Anomaly State
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [loadingAnomaly, setLoadingAnomaly] = useState(false);
  const [contamination, setContamination] = useState(0.05);

  useEffect(() => {
    if (!selectedDataset) return;
    const cols = selectedDataset.columns;
    const dCols = cols.filter(c => anyDate(c));
    const nCols = cols.filter(c => selectedDataset.dtypes[c]?.includes('int') || selectedDataset.dtypes[c]?.includes('float'));

    setDateCol(dCols[0] || cols[0]);
    setMetricCol(nCols[0] || cols[1] || cols[0]);
  }, [selectedDataset]);

  const anyDate = (name) => {
    const l = name.toLowerCase();
    return l.includes('date') || l.includes('month') || l.includes('period') || l.includes('time') || l.includes('year');
  };

  const handleRunForecast = async () => {
    if (!selectedDataset || !dateCol || !metricCol) return;
    try {
      setLoadingForecast(true);
      const res = await api.getForecast(selectedDataset.id, dateCol, metricCol, horizon, 'M');
      setForecastResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleRunAnomaly = async () => {
    if (!selectedDataset) return;
    const numCols = selectedDataset.columns.filter(
      c => selectedDataset.dtypes[c]?.includes('int') || selectedDataset.dtypes[c]?.includes('float')
    );
    try {
      setLoadingAnomaly(true);
      const res = await api.getAnomalies(selectedDataset.id, numCols, contamination);
      setAnomalyResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoadingAnomaly(false);
    }
  };

  // Combine historical and forecast for charting
  const combinedChartData = [];
  if (forecastResult) {
    forecastResult.historical.forEach(h => {
      combinedChartData.push({
        date: h.date,
        actual: h.actual,
        forecast: null,
        lower: null,
        upper: null
      });
    });
    // Add bridge point
    if (forecastResult.historical.length > 0 && forecastResult.forecast.length > 0) {
      const lastHist = forecastResult.historical[forecastResult.historical.length - 1];
      combinedChartData[combinedChartData.length - 1].forecast = lastHist.actual;
    }
    forecastResult.forecast.forEach(f => {
      combinedChartData.push({
        date: f.date,
        actual: null,
        forecast: f.forecast,
        lower: f.lower_bound,
        upper: f.upper_bound
      });
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>Predictive AI Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Forecasting & Outlier Anomaly Detection
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Predict future trajectory with confidence bounds or isolate statistical anomalies in <strong>{selectedDataset?.display_name}</strong>.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('forecast')}
          className={`px-5 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors ${
            activeSubTab === 'forecast' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Time-Series Forecasting</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('anomaly');
            if (!anomalyResult) handleRunAnomaly();
          }}
          className={`px-5 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors ${
            activeSubTab === 'anomaly' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Isolation Forest Anomalies</span>
        </button>
      </div>

      {/* Forecasting Section */}
      {activeSubTab === 'forecast' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-card rounded-2xl p-6 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">Time Dimension</label>
              <select
                value={dateCol}
                onChange={(e) => setDateCol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {selectedDataset?.columns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Metric to Predict</label>
              <select
                value={metricCol}
                onChange={(e) => setMetricCol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {selectedDataset?.columns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <label className="block text-xs font-medium text-slate-400 mb-1">Horizon Periods</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value={3}>3 Periods</option>
                <option value={6}>6 Periods</option>
                <option value={12}>12 Periods</option>
                <option value={24}>24 Periods</option>
              </select>
            </div>

            <button
              onClick={handleRunForecast}
              disabled={loadingForecast}
              className="mt-5 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-brand-600/20"
            >
              {loadingForecast ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loadingForecast ? 'Computing...' : 'Generate Forecast'}</span>
            </button>
          </div>

          {/* Results Display */}
          {forecastResult && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="glass-card rounded-2xl p-6 border-brand-500/30 bg-gradient-to-r from-brand-950/20 to-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-brand-400 uppercase tracking-wide">
                    Extrapolated Trend Synthesis
                  </div>
                  <p className="text-sm font-medium text-slate-100 mt-1">
                    {forecastResult.trend_summary}
                  </p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Projected Delta</div>
                    <div className={`text-xl font-bold flex items-center justify-end space-x-1 ${forecastResult.growth_rate_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {forecastResult.growth_rate_pct >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      <span>{forecastResult.growth_rate_pct > 0 ? `+${forecastResult.growth_rate_pct}` : forecastResult.growth_rate_pct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">
                    Historical Actuals vs {horizon}-Period AI Forecast
                  </h2>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="flex items-center space-x-1.5 text-brand-400">
                      <span className="w-3 h-0.5 bg-brand-400"></span>
                      <span>Historical</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-purple-400">
                      <span className="w-3 h-0.5 bg-purple-400 border-dashed"></span>
                      <span>Predicted Forecast</span>
                    </span>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} name="Actual" />
                      <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name="Forecast" />
                      <Line type="monotone" dataKey="upper" stroke="#6366f1" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Upper 95% Bound" />
                      <Line type="monotone" dataKey="lower" stroke="#6366f1" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Lower 95% Bound" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Anomalies Section */}
      {activeSubTab === 'anomaly' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between glass-card rounded-2xl p-6">
            <div>
              <h2 className="text-base font-bold text-white">Multivariate Isolation Forest Detector</h2>
              <p className="text-xs text-slate-400 mt-1">Identifies outlier multi-feature spikes across transactions</p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs text-slate-400">Contamination %:</label>
              <select
                value={contamination}
                onChange={(e) => setContamination(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              >
                <option value={0.01}>1% Outliers</option>
                <option value={0.05}>5% Outliers</option>
                <option value={0.10}>10% Outliers</option>
              </select>
              <button
                onClick={handleRunAnomaly}
                disabled={loadingAnomaly}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
              >
                {loadingAnomaly ? 'Detecting...' : 'Re-run Detection'}
              </button>
            </div>
          </div>

          {anomalyResult && (
            <div className="space-y-6">
              {/* Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase">Detection Summary</h3>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {anomalyResult.summary_findings.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-xl p-5 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase">Feature Variance Breakdown</h3>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {Object.entries(anomalyResult.feature_importance).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center">
                        <span className="text-slate-400">{k}:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${v * 100}%` }}></div>
                          </div>
                          <span className="font-mono text-[11px]">{(v * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anomalous Records Table */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Flagged Anomalous Records</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-64">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">Anomaly Score</th>
                        {Object.keys(anomalyResult.anomalies[0] || {})
                          .filter(k => k !== 'is_anomaly' && k !== 'anomaly_score')
                          .map(k => (
                            <th key={k} className="px-3 py-2 font-medium">{k}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {anomalyResult.anomalies.map((row, idx) => (
                        <tr key={idx} className="hover:bg-rose-950/20">
                          <td className="px-3 py-2 font-mono text-rose-400 font-bold">
                            {row.anomaly_score?.toFixed(3)}
                          </td>
                          {Object.entries(row)
                            .filter(([k]) => k !== 'is_anomaly' && k !== 'anomaly_score')
                            .map(([_, val], cIdx) => (
                              <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                                {String(val)}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
