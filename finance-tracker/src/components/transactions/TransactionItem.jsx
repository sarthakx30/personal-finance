import { formatDate, formatCurrencyINR } from '../../utils/formatters';
import { Pencil, Trash2, Calendar, Tag } from 'lucide-react';

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  isLoading,
}) {
  const isIncome = transaction.type === 'income';
  
  return (
    <div className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-start justify-between mb-1">
           <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate pr-2" title={transaction.description}>
              {transaction.description || 'Untitled Transaction'}
           </h4>
           <span className={`font-semibold whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {isIncome ? '+' : ''}{formatCurrencyINR(transaction.amount)}
           </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
             <Calendar className="w-3.5 h-3.5 opacity-70" />
             <span>{formatDate(transaction.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
             <Tag className="w-3 h-3 opacity-70" />
             <span className="font-medium truncate max-w-[120px] text-slate-700 dark:text-slate-300">{transaction.category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(transaction)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this transaction?')) {
              onDelete(transaction.id);
            }
          }}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
