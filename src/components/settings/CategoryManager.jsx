import React, { useState } from 'react';
import { Plus, Trash2, Tag, Info, RefreshCcw, ChevronDown, Trash, Pencil, Check, X } from 'lucide-react';
import { bulkAddCategories, deleteAllCategories, updateCategory } from '../../services/categoryService';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

export default function CategoryManager({ categories, onAdd, onDelete, isLoading, onRefresh }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', bucket: 'Other' });
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Renaming state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sub-navigation for expenses
  const [activeBucket, setActiveBucket] = useState('Need');

  const buckets = ['Need', 'Want', 'Save', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    
    try {
      await onAdd(newCategory);
      setNewCategory({ name: '', type: 'expense', bucket: 'Other' });
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const handleEditStart = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleEditSave = async (id) => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await updateCategory(id, { name: editName.trim() });
      toast.success('Category renamed.');
      setEditingId(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to rename category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    const isConfirmed = await confirm({
      title: 'Clear All Categories?',
      message: 'This will permanently remove all your custom categories. Existing transactions will show as Uncategorized. This cannot be undone.',
      type: 'danger'
    });

    if (!isConfirmed) return;

    setIsClearing(true);
    try {
      await deleteAllCategories();
      toast.success('All categories cleared.');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear categories.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleSeedDefaults = async () => {
    console.log('Starting category seeding...');
    const isConfirmed = await confirm({
      title: 'Load Defaults?',
      message: 'This will add standard categories (Rent, Food, Salary, etc.) to your list. Continue?',
      type: 'warning'
    });

    if (!isConfirmed) {
      console.log('Seeding cancelled by user');
      return;
    }
    
    setIsSeeding(true);
    const defaults = [
      { name: 'Salary', type: 'income', bucket: null },
      { name: 'Freelance', type: 'income', bucket: null },
      { name: 'Rent/Mortgage', type: 'expense', bucket: 'Need' },
      { name: 'Groceries', type: 'expense', bucket: 'Need' },
      { name: 'Utilities', type: 'expense', bucket: 'Need' },
      { name: 'Transport', type: 'expense', bucket: 'Need' },
      { name: 'Dining Out', type: 'expense', bucket: 'Want' },
      { name: 'Entertainment', type: 'expense', bucket: 'Want' },
      { name: 'Shopping', type: 'expense', bucket: 'Want' },
      { name: 'Health & Fitness', type: 'expense', bucket: 'Need' },
      { name: 'Investments', type: 'expense', bucket: 'Save' },
      { name: 'Emergency Fund', type: 'expense', bucket: 'Save' },
    ];

    try {
      const data = await bulkAddCategories(defaults);
      toast.success('Default categories added successfully!');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Seeding failed:', err);
      toast.error('Failed to add default categories.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Group expense categories by bucket
  const expenseByBucket = buckets.reduce((acc, bucket) => {
    acc[bucket] = categories.expense.filter(cat => cat.bucket === bucket);
    return acc;
  }, {});

  const renderCategoryItem = (cat) => (
    <div key={cat.id} className="flex items-center justify-between p-4 group transition-all hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <div className="flex-1 mr-4">
        {editingId === cat.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-blue-500 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave(cat.id);
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
            <button 
              onClick={() => handleEditSave(cat.id)}
              disabled={isSaving || !editName.trim()}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={handleEditCancel}
              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{cat.name}</p>
            {cat.type === 'expense' && (
               <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">{cat.bucket}</p>
            )}
          </div>
        )}
      </div>
      {editingId !== cat.id && (
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
          <button
            onClick={() => handleEditStart(cat)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(cat.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Actions */}
      <div className="flex justify-end gap-3 px-1">
         <button
            onClick={handleClearAll}
            disabled={isClearing || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl transition-all disabled:opacity-50 active:scale-95"
         >
            <Trash className={`w-4 h-4 ${isClearing ? 'animate-pulse' : ''}`} />
            Clear All
         </button>
         <button
            onClick={handleSeedDefaults}
            disabled={isSeeding || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-xl transition-all disabled:opacity-50 active:scale-95"
         >
            <RefreshCcw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
            Load Defaults
         </button>
      </div>

      {/* Add Category Form */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Plus className="w-5 h-5" />
          </div>
          Add New Category
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Groceries"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Type</label>
            <div className="relative">
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white cursor-pointer outline-none font-medium appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Bucket</label>
            <div className="relative">
              <select
                value={newCategory.bucket}
                onChange={(e) => setNewCategory({ ...newCategory, bucket: e.target.value })}
                disabled={newCategory.type === 'income'}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 outline-none font-medium appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              >
                {buckets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !newCategory.name.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 h-[42px] active:scale-95"
          >
            Add Category
          </button>
        </form>
      </section>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expense Categories (Takes 2 cols on wide screens) */}
        <div className="lg:col-span-2 space-y-4">
           <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
               <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Tag className="w-4 h-4 text-red-500" />
                 Expense Categories
               </h3>
               <span className="text-[10px] font-black uppercase bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                  {categories.expense.length} Total
               </span>
             </div>

             {/* Bucket Tabs */}
             <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 flex gap-1 overflow-x-auto no-scrollbar">
                {buckets.map(bucket => {
                   const count = expenseByBucket[bucket].length;
                   return (
                      <button
                         key={bucket}
                         onClick={() => setActiveBucket(bucket)}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                            ${activeBucket === bucket 
                               ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5' 
                               : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                         {bucket}
                         <span className={`px-1.5 py-0.5 rounded-md text-[10px] 
                            ${activeBucket === bucket ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {count}
                         </span>
                      </button>
                   )
                })}
             </div>

             <div className="divide-y divide-slate-100 dark:divide-slate-700/50 min-h-[300px]">
               {expenseByBucket[activeBucket].length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <p className="text-slate-400 text-sm font-medium italic">No categories in "{activeBucket}" yet.</p>
                 </div>
               ) : (
                 expenseByBucket[activeBucket].map(renderCategoryItem)
               )}
             </div>
           </section>
        </div>

        {/* Income Categories */}
        <div className="space-y-4">
           <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
               <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Tag className="w-4 h-4 text-emerald-500" />
                 Income
               </h3>
               <span className="text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  {categories.income.length}
               </span>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
               {categories.income.length === 0 ? (
                 <p className="p-10 text-center text-slate-400 text-sm font-medium italic">No income categories.</p>
               ) : (
                 categories.income.map(renderCategoryItem)
               )}
             </div>
           </section>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
           <Info className="w-5 h-5" />
        </div>
        <div>
           <p className="text-sm font-bold text-blue-900 dark:text-blue-200">About Categories</p>
           <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed mt-1">
             Categories help organize your spending and income. Changes here will immediately update your transaction forms.
             Deleting a category will not delete its transactions, but they will show up as "Uncategorized".
           </p>
        </div>
      </div>
    </div>
  );
}
