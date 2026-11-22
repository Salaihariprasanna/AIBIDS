import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Send, 
  Sparkles, 
  Code, 
  BarChart3, 
  Table as TableIcon, 
  Copy, 
  Check, 
  Bot, 
  User, 
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff
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

const CHART_COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6'];

export const AIChatBI = () => {
  const { selectedDataset, aiStatus } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 'initial',
      role: 'assistant',
      text: `Hello! I am your AI Business Intelligence Agent. Ask me anything about "${selectedDataset?.display_name || 'your data'}" in plain English, and I will write safe DuckDB SQL queries, execute them in real-time, and plot interactive charts!`,
      sql: null,
      chart: null,
      data: null,
      insights: [
        'Query aggregations, group-by rankings, and top performers',
        'Compare dimensions, calculate ratios and filter time series',
        'Built-in security AST guardrails guarantee safe, read-only analytics'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [copiedSqlId, setCopiedSqlId] = useState(null);
  const [expandedSqlIds, setExpandedSqlIds] = useState({});
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const sampleQuestions = [
    `Show top 5 ranked categories by total value`,
    `Calculate total volume grouped by primary segments`,
    `What is the average yield and count per category?`,
    `Show trend over time ordered chronologically`,
    `Identify bottom 5 performing entries`
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isQuerying]);

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || !selectedDataset || isQuerying) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsQuerying(true);

    try {
      const res = await api.executeQuery(selectedDataset.id, q);
      const data = res.data;

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.explanation || `Here is the analytical result for your query.`,
        sql: data.sql,
        chart: data.chart,
        data: data.data,
        insights: data.insights || [],
        executionTime: data.execution_time_ms,
        rowCount: data.row_count,
        error: data.error
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Failed to execute query: ${err.response?.data?.detail || err.message}`,
          error: true
        }
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const copySql = (id, sql) => {
    navigator.clipboard.writeText(sql);
    setCopiedSqlId(id);
    setTimeout(() => setCopiedSqlId(null), 2000);
  };

  const toggleSql = (id) => {
    setExpandedSqlIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderChart = (msg) => {
    if (!msg.data || msg.data.length === 0 || !msg.chart) return null;
    const chart = msg.chart;
    const data = msg.data;

    if (chart.chart_type === 'pie') {
      return (
        <div className="h-64 w-full my-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={chart.y_axis}
                nameKey={chart.x_axis}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chart.chart_type === 'line') {
      return (
        <div className="h-64 w-full my-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey={chart.x_axis} stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
              <Line type="monotone" dataKey={chart.y_axis} stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Default: Bar Chart
    return (
      <div className="h-64 w-full my-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey={chart.x_axis || Object.keys(data[0])[0]} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
            <Bar dataKey={chart.y_axis || Object.keys(data[0])[1]} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">AI Conversational BI & Text-to-SQL</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Querying <strong className="text-slate-200">{selectedDataset?.display_name}</strong> in natural language.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Engine:</span>
          <span className="text-brand-400 font-semibold uppercase">{aiStatus?.active_provider || 'Adaptive'}</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isUser ? 'bg-brand-600 text-white' : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                isUser 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'glass-card border-slate-800 text-slate-200'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>

                {/* Insights Bullets */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">
                      Key Highlights
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {msg.insights.map((ins, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-brand-400">•</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chart Rendering */}
                {!isUser && msg.chart && msg.chart.chart_type !== 'table' && renderChart(msg)}

                {/* Tabular Data View */}
                {!isUser && msg.data && msg.data.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-brand-400" />
                        <span>Query Output ({msg.rowCount} records in {msg.executionTime}ms)</span>
                      </div>
                      <button
                        onClick={() => {
                          const headers = Object.keys(msg.data[0]).join(',');
                          const rows = msg.data.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
                          const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement('a');
                          link.setAttribute('href', encodedUri);
                          link.setAttribute('download', `query_result_${Date.now()}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1"
                      >
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-48 bg-slate-950/60">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                          <tr>
                            {Object.keys(msg.data[0]).map((k) => (
                              <th key={k} className="px-3 py-2 font-medium">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {msg.data.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                  {val !== null && val !== undefined ? String(val) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SQL Inspector */}
                {!isUser && msg.sql && (
                  <div className="border border-slate-800/80 rounded-xl bg-slate-950/80 overflow-hidden">
                    <button
                      onClick={() => toggleSql(msg.id)}
                      className="w-full px-3 py-2 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between text-xs text-slate-400 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Code className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-mono">Generated DuckDB SQL</span>
                      </div>
                      {expandedSqlIds[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedSqlIds[msg.id] && (
                      <div className="p-3 space-y-2">
                        <pre className="code-font text-xs text-emerald-300 overflow-x-auto p-2 bg-slate-900 rounded-lg">
                          {msg.sql}
                        </pre>
                        <div className="flex justify-end">
                          <button
                            onClick={() => copySql(msg.id, msg.sql)}
                            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                          >
                            {copiedSqlId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSqlId === msg.id ? 'Copied' : 'Copy SQL'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isQuerying && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="glass-card rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></div>
              <span>Synthesizing SQL query & running analytics in DuckDB...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Suggested:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isQuerying}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? "Listening... Speak your data question..." : `Ask anything about ${selectedDataset?.display_name || 'your dataset'} (e.g. 'Show top 5 categories by profit')...`}
            disabled={isQuerying}
            className={`w-full bg-slate-900 border ${isListening ? 'border-brand-400 ring-2 ring-brand-400/30' : 'border-slate-700/80'} rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner pr-12`}
          />
          <button
            type="button"
            onClick={startVoiceInput}
            title={isListening ? "Listening..." : "Click to speak voice query"}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-slate-400 hover:text-brand-400 bg-slate-800/80'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={!inputQuery.trim() || isQuerying}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-brand-600/20 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Ask AI</span>
        </button>
      </form>
    </div>
  );
};
