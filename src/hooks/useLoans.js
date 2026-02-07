import { useEffect, useState } from 'react';
import { findNetWorthFile, getLoanData, addLoanEntry, updateLoanEntry } from '../services/googleSheetsService';
import { useGoogleAuth } from './useGoogleAuth';

export const useLoans = () => {
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
      // 1. Find the file (Reuse existing findNetWorthFile since it's the same sheet)
      let id = fileId;
      if (!id) {
        const file = await findNetWorthFile();
        if (!file) {
          throw new Error('Net Worth Tracker file not found.');
        }
        id = file.id;
        setFileId(id);
      }

      // 2. Fetch Data
      const loanData = await getLoanData(id);
      setData(loanData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (transaction) => {
    setLoading(true);
    try {
      if (!fileId) await loadData(); 
      await addLoanEntry(fileId, transaction);
      await loadData(); 
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (rowIndex, transaction) => {
    setLoading(true);
    try {
      if (!fileId) await loadData();
      await updateLoanEntry(fileId, rowIndex, transaction);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refresh: loadData,
    addEntry,
    updateEntry,
  };
};
