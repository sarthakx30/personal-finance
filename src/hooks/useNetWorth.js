import { useEffect, useState } from 'react';
import { findNetWorthFile, getNetWorthData } from '../services/googleSheetsService';
import { useGoogleAuth } from './useGoogleAuth';

export const useNetWorth = () => {
  const { isSignedIn } = useGoogleAuth();
  const [data, setData] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSignedIn) {
      loadData();
    }
  }, [isSignedIn]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Find the file
      let id = fileId;
      if (!id) {
        const file = await findNetWorthFile();
        if (!file) {
          throw new Error('Net Worth Tracker file not found. Please create a Google Sheet named "Net Worth Tracker".');
        }
        id = file.id;
        setFileId(id);
      }

      // 2. Fetch Data
      const netWorthData = await getNetWorthData(id);
      setData(netWorthData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
};
