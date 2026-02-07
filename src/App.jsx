import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import './App.css';
import TransactionForm from './components/transactions/TransactionForm';
import TransactionList from './components/transactions/TransactionList';
import SummaryDashboard from './components/dashboard/SummaryDashboard';
import AuthButton from './components/auth/AuthButton';
import AccountView from './components/auth/AccountView';
import NetWorthDashboard from './components/networth/NetWorthDashboard';
import Layout from './components/layout/Layout';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useTransactions } from './hooks/useTransactions';
import { useAssets } from './hooks/useAssets';
import CategoryManager from './components/settings/CategoryManager';
import * as categoryService from './services/categoryService';
import { ThemeProvider } from './context/ThemeContext';
import { ConfigProvider } from './context/ConfigContext';
import { ToastProvider } from './context/ToastContext';

import DashboardLayout from './components/dashboard/DashboardLayout';

function AppContent() {
  const { isSignedIn, loading: authLoading } = useGoogleAuth();
  
  // Global Date Filter State (Default: This Month)
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [dateFilter, setDateFilter] = useState({
    start: startOfMonth,
    end: endOfMonth
  });

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [transactionSubView, setTransactionSubView] = useState('history'); // 'overview' | 'add' | 'history'
  const [listViewType, setListViewType] = useState('expense'); 

  // Pass filters to hook
  const {
    transactions,
    categories,
    loading,
    error,
    refresh: refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({ startDate: dateFilter.start, endDate: dateFilter.end });

  const {
    assets,
    logs,
    loading: assetsLoading,
    addAsset,
    addLog,
    deleteAsset,
  } = useAssets();

  // Handle Date Change
  const handleDateChange = (start, end) => {
    setDateFilter({ start, end });
  };

  // Filter transactions based on type
  const filteredTransactions = transactions.filter(t => t.type === listViewType);

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
        setEditingTransaction(null);
        setCurrentView('transactions');
      } else {
        await addTransaction(formData);
        setCurrentView('transactions');
        setListViewType(formData.type || 'expense');
      }
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setCurrentView('add');
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleAddCategory = async (catData) => {
    await categoryService.addCategory(catData);
    await refreshTransactions(); // refresh hook data
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure? Transactions using this category will show as Uncategorized.')) {
      await categoryService.deleteCategory(id);
      await refreshTransactions();
    }
  };

  // Reset edit state when leaving add view
  useEffect(() => {
    if (currentView !== 'add') {
      setEditingTransaction(null);
    }
  }, [currentView]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-16 h-16 shadow-lg rounded-2xl" />
           <p className="font-medium text-slate-500 dark:text-slate-400">Loading Finance Tracker...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
     return (
       <Layout currentView={currentView} onViewChange={setCurrentView} isSignedIn={isSignedIn}>
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
                <div className="mx-auto mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300 w-20 h-20">
                   <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Finance Tracker Logo" className="w-full h-full shadow-lg rounded-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                   Finance Tracker
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                   Sign in to access your budget, track expenses, and manage your financial goals directly from Google Sheets.
                </p>
                <div className="flex justify-center">
                  <AuthButton />
                </div>
             </div>
          </div>
       </Layout>
     )
  }

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView} 
      isSignedIn={isSignedIn}
      subView={transactionSubView}
      onSubViewChange={setTransactionSubView}
      dateFilter={dateFilter}
      onDateChange={handleDateChange}
    >
        {currentView === 'dashboard' && (
           <DashboardLayout 
              transactions={transactions}
              loading={loading}
              error={error}
              dateFilter={dateFilter}
              onDateChange={handleDateChange}
              netWorthData={{ assets, logs }}
              onViewChange={setCurrentView}
           />
        )}

        {currentView === 'net-worth' && (
           <div className="animate-in fade-in duration-500">
              <NetWorthDashboard 
                assets={assets} 
                logs={logs} 
                onAddAsset={addAsset} 
                onAddLog={addLog} 
                onDeleteAsset={deleteAsset}
                isLoading={assetsLoading}
              />
           </div>
        )}

        {currentView === 'transactions' && (
           <div className="animate-in fade-in duration-500">
              {/* Desktop Layout: All-in-one */}
              <div className="hidden md:flex flex-col gap-8">
                 <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Period Summary</h2>
                    <SummaryDashboard transactions={transactions} loading={loading} error={error} />
                 </section>

                 <div className="grid grid-cols-12 gap-8 items-start">
                    <section className="col-span-5 space-y-4 sticky top-24">
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Entry</h2>
                       <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <TransactionForm
                             onSubmit={handleFormSubmit}
                             isLoading={loading}
                             initialData={editingTransaction}
                             availableCategories={categories}
                          />
                       </div>
                    </section>

                    <section className="col-span-7 space-y-4">
                       <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Activity History</h2>
                          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
                             <button
                                onClick={() => setListViewType('expense')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                   listViewType === 'expense' 
                                   ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                   : 'text-slate-500 dark:text-slate-400'
                                }`}
                             >
                                Expenses
                             </button>
                             <button
                                onClick={() => setListViewType('income')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                   listViewType === 'income' 
                                   ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                   : 'text-slate-500 dark:text-slate-400'
                                }`}
                             >
                                Income
                             </button>
                          </div>
                       </div>
                       <TransactionList
                          transactions={filteredTransactions}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isLoading={loading}
                          error={error}
                          type={listViewType}
                       />
                    </section>
                 </div>
              </div>

              {/* Mobile Layout: Tabbed */}
              <div className="md:hidden space-y-6">
                 {transactionSubView === 'overview' && (
                    <div className="space-y-6">
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white px-1">Period Summary</h2>
                       <SummaryDashboard transactions={transactions} loading={loading} error={error} />
                    </div>
                 )}

                 {transactionSubView === 'add' && (
                    <div className="max-w-3xl mx-auto">
                       <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                             <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingTransaction ? 'Edit Transaction' : 'New Entry'}
                             </h2>
                          </div>
                          <TransactionForm
                             onSubmit={handleFormSubmit}
                             isLoading={loading}
                             initialData={editingTransaction}
                             availableCategories={categories}
                          />
                       </div>
                    </div>
                 )}

                 {transactionSubView === 'history' && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity History</h2>
                          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
                             <button
                                onClick={() => setListViewType('expense')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                   listViewType === 'expense' 
                                   ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                   : 'text-slate-500 dark:text-slate-400'
                                }`}
                             >
                                Expenses
                             </button>
                             <button
                                onClick={() => setListViewType('income')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                   listViewType === 'income' 
                                   ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                   : 'text-slate-500 dark:text-slate-400'
                                }`}
                             >
                                Income
                             </button>
                          </div>
                       </div>

                       <TransactionList
                          transactions={filteredTransactions}
                          onEdit={(t) => {
                             handleEdit(t);
                             setTransactionSubView('add');
                          }}
                          onDelete={handleDelete}
                          isLoading={loading}
                          error={error}
                          type={listViewType}
                       />
                    </div>
                 )}
              </div>
           </div>
        )}

        {currentView === 'account' && (
           <AccountView />
        )}

        {currentView === 'settings' && (
           <CategoryManager 
              categories={categories} 
              onAdd={handleAddCategory} 
              onDelete={handleDeleteCategory}
              isLoading={loading}
           />
        )}
    </Layout>
  );
}

function App() {
   return (
      <ThemeProvider>
         <ToastProvider>
            <ConfigProvider>
               <AppContent />
            </ConfigProvider>
         </ToastProvider>
      </ThemeProvider>
   )
}

export default App;