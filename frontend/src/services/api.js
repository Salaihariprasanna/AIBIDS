import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Datasets
  getDatasets: () => client.get('/datasets/'),
  
  uploadDataset: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importDatasetFromUrl: (url, name) => client.post('/datasets/import-url', { url, name }),

  connectDatabase: (data) => client.post('/datasets/connect-db', data),

  getDatasetPreview: (datasetId, limit = 50) => client.get(`/datasets/${datasetId}/preview?limit=${limit}`),

  // AutoEDA
  getAutoEDA: (datasetId) => client.get(`/analytics/eda/${datasetId}`),

  // Query / Text-to-SQL
  executeQuery: (datasetId, question) => client.post('/query/execute', {
    dataset_id: datasetId,
    question: question,
  }),

  // Predictive Analytics
  getForecast: (datasetId, dateColumn, metricColumn, horizonPeriods = 6, frequency = 'M') =>
    client.post('/predictive/forecast', {
      dataset_id: datasetId,
      date_column: dateColumn,
      metric_column: metricColumn,
      horizon_periods: horizonPeriods,
      frequency: frequency,
    }),

  getAnomalies: (datasetId, metricColumns, contamination = 0.05) =>
    client.post('/predictive/anomalies', {
      dataset_id: datasetId,
      metric_columns: metricColumns,
      contamination: contamination,
    }),

  // What-If Simulator
  runSimulation: (datasetId, targetMetric, driverAdjustments) =>
    client.post('/simulator/simulate', {
      dataset_id: datasetId,
      target_metric: targetMetric,
      driver_adjustments: driverAdjustments,
    }),

  // Executive Reports
  generateExecutiveReport: (datasetId, focusAreas = null) =>
    client.post('/reports/generate', {
      dataset_id: datasetId,
      focus_areas: focusAreas,
    }),

  // Semantic Layer Metrics
  getDatasetMetrics: (datasetId) => client.get(`/semantic/${datasetId}`),
  createCustomMetric: (metricData) => client.post('/semantic/', metricData),
  deleteCustomMetric: (datasetId, metricName) => client.delete(`/semantic/${datasetId}/${metricName}`),

  // Settings & Status
  getAISettings: () => client.get('/settings/status'),
  updateAISettings: (data) => client.post('/settings/update', data),
};
