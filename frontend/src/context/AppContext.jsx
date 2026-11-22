import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDatasets();
      setDatasets(res.data);
      if (res.data.length > 0 && !selectedDataset) {
        setSelectedDataset(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const res = await api.getAISettings();
      setAiStatus(res.data);
    } catch (err) {
      console.error("Failed to load AI settings:", err);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchAiStatus();
  }, []);

  return (
    <AppContext.Provider
      value={{
        datasets,
        selectedDataset,
        setSelectedDataset,
        activeTab,
        setActiveTab,
        aiStatus,
        setAiStatus,
        fetchDatasets,
        fetchAiStatus,
        isLoading,
        isSettingsOpen,
        setIsSettingsOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
