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
  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl border border-red-100 mx-4">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
           {type === 'income' ? <Receipt className="w-8 h-8 text-emerald-300" /> : <SearchX className="w-8 h-8 text-slate-300" />}
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">
           No {type === 'income' ? 'income' : 'expenses'} found
        </h3>
        <p className="text-slate-500 max-w-xs">
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
        <div className="divide-y divide-slate-100">
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
