import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Sliders, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Zap, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const ScenarioSimulator = () => {
  const { selectedDataset } = useApp();
  const [targetMetric, setTargetMetric] = useState('');
  const [drivers, setDrivers] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDataset) return;
    const numCols = selectedDataset.columns.filter(
      c => selectedDataset.dtypes[c]?.includes('int') || selectedDataset.dtypes[c]?.includes('float')
    );

    if (numCols.length > 0) {
      const target = numCols[0];
      setTargetMetric(target);

      // Initialize drivers with 0 adjustment
      const initialDrivers = {};
      numCols.slice(1, 4).forEach(c => {
        initialDrivers[c] = 0.0;
      });
      setDrivers(initialDrivers);
    }
  }, [selectedDataset]);

  const handleSliderChange = (driverName, valuePct) => {
    setDrivers(prev => ({
      ...prev,
      [driverName]: valuePct / 100.0
    }));
  };

  const runSimulation = async () => {
    if (!selectedDataset || !targetMetric) return;
    try {
      setLoading(true);
      const res = await api.runSimulation(selectedDataset.id, targetMetric, drivers);
      setSimulationResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetMetric && Object.keys(drivers).length > 0) {
      runSimulation();
    }
  }, [targetMetric, drivers]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Executive Decision Support System (DSS)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            "What-If" Scenario & Sensitivity Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adjust operational levers and calculate simulated impact on <strong>{targetMetric || 'target metrics'}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400">Target Metric:</label>
          <select
            value={targetMetric}
            onChange={(e) => setTargetMetric(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-brand-500"
          >
            {selectedDataset?.columns
              .filter(c => selectedDataset.dtypes[c]?.includes('int') || selectedDataset.dtypes[c]?.includes('float'))
              .map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Simulator Controls & KPI Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Box */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Adjust Driver Levers</h2>
            <button
              onClick={() => {
                const reset = {};
                Object.keys(drivers).forEach(k => reset[k] = 0.0);
                setDrivers(reset);
              }}
              className="text-xs text-slate-400 hover:text-brand-400 flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-5">
            {Object.keys(drivers).map((driverName) => {
              const currentVal = Math.round((drivers[driverName] || 0) * 100);
              return (
                <div key={driverName} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{driverName.replace('_', ' ')}:</span>
                    <span className={`font-mono font-bold ${currentVal > 0 ? 'text-emerald-400' : currentVal < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {currentVal > 0 ? `+${currentVal}` : currentVal}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    step={5}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(driverName, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-30%</span>
                    <span>Baseline (0%)</span>
                    <span>+30%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projected Outcome Summary */}
        <div className="lg:col-span-2 space-y-6">
          {simulationResult && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-5 space-y-1">
                  <span className="text-xs text-slate-400">Current Baseline</span>
                  <div className="text-2xl font-bold text-slate-200">
                    ${simulationResult.baseline_value.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">Historical average</span>
                </div>

                <div className="glass-card rounded-2xl p-5 space-y-1 border-brand-500/40 bg-brand-950/20">
                  <span className="text-xs text-brand-300 font-medium">Simulated Projected Value</span>
                  <div className="text-2xl font-bold text-white">
                    ${simulationResult.simulated_value.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-brand-400">With adjustments applied</span>
                </div>

                <div className="glass-card rounded-2xl p-5 space-y-1">
                  <span className="text-xs text-slate-400">Projected Variance</span>
                  <div className={`text-2xl font-bold flex items-center space-x-1 ${simulationResult.delta_value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulationResult.delta_value >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    <span>{simulationResult.delta_percentage > 0 ? `+${simulationResult.delta_percentage}` : simulationResult.delta_percentage}%</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    (${simulationResult.delta_value.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Prescription Narrative */}
              <div className="glass-card rounded-2xl p-6 border-emerald-500/30 bg-emerald-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Prescriptive AI Narrative</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {simulationResult.prescription_narrative}
                </p>
              </div>

              {/* Sensitivity Curve Chart */}
              {simulationResult.sensitivity_curve?.length > 0 && (
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Primary Driver Elasticity Sensitivity Curve</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulationResult.sensitivity_curve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="adjustment_pct" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="projected_metric" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Projected Value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
