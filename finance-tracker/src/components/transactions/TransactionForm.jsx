import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../config/categories';
import { validateTransaction } from '../../utils/validators';
import { formatDateInput } from '../../utils/formatters';
import { Save, PlusCircle, MinusCircle } from 'lucide-react';

export default function TransactionForm({ onSubmit, isLoading, initialData = null }) {
  // Calculate today's date safely inside the component
  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: getToday(),
    category: '',
    description: '',
    amount: '',
    type: 'expense', // 'expense' or 'income'
  });

  const [errors, setErrors] = useState({});

  // Update form data when initialData changes (e.g. when editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure date is formatted for input (YYYY-MM-DD)
        date: formatDateInput(initialData.date),
        // Ensure amount is a string/number
        amount: initialData.amount,
        // Ensure type is set (default to expense if missing for some reason)
        type: initialData.type || 'expense',
      });
    } else {
      setFormData({
        date: getToday(),
        category: '',
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
    
    // Reset category if type changes because categories are different
    if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        category: '',
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Select categories based on type
    const categoriesList = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    // Validate
    const validation = validateTransaction(formData, categoriesList);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      
      if (!initialData) {
        setFormData({
          date: getToday(),
          category: '',
          description: '',
          amount: '',
          type: formData.type, // Keep the same type for next entry convenience
        });
      }
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const currentCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isExpense = formData.type === 'expense';

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Type Toggle Segmented Control */}
      <div className="bg-slate-100 p-1 rounded-xl flex">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isExpense
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
        >
          <MinusCircle className={`w-4 h-4 ${isExpense ? 'text-red-500' : 'text-slate-400'}`} />
          Expense
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            !isExpense
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
        >
          <PlusCircle className={`w-4 h-4 ${!isExpense ? 'text-emerald-500' : 'text-slate-400'}`} />
          Income
        </button>
      </div>

      <div className="space-y-4">
        {/* Date & Amount Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
                errors.date ? 'ring-2 ring-red-500/20 bg-red-50' : ''
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
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
               className={`w-full pl-7 pr-3 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
                  errors.amount ? 'ring-2 ring-red-500/20 bg-red-50' : ''
               }`}
               />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer ${
              errors.category ? 'ring-2 ring-red-500/20 bg-red-50' : ''
            }`}
          >
            <option value="">Select a category...</option>
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this for?"
            className={`w-full px-3 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${
              errors.description ? 'ring-2 ring-red-500/20 bg-red-50' : ''
            }`}
          />
        </div>
      </div>

      {/* Error Message */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
          {errors.submit || 'Please check the fields above.'}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
           isExpense ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
        }`}
      >
        {isLoading ? (
           'Saving...' 
        ) : (
           <>
              <Save className="w-4 h-4" />
              {initialData ? 'Update Transaction' : `Add ${isExpense ? 'Expense' : 'Income'}`}
           </>
        )}
      </button>
    </form>
  );
}
