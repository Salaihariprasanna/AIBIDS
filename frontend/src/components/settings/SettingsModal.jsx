import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  X, 
  Sparkles, 
  Key, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const SettingsModal = () => {
  const { isSettingsOpen, setIsSettingsOpen, aiStatus, fetchAiStatus } = useApp();
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [provider, setProvider] = useState('auto');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateAISettings({
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        llm_provider: provider
      });
      await fetchAiStatus();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSettingsOpen(false);
      }, 1500);
    } catch (err) {
      alert("Failed to update settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-6 border-slate-700 bg-slate-900 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Engine Configuration</h2>
            <p className="text-xs text-slate-400">Configure LLM providers & API credentials</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Active LLM Mode
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="auto">Auto-Optimized (Auto-detect configured keys or smart fallback)</option>
              <option value="gemini">Google Gemini 2.5 Flash</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
              <option value="semantic-fallback">Offline Smart Semantic Rule Engine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-brand-400" />
              <span>Google Gemini API Key (Optional)</span>
            </label>
            <input
              type="password"
              placeholder={aiStatus?.gemini_configured ? "•••••••••••••••••••• (Configured)" : "AIzaSy..."}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Leave blank to use environment variable or built-in offline smart engine.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>OpenAI API Key (Optional)</span>
            </label>
            <input
              type="password"
              placeholder={aiStatus?.openai_configured ? "•••••••••••••••••••• (Configured)" : "sk-..."}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/20"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
