import { useState, useEffect } from 'react';
import * as transactionService from '../services/transactionService';
import * as categoryService from '../services/categoryService';
import { useGoogleAuth } from './useGoogleAuth';

export const useTransactions = (filters = {}) => {
  const { isSignedIn } = useGoogleAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const [tData, cData] = await Promise.all([
        transactionService.getTransactions(filters.startDate, filters.endDate),
        categoryService.getCategories()
      ]);

      setTransactions(tData);
      
      const organizedCategories = cData.reduce((acc, cat) => {
        if (cat.type === 'expense') acc.expense.push(cat);
        else acc.income.push(cat);
        return acc;
      }, { expense: [], income: [] });

      setCategories(organizedCategories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSignedIn, filters.startDate, filters.endDate]);

  const addTransaction = async (data) => {
    try {
      await transactionService.addTransaction(data);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      await transactionService.updateTransaction(id, data);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    transactions,
    categories,
    loading,
    error,
    refresh: fetchData,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};