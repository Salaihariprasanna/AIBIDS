import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Sparkles, 
  Code, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  Hash
} from 'lucide-react';

export const SemanticLayer = () => {
  const { selectedDataset } = useApp();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formulaSql, setFormulaSql] = useState('');
  const [description, setDescription] = useState('');

  const fetchMetrics = async () => {
    if (!selectedDataset) return;
    try {
      setLoading(true);
      const res = await api.getDatasetMetrics(selectedDataset.id);
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedDataset]);

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!name || !formulaSql || !selectedDataset) return;

    try {
      await api.createCustomMetric({
        name: name.toLowerCase().replace(/\s+/g, '_'),
        display_name: displayName || name,
        dataset_id: selectedDataset.id,
        formula_sql: formulaSql,
        description: description || 'User-defined business metric formula.'
      });
      await fetchMetrics();
      setName('');
      setDisplayName('');
      setFormulaSql('');
      setDescription('');
      setIsAdding(false);
    } catch (err) {
      alert("Error adding metric: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (metricName) => {
    if (!confirm(`Delete custom metric "${metricName}"?`)) return;
    try {
      await api.deleteCustomMetric(selectedDataset.id, metricName);
      await fetchMetrics();
    } catch (err) {
      alert("Error deleting metric: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Business Semantic Layer & KPI Modeler</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Calculated Metrics & Formula Definitions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define calculated KPI formulas for <strong>{selectedDataset?.display_name}</strong> to empower AI Text-to-SQL reasoning.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-brand-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : 'Add Calculated KPI'}</span>
        </button>
      </div>

      {/* Add Metric Form */}
      {isAdding && (
        <div className="glass-card rounded-2xl p-6 border-brand-500/30 bg-slate-900/80 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Define New Calculated Metric</span>
          </div>

          <form onSubmit={handleAddMetric} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Internal Name / Variable</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. profit_margin_pct"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Display Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Profit Margin (%)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                DuckDB SQL Aggregation Formula
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2)"
                value={formulaSql}
                onChange={(e) => setFormulaSql(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono text-xs"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Use valid DuckDB aggregation functions like SUM(), AVG(), COUNT(), NULLIF().
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Business Definition & Context</label>
              <textarea
                rows={2}
                placeholder="Explain what this metric means to business executives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/20"
              >
                Save Metric Definition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metrics List Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Registered Semantic Metrics ({metrics.length})
        </h2>

        {metrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((m) => (
              <div key={m.name} className="glass-card rounded-2xl p-5 space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{m.display_name}</h3>
                      <span className="code-font text-slate-400 text-xs">{m.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(m.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                    title="Delete Metric"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-300 overflow-x-auto">
                  {m.formula_sql}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
            No calculated metrics defined for this dataset yet. Click "Add Calculated KPI" above to create one.
          </div>
        )}
      </div>
    </div>
  );
};
