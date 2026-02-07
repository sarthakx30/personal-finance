import React, { useState } from 'react';
import { Plus, Trash2, Tag, Info } from 'lucide-react';

export default function CategoryManager({ categories, onAdd, onDelete, isLoading }) {
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', bucket: 'Other' });

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

  const buckets = ['Need', 'Want', 'Save', 'Other'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Add Category Form */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Add New Category
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Name</label>
            <input
              type="text"
              placeholder="e.g. Groceries"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm cursor-pointer"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Bucket</label>
            <select
              value={newCategory.bucket}
              onChange={(e) => setNewCategory({ ...newCategory, bucket: e.target.value })}
              disabled={newCategory.type === 'income'}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-700 rounded-xl text-sm cursor-pointer disabled:opacity-50"
            >
              {buckets.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading || !newCategory.name.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-50 h-[42px]"
          >
            Add
          </button>
        </form>
      </section>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              Expense Categories
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {categories.expense.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">No expense categories added yet.</p>
            ) : (
              categories.expense.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 group">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">{cat.bucket}</p>
                  </div>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Income Categories */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              Income Categories
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {categories.income.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">No income categories added yet.</p>
            ) : (
              categories.income.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 group">
                  <p className="font-medium text-slate-900 dark:text-white">{cat.name}</p>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Categories are unique to your account. Changes here will immediately update your transaction forms.
        </p>
      </div>
    </div>
  );
}
