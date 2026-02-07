import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { X, Save } from 'lucide-react';

export default function LoanEntryModal({ isOpen, onClose, onSave, baseBalance, initialData = null }) {
  const [formData, setFormData] = useState({
    paid: '',
    interest: '',
    balance: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          paid: initialData.paid,
          interest: initialData.interest,
          balance: initialData.balance,
        });
      } else {
        setFormData({ paid: '', interest: '', balance: '' });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate balance if paid/interest change
      // Use baseBalance (which is either the last entry's balance for ADD, or the previous row's balance for EDIT)
      if ((name === 'paid' || name === 'interest') && baseBalance !== undefined) {
        const paid = parseFloat(newData.paid) || 0;
        const interest = parseFloat(newData.interest) || 0;
        const newBalance = Math.max(0, baseBalance - paid + interest);
        newData.balance = newBalance.toFixed(2);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Allow 0 values, just check not empty string if required
    // Actually, allowing 0 paid/interest is valid.
    
    setIsSubmitting(true);
    try {
      await onSave({
        paid: parseFloat(formData.paid) || 0,
        interest: parseFloat(formData.interest) || 0,
        balance: parseFloat(formData.balance) || 0,
      });
      toast.success(initialData ? 'Entry updated successfully' : 'Loan entry added successfully');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-900 dark:text-white">
            {initialData ? 'Edit Repayment' : 'Add Repayment'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Paid Amount
            </label>
            <div className="relative">
               <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
               <input
                 type="number"
                 name="paid"
                 value={formData.paid}
                 onChange={handleChange}
                 placeholder="0.00"
                 className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
               />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Interest
            </label>
            <div className="relative">
               <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
               <input
                 type="number"
                 name="interest"
                 value={formData.interest}
                 onChange={handleChange}
                 placeholder="0.00"
                 className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
               />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              New Balance
            </label>
            <div className="relative">
               <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
               <input
                 type="number"
                 name="balance"
                 value={formData.balance}
                 onChange={handleChange}
                 placeholder="0.00"
                 className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
               />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
               Auto-calculated: Prev Balance - Paid + Interest
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-semibold transition-all duration-200 mt-2 disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : (
               <>
                  <Save className="w-4 h-4" />
                  Save Entry
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
