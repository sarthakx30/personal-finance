import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAppConfig, saveAppConfig } from '../services/configService';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { BUCKET_CONFIG, EXPENSE_CATEGORIES } from '../config/categories';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const { isSignedIn } = useGoogleAuth();
  const [config, setConfig] = useState({
    buckets: BUCKET_CONFIG,
    categories: EXPENSE_CATEGORIES,
  });
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load config on sign in
  useEffect(() => {
    if (isSignedIn) {
      loadConfig();
    }
  }, [isSignedIn]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const { config: loadedConfig, fileId: loadedFileId } = await getAppConfig();
      // Merge with defaults to ensure structure validity if file is old
      // But for buckets, we want the file to be the source of truth if it exists
      setConfig(loadedConfig);
      setFileId(loadedFileId);
    } catch (err) {
      console.error('Failed to load config', err);
      setError('Failed to load configuration. Using defaults.');
      // Keep default state
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    // Optimistic update
    const oldConfig = config;
    setConfig(newConfig);
    
    try {
      await saveAppConfig(fileId, newConfig);
    } catch (err) {
      console.error('Failed to save config', err);
      setError('Failed to save changes.');
      setConfig(oldConfig); // Revert
      throw err;
    }
  };

  const updateBucketConfig = async (newBuckets) => {
      const newConfig = { ...config, buckets: newBuckets };
      await updateConfig(newConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, loading, error, updateBucketConfig, reloadConfig: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
