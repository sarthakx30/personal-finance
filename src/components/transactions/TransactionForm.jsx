import React, { useState, useEffect } from 'react';
import { validateTransaction } from '../../utils/validators';
import { formatDateInput } from '../../utils/formatters';
import { Save, PlusCircle, MinusCircle, ArrowRightLeft, ChevronDown } from 'lucide-react';

export default function TransactionForm({ onSubmit, isLoading, initialData = null, availableCategories, availableAssets = [] }) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: getToday(),
    category_id: '',
    description: '',
    amount: '',
    type: 'expense', // 'expense' | 'income' | 'transfer'
    account_id: '', // Source
    destination_account_id: '', // Target
    is_transfer: false
  });

  const [errors, setErrors] = useState({});
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: formatDateInput(initialData.date),
        amount: initialData.amount,
        type: initialData.is_transfer ? 'transfer' : initialData.type,
        category_id: initialData.category_id || '',
        account_id: initialData.account_id || '',
        destination_account_id: initialData.destination_account_id || '',
        is_transfer: !!initialData.is_transfer
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    
    if (name === 'type') {
      updates.category_id = '';
      updates.account_id = '';
      updates.destination_account_id = '';
      updates.is_transfer = (value === 'transfer');
      // If switching from transfer to flow, set proper underlying type
      if (value !== 'transfer') {
         updates.type = value;
      }
    }

    setFormData(prev => ({ ...prev, ...updates }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Required';
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Invalid';
    
    if (formData.type !== 'transfer' && !formData.category_id) newErrors.category_id = 'Required';
    
    // Account validation based on type
    if (formData.type === 'expense' && !formData.account_id) newErrors.account_id = 'Select source';
    if (formData.type === 'income' && !formData.destination_account_id) newErrors.destination_account_id = 'Select target';
    if (formData.type === 'transfer') {
       if (!formData.account_id) newErrors.account_id = 'Select source';
       if (!formData.destination_account_id) newErrors.destination_account_id = 'Select target';
       if (formData.account_id === formData.destination_account_id) newErrors.destination_account_id = 'Must be different';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        type: formData.type === 'transfer' ? 'expense' : formData.type, // Map transfer back to flow type for DB check constraint if needed, or keep as is if check allows
      });
      
      if (!initialData) {
        setFormData({
          date: getToday(),
          category_id: '',
          description: '',
          amount: '',
          type: formData.type,
          account_id: '',
          destination_account_id: '',
          is_transfer: formData.is_transfer
        });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const currentCategories = formData.type === 'income' ? availableCategories.income : availableCategories.expense;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Transaction Type Toggle */}
      <div className="bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-2xl flex gap-1 shadow-inner">
        {[
          { id: 'expense', label: 'Expense', icon: MinusCircle, color: 'text-red-500' },
          { id: 'income', label: 'Income', icon: PlusCircle, color: 'text-emerald-500' },
          { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-500' },
        ].map(btn => (
          <button
            key={btn.id}
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all
              ${formData.type === btn.id 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md ring-1 ring-black/5' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            onClick={() => handleChange({ target: { name: 'type', value: btn.id } })}
          >
            <btn.icon className={`w-4 h-4 ${formData.type === btn.id ? btn.color : 'opacity-40'}`} />
            {btn.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Date & Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Amount</label>
            <div className="relative">
               <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">₹</span>
               <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
            </div>
          </div>
        </div>

        {/* Account Selection logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Source Account (Expense or Transfer) */}
           {(formData.type === 'expense' || formData.type === 'transfer') && (
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    {formData.type === 'transfer' ? 'From Account' : 'Paid From'}
                 </label>
                 <div className="relative">
                    <select name="account_id" value={formData.account_id} onChange={handleChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                       <option value="">Select account...</option>
                       {availableAssets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                 </div>
                 {errors.account_id && <p className="text-[10px] text-red-500 font-bold px-1">{errors.account_id}</p>}
              </div>
           )}

           {/* Target Account (Income or Transfer) */}
           {(formData.type === 'income' || formData.type === 'transfer') && (
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    {formData.type === 'transfer' ? 'To Account' : 'Received In'}
                 </label>
                 <div className="relative">
                    <select name="destination_account_id" value={formData.destination_account_id} onChange={handleChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                       <option value="">Select account...</option>
                       {availableAssets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                 </div>
                 {errors.destination_account_id && <p className="text-[10px] text-red-500 font-bold px-1">{errors.destination_account_id}</p>}
              </div>
           )}
        </div>

        {/* Category (Not required for transfers) */}
        {formData.type !== 'transfer' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
            <div className="relative">
               <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                 <option value="">Select category...</option>
                 {currentCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder={formData.type === 'transfer' ? 'e.g. Credit card payment' : 'What was this for?'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50">
        {isLoading ? 'Processing...' : (initialData ? 'Update Transaction' : 'Record Transaction')}
      </button>
    </form>
  );
}
