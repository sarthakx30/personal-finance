import { useEffect, useState } from 'react';
import {
  listMonthlySheets,
  getTransactions,
  getIncomeTransactions,
  getSummary,
  addTransaction,
  addIncomeTransaction,
  updateTransaction,
  updateIncomeTransaction,
  deleteTransaction,
  deleteIncomeTransaction,
} from '../services/googleSheetsService';

export const useGoogleSheets = (spreadsheetId) => {
  const [transactions, setTransactions] = useState([]); // Expenses
  const [incomeTransactions, setIncomeTransactions] = useState([]); // Income
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transactions and summary
  const fetchData = async () => {
    if (!spreadsheetId) return;

    try {
      setLoading(true);
      setError(null);

      const [transactionsData, incomeData, summaryData] = await Promise.all([
        getTransactions(spreadsheetId),
        getIncomeTransactions(spreadsheetId),
        getSummary(spreadsheetId),
      ]);

      // Sort by Date Descending (Latest first)
      // Dates are ISO strings (YYYY-MM-DD), so string comparison works
      transactionsData.sort((a, b) => b.date.localeCompare(a.date));
      incomeData.sort((a, b) => b.date.localeCompare(a.date));

      setTransactions(transactionsData);
      setIncomeTransactions(incomeData);
      setSummary(summaryData);

      // Extract unique income categories from transactions as fallback
      const transactionIncomeCats = [...new Set(incomeData.map(t => t.category).filter(Boolean))].sort();
      
      // Use Summary sheet categories if available, otherwise use transaction-based ones
      const finalIncomeCats = (summaryData?.incomeCategories?.length > 0) 
        ? summaryData.incomeCategories 
        : transactionIncomeCats;

      setCategories({
        expense: summaryData?.expenseCategories || [],
        income: finalIncomeCats,
      });

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when spreadsheetId changes
  useEffect(() => {
    fetchData();
  }, [spreadsheetId]);

  // Add transaction (Expense)
  const handleAddTransaction = async (transaction) => {
    try {
      setLoading(true);
      setError(null);
      await addTransaction(spreadsheetId, transaction);
      await fetchData(); // Refresh data after adding
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add Income Transaction
  const handleAddIncomeTransaction = async (transaction) => {
    try {
      setLoading(true);
      setError(null);
      await addIncomeTransaction(spreadsheetId, transaction);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add income transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update transaction (Expense)
  const handleUpdateTransaction = async (rowNumber, transaction) => {
    try {
      setLoading(true);
      setError(null);
      await updateTransaction(spreadsheetId, rowNumber, transaction);
      await fetchData(); // Refresh data after updating
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Income Transaction
  const handleUpdateIncomeTransaction = async (rowNumber, transaction) => {
    try {
      setLoading(true);
      setError(null);
      await updateIncomeTransaction(spreadsheetId, rowNumber, transaction);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update income transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction (Expense)
  const handleDeleteTransaction = async (rowNumber) => {
    try {
      setLoading(true);
      setError(null);
      await deleteTransaction(spreadsheetId, rowNumber);
      await fetchData(); // Refresh data after deleting
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete Income Transaction
  const handleDeleteIncomeTransaction = async (rowNumber) => {
    try {
      setLoading(true);
      setError(null);
      await deleteIncomeTransaction(spreadsheetId, rowNumber);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete income transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    incomeTransactions,
    summary,
    categories,
    loading,
    error,
    fetchData,
    handleAddTransaction,
    handleAddIncomeTransaction,
    handleUpdateTransaction,
    handleUpdateIncomeTransaction,
    handleDeleteTransaction,
    handleDeleteIncomeTransaction,
  };
};

// Hook to fetch list of sheets
export const useSheetsList = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const sheetsList = await listMonthlySheets();
      setSheets(sheetsList);
    } catch (err) {
      setError(err.message || 'Failed to fetch sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  return {
    sheets,
    loading,
    error,
    refetch: fetchSheets,
  };
};