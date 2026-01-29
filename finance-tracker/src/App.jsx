import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import './App.css';
import AuthButton from './components/auth/AuthButton';
import SheetSelector from './components/sheets/SheetSelector';
import TransactionForm from './components/transactions/TransactionForm';
import TransactionList from './components/transactions/TransactionList';
import SummaryDashboard from './components/dashboard/SummaryDashboard';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useGoogleSheets } from './hooks/useGoogleSheets';

function App() {
  const { isSignedIn, loading: authLoading } = useGoogleAuth();
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewType, setViewType] = useState('expense'); // 'expense' | 'income'

  const {
    transactions, // Expenses
    incomeTransactions, // Income
    summary,
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
    setViewType('expense'); // Reset view to expenses on sheet change
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
    } else {
      if (type === 'income') {
        await handleAddIncomeTransaction(formData);
        setViewType('income'); // Switch view to show the new item
      } else {
        await handleAddTransaction(formData);
        setViewType('expense'); // Switch view to show the new item
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    // Switch view to match the transaction type being edited
    if (transaction.type) {
      setViewType(transaction.type);
    }
  };

  const handleDelete = async (id) => {
    // We need to know the type to delete correctly. 
    // TransactionList usually passes the ID.
    // But since we have two lists, the delete action depends on the current view or the item source.
    // Let's assume the viewType dictates the delete action if the ID comes from the current list.
    if (viewType === 'income') {
      await handleDeleteIncomeTransaction(id);
    } else {
      await handleDeleteTransaction(id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 animate-pulse">
           <LayoutDashboard className="w-6 h-6" />
           <p className="font-medium">Loading Finance Tracker...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full border border-white/50">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2 tracking-tight">Finance Tracker</h1>
          <p className="text-slate-500 text-center mb-8 text-lg">
            Master your personal finances with the power of Google Sheets.
          </p>
          <div className="flex justify-center">
            <AuthButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Finance Tracker</h1>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sheet Selector */}
        <section className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <div className="p-4 sm:p-6">
             <div className="flex items-center justify-between mb-4">
                <div>
                   <h2 className="text-lg font-semibold text-slate-800">Budget Period</h2>
                   <p className="text-sm text-slate-500">Select a monthly sheet to view and manage</p>
                </div>
             </div>
             <SheetSelector onSelectSheet={handleSelectSheet} selectedSheetId={selectedSheetId} />
          </div>
        </section>

        {selectedSheetId ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Dashboard & Form (Sticky on Desktop) */}
            <div className="lg:col-span-12 space-y-8">
               <SummaryDashboard summary={summary} loading={loading} error={error} />
            </div>
            
             {/* Transaction Form & List Split */}
            <div className="lg:col-span-5 space-y-6">
                 <div className="sticky top-24">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                     <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                        <h2 className="text-lg font-semibold text-slate-800">
                           {editingTransaction ? 'Edit Transaction' : 'Quick Add'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                           {editingTransaction ? 'Update the details below' : 'Record a new expense or income'}
                        </p>
                     </div>
                     <TransactionForm
                        onSubmit={handleFormSubmit}
                        isLoading={loading}
                        initialData={editingTransaction}
                     />
                     {editingTransaction && (
                        <div className="px-6 pb-6">
                           <button
                           onClick={() => setEditingTransaction(null)}
                           className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm font-medium"
                           >
                           Cancel Edit
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column: Transaction List */}
            <div className="lg:col-span-7 space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                     <div>
                        <h2 className="text-lg font-semibold text-slate-800">Transactions</h2>
                        <p className="text-sm text-slate-500">History for this month</p>
                     </div>
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                           onClick={() => setViewType('expense')}
                           className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                              viewType === 'expense' 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                           }`}
                        >
                           Expenses
                        </button>
                        <button
                           onClick={() => setViewType('income')}
                           className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                              viewType === 'income' 
                              ? 'bg-white text-emerald-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                           }`}
                        >
                           Income
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex-1">
                     <TransactionList
                        transactions={viewType === 'income' ? incomeTransactions : transactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={loading}
                        error={error}
                        type={viewType}
                     />
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <div className="max-w-xs mx-auto text-slate-400 mb-4">
                <LayoutDashboard className="w-16 h-16 mx-auto opacity-20" />
             </div>
             <p className="text-slate-500 font-medium">Please select a month above to start tracking</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;