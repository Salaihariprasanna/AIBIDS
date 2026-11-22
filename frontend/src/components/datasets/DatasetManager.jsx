import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Upload, 
  Globe, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Eye,
  Table as TableIcon
} from 'lucide-react';

export const DatasetManager = () => {
  const { datasets, selectedDataset, setSelectedDataset, fetchDatasets, setActiveTab } = useApp();
  const [importMode, setImportMode] = useState('upload'); // upload, url, db, samples
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // URL Import State
  const [urlInput, setUrlInput] = useState('');
  const [urlName, setUrlName] = useState('');

  // DB Import State
  const [dbUrl, setDbUrl] = useState('sqlite:///./backend/data/sample.db');
  const [dbTable, setDbTable] = useState('transactions');
  const [dbCustomQuery, setDbCustomQuery] = useState('');

  // Preview state
  const [previewData, setPreviewData] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setStatusMessage({ type: 'info', text: `Uploading ${file.name}...` });
      const res = await api.uploadDataset(file);
      await fetchDatasets();
      setSelectedDataset(res.data);
      setStatusMessage({ type: 'success', text: `Successfully imported "${res.data.display_name}" (${res.data.row_count} rows)` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlImport = async (e) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      setIsUploading(true);
      setStatusMessage({ type: 'info', text: 'Fetching dataset from URL...' });
      const res = await api.importDatasetFromUrl(urlInput, urlName || undefined);
      await fetchDatasets();
      setSelectedDataset(res.data);
      setStatusMessage({ type: 'success', text: `Imported "${res.data.display_name}" successfully!` });
      setUrlInput('');
      setUrlName('');
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDbConnect = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      setStatusMessage({ type: 'info', text: 'Connecting to database...' });
      const res = await api.connectDatabase({
        connection_url: dbUrl,
        table_name: dbTable,
        custom_query: dbCustomQuery || null,
        name: dbTable
      });
      await fetchDatasets();
      setSelectedDataset(res.data);
      setStatusMessage({ type: 'success', text: `Successfully imported table "${res.data.display_name}"` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const loadPreview = async (dsId) => {
    try {
      setLoadingPreview(true);
      const res = await api.getDatasetPreview(dsId, 25);
      setPreviewData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (selectedDataset) {
      loadPreview(selectedDataset.id);
    }
  }, [selectedDataset]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dataset Hub & External Importer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ingest files, stream live data from remote URLs, or connect external SQL databases into DuckDB.
        </p>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : statusMessage.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            : 'bg-brand-950/40 border-brand-500/30 text-brand-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Import Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Import Form */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-6">
          {/* Method Tabs */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setImportMode('upload')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                importMode === 'upload' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setImportMode('url')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                importMode === 'url' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>URL</span>
            </button>
            <button
              onClick={() => setImportMode('db')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                importMode === 'db' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL DB</span>
            </button>
          </div>

          {/* Upload Box */}
          {importMode === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-900/40">
                <Upload className="w-8 h-8 text-brand-400 mb-2" />
                <span className="text-sm font-medium text-slate-200">Choose file or drag & drop</span>
                <span className="text-xs text-slate-500 mt-1">Supports CSV, Excel (.xlsx/.xls), JSON, Parquet</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json,.parquet"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* URL Form */}
          {importMode === 'url' && (
            <form onSubmit={handleUrlImport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Dataset Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Sales Report"
                  value={urlName}
                  onChange={(e) => setUrlName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Remote File URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/data.csv"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-brand-600/20"
              >
                {isUploading ? 'Importing...' : 'Fetch & Import Dataset'}
              </button>
            </form>
          )}

          {/* Database Form */}
          {importMode === 'db' && (
            <form onSubmit={handleDbConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Database Connection URI</label>
                <input
                  type="text"
                  required
                  placeholder="postgresql://user:pass@localhost:5432/dbname"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 code-font text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Table Name</label>
                <input
                  type="text"
                  required
                  placeholder="orders"
                  value={dbTable}
                  onChange={(e) => setDbTable(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Custom SQL Query (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="SELECT * FROM orders WHERE year = 2024"
                  value={dbCustomQuery}
                  onChange={(e) => setDbCustomQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 code-font text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-brand-600/20"
              >
                {isUploading ? 'Connecting...' : 'Connect & Ingest Table'}
              </button>
            </form>
          )}
        </div>

        {/* Right 2 Columns: Loaded Datasets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Loaded Datasets ({datasets.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((ds) => {
              const isSelected = selectedDataset?.id === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds)}
                  className={`glass-card rounded-xl p-5 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-brand-500/60 bg-brand-950/20 ring-1 ring-brand-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                        <h3 className="font-semibold text-slate-100 text-sm">{ds.display_name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Table: <span className="code-font text-slate-300">{ds.name}</span>
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase font-medium">
                      {ds.source_type}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>{ds.row_count.toLocaleString()} rows</span>
                    <span>{ds.column_count} columns</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDataset(ds);
                        setActiveTab('dashboard');
                      }}
                      className="flex items-center space-x-1 text-brand-400 hover:text-brand-300 font-medium"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dataset Preview Section */}
      {selectedDataset && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TableIcon className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-semibold text-white">
                Live Data Preview: {selectedDataset.display_name}
              </h2>
            </div>
            <span className="text-xs text-slate-400">Showing first 25 records</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 sticky top-0 text-slate-400 border-b border-slate-800">
                <tr>
                  {selectedDataset.columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap">
                      <div>{col}</div>
                      <div className="text-[10px] text-slate-500 font-normal lowercase">{selectedDataset.dtypes[col]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    {selectedDataset.columns.map((col) => (
                      <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600">NULL</span>}
                      </td>
                    ))}
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
