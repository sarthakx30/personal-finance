import React from 'react';
import { Receipt, SearchX } from 'lucide-react';
import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  isLoading,
  error,
  type
}) {
  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="space-y-2 flex-1 pr-4">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="flex gap-2">
                   <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-20"></div>
                   <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2 flex flex-col items-end">
                 <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                 <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
                    <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 mx-4">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
           {type === 'income' ? <Receipt className="w-8 h-8 text-emerald-300 dark:text-emerald-700" /> : <SearchX className="w-8 h-8 text-slate-300 dark:text-slate-600" />}
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
           No {type === 'income' ? 'income' : 'expenses'} found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs">
           {type === 'income' 
              ? 'Add your salary or other income sources to see them here.'
              : 'Add a transaction to start tracking your spending.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

