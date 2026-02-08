import React, { useState } from 'react';
import { Receipt, SearchX, Search } from 'lucide-react';
import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  isLoading,
  error,
  type
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const desc = t.description?.toLowerCase() || '';
    const cat = t.categories?.name?.toLowerCase() || '';
    const account = t.source_account?.name?.toLowerCase() || '';
    const destAccount = t.destination_account?.name?.toLowerCase() || '';
    return desc.includes(term) || cat.includes(term) || account.includes(term) || destAccount.includes(term);
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-700">
              <div className="space-y-2 flex-1 pr-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-24"></div>
              </div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-full mb-4">
           {type === 'income' ? <Receipt className="w-8 h-8 text-emerald-400" /> : <SearchX className="w-8 h-8 text-slate-400" />}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
           No {type === 'income' ? 'income' : 'expenses'} found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
           {type === 'income' 
              ? 'Add your salary or other income sources to see them here.'
              : 'Add a transaction to start tracking your spending.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {filteredTransactions.length === 0 ? (
           <div className="p-8 text-center text-slate-500 text-sm">
              No matches found for "{searchTerm}"
           </div>
        ) : (
           filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}