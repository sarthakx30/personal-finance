import React from 'react';
import { formatDate, formatCurrencyINR } from '../../utils/formatters';
import { Pencil, Trash2, Calendar, Tag, ArrowRightLeft, CreditCard, Wallet } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  isLoading,
}) {
  const confirm = useConfirm();
  const isIncome = transaction.type === 'income';
  const isTransfer = !!transaction.is_transfer;
  
  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Delete Transaction?',
      message: 'Are you sure you want to remove this record? This will also revert any automatic balance updates associated with it.',
      type: 'danger'
    });

    if (isConfirmed) {
      onDelete(transaction.id);
    }
  };
  const categoryName = transaction.categories?.name || (isTransfer ? 'Transfer' : 'Uncategorized');
  
  return (
    <div className="group flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-start justify-between mb-2">
           <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2" title={transaction.description}>
                 {transaction.description || (isTransfer ? 'Account Transfer' : 'Untitled Transaction')}
              </h4>
              
              {/* Account flow details */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                 {isTransfer ? (
                    <div className="flex items-center gap-1">
                       <span className="text-slate-500 dark:text-slate-300">{transaction.source_account?.name}</span>
                       <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                       <span className="text-slate-500 dark:text-slate-300">{transaction.destination_account?.name}</span>
                    </div>
                 ) : isIncome ? (
                    <div className="flex items-center gap-1">
                       <Wallet className="w-3 h-3 text-emerald-500" />
                       <span>To {transaction.destination_account?.name || 'Wallet'}</span>
                    </div>
                 ) : (
                    <div className="flex items-center gap-1">
                       <CreditCard className="w-3 h-3 text-red-500" />
                       <span>From {transaction.source_account?.name || 'Wallet'}</span>
                    </div>
                 )}
              </div>
           </div>
           
           <span className={`font-black whitespace-nowrap text-lg tracking-tight ${isTransfer ? 'text-blue-600 dark:text-blue-400' : isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isTransfer ? '' : isIncome ? '+' : '-'}{formatCurrencyINR(transaction.amount)}
           </span>
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
             <Calendar className="w-3.5 h-3.5 opacity-50" />
             <span className="font-medium">{formatDate(transaction.date)}</span>
          </div>
          {!isTransfer && (
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                <Tag className="w-3 h-3 opacity-50" />
                <span>{categoryName}</span>
             </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
        <button
          onClick={() => onEdit(transaction)}
          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-xl transition-colors"
          title="Edit"
        >
          <Pencil className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
