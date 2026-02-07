import React from 'react';
import { useState, useEffect } from 'react';
import { validateTransaction } from '../../utils/validators';
import { formatDateInput } from '../../utils/formatters';
import { Save, PlusCircle, MinusCircle } from 'lucide-react';

export default function TransactionForm({ onSubmit, isLoading, initialData = null, availableCategories }) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: getToday(),
    category_id: '',
    description: '',
    amount: '',
    type: 'expense',
  });

  const [errors, setErrors] = useState({});
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: formatDateInput(initialData.date),
        amount: initialData.amount,
        type: initialData.type || 'expense',
        category_id: initialData.category_id || '',
      });
    } else {
      setFormData({
        date: getToday(),
        category_id: '',
        description: '',
        amount: '',
        type: 'expense',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        category_id: '',
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation since we moved from string categories to ID objects
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Valid amount is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      
      if (!initialData) {
        setFormData({
          date: getToday(),
          category_id: '',
          description: '',
          amount: '',
          type: formData.type,
        });
      }
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const currentCategories = formData.type === 'income' ? availableCategories.income : availableCategories.expense;
  const isExpense = formData.type === 'expense';

  if (isLoading && !isLocalSubmitting) {
    return (
      <div className="p-6 space-y-5 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                 <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
              </div>
              <div className="space-y-2">
                 <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                 <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
           </div>
           <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
           </div>
        </div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-full mt-2"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isExpense
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
          onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
        >
          <MinusCircle className={`w-4 h-4 ${isExpense ? 'text-red-500 dark:text-red-400' : 'text-slate-400'}`} />
          Expense
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            !isExpense
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
          onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
        >
          <PlusCircle className={`w-4 h-4 ${!isExpense ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`} />
          Income
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
                errors.date ? 'ring-2 ring-red-500/20 bg-red-50 dark:bg-red-900/20' : ''
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative">
               <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
               <input
               type="number"
               name="amount"
               value={formData.amount}
               onChange={handleChange}
               placeholder="0.00"
               step="0.01"
               min="0"
               className={`w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
                  errors.amount ? 'ring-2 ring-red-500/20 bg-red-50 dark:bg-red-900/20' : ''
               }`}
               />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer ${
              errors.category_id ? 'ring-2 ring-red-500/20 bg-red-50 dark:bg-red-900/20' : ''
            }`}
          >
            <option value="">Select a category...</option>
            {currentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this for?"
            className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
              errors.description ? 'ring-2 ring-red-500/20 bg-red-50 dark:bg-red-900/20' : ''
            }`}
          />
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium border border-red-100 dark:border-red-900/30">
          {errors.submit || 'Please check the fields above.'}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
           isExpense ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {isLoading ? 'Saving...' : (
           <>
              <Save className="w-4 h-4" />
              {initialData ? 'Update Transaction' : `Add ${isExpense ? 'Expense' : 'Income'}`}
           </>
        )}
      </button>
    </form>
  );
}