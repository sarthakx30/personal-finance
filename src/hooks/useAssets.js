import { useState, useEffect } from 'react';
import * as assetService from '../services/assetService';
import { useGoogleAuth } from './useGoogleAuth';

export const useAssets = () => {
  const { isSignedIn } = useGoogleAuth();
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const [aData, lData] = await Promise.all([
        assetService.getAssets(),
        assetService.getAllAssetLogs()
      ]);
      setAssets(aData);
      setLogs(lData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSignedIn]);

  const addAsset = async (asset) => {
    try {
      await assetService.addAsset(asset);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addLog = async (log) => {
    try {
      await assetService.addAssetLog(log);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAsset = async (id) => {
    try {
      await assetService.deleteAsset(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    assets,
    logs,
    loading,
    error,
    refresh: fetchData,
    addAsset,
    addLog,
    deleteAsset
  };
};
