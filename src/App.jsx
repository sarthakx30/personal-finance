import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import './App.css';
import SheetSelector from './components/sheets/SheetSelector';
import TransactionForm from './components/transactions/TransactionForm';
import TransactionList from './components/transactions/TransactionList';
import SummaryDashboard from './components/dashboard/SummaryDashboard';
import AuthButton from './components/auth/AuthButton';
import AccountView from './components/auth/AccountView';
import Layout from './components/layout/Layout';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import { ThemeProvider } from './context/ThemeContext';
import { ConfigProvider } from './context/ConfigContext';
import { ToastProvider } from './context/ToastContext';

function AppContent() {
  const { isSignedIn, loading: authLoading } = useGoogleAuth();
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'transactions' | 'add'
  const [listViewType, setListViewType] = useState('expense'); // 'expense' | 'income'

  const {
    transactions, // Expenses
    incomeTransactions, // Income
    summary,
    categories,
    loading,
    error,
    handleAddTransaction,
    handleAddIncomeTransaction,
    handleUpdateTransaction,
    handleUpdateIncomeTransaction,
    handleDeleteTransaction,
    handleDeleteIncomeTransaction,
  } = useGoogleSheets(selectedSheetId);

  const handleSelectSheet = (sheet) => {
    setSelectedSheetId(sheet.id);
    setEditingTransaction(null);
    setListViewType('expense');
  };

  const handleFormSubmit = async (formData) => {
    // Determine type from formData or editingTransaction
    const type = formData.type || (editingTransaction ? editingTransaction.type : 'expense');
    
    if (editingTransaction) {
      if (type === 'income') {
        await handleUpdateIncomeTransaction(editingTransaction.id, formData);
      } else {
        await handleUpdateTransaction(editingTransaction.id, formData);
      }
      setEditingTransaction(null);
      setCurrentView('transactions'); // Go back to list after edit
    } else {
      if (type === 'income') {
        await handleAddIncomeTransaction(formData);
      } else {
        await handleAddTransaction(formData);
      }
      // Optional: Don't switch view immediately to allow multiple adds, 
      // or switch to transactions to show feedback. 
      // User preference varies. Let's stay on add for "Quick Add" feel or go to dashboard?
      // Let's stay on form but maybe show a success toast (not implemented yet).
      // For now, let's redirect to transactions to see the entry.
      setCurrentView('transactions');
      setListViewType(type); // Ensure we see what we added
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setCurrentView('add'); // Reuse add view for editing
  };

  const handleDelete = async (id) => {
    if (listViewType === 'income') {
      await handleDeleteIncomeTransaction(id);
    } else {
      await handleDeleteTransaction(id);
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

  // Not signed in state handled by Layout or just a landing page wrapper?
  // The Layout handles nav visibility based on isSignedIn.
  // But we want a landing page if not signed in.
  
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
    <Layout currentView={currentView} onViewChange={setCurrentView} isSignedIn={isSignedIn}>
        {/* Global Sheet Selector - Hide on account page */}
        {currentView !== 'account' && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
             <section className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-200 dark:border-slate-700">
                <div className="mb-2">
                   <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Budget Period</h2>
                </div>
                <SheetSelector onSelectSheet={handleSelectSheet} selectedSheetId={selectedSheetId} />
             </section>
          </div>
        )}

        {currentView === 'dashboard' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              {selectedSheetId ? (
                 <SummaryDashboard summary={summary} loading={loading} error={error} />
              ) : (
                 <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">Select a sheet to view your dashboard</p>
                 </div>
              )}
           </div>
        )}

        {currentView === 'transactions' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              {/* View Type Toggles */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <button
                    onClick={() => setListViewType('expense')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                       listViewType === 'expense' 
                       ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                 >
                    Expenses
                 </button>
                 <button
                    onClick={() => setListViewType('income')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                       listViewType === 'income' 
                       ? 'bg-white dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                 >
                    Income
                 </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[50vh]">
                 <TransactionList
                    transactions={listViewType === 'income' ? incomeTransactions : transactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                    error={error}
                    type={listViewType}
                 />
              </div>
           </div>
        )}

        {currentView === 'add' && (
           <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                       {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                       {editingTransaction ? 'Update the details below' : 'Record a new expense or income'}
                    </p>
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

        {currentView === 'account' && (
           <AccountView />
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