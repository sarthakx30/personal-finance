import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/formatters';

export default function SummaryDashboard({ transactions, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30 flex items-center gap-2">
        <span className="font-semibold">Error loading summary:</span> {error}
      </div>
    );
  }

  // Calculate summary stats from transactions
  const summary = transactions.reduce((acc, t) => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      acc.totalIncome += amount;
    } else {
      acc.totalExpenses += amount;
    }
    return acc;
  }, { totalIncome: 0, totalExpenses: 0 });

  const netSavings = summary.totalIncome - summary.totalExpenses;
  const savingsRate = summary.totalIncome > 0 ? (netSavings / summary.totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden group">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-emerald-200 uppercase tracking-wide">Total Income</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-emerald-400">
              {formatCurrencyINR(summary.totalIncome)}
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden group">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-red-200 uppercase tracking-wide">Total Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-red-400">
              {formatCurrencyINR(summary.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden group">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-blue-200 uppercase tracking-wide">Net Savings</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-blue-400">
              {formatCurrencyINR(netSavings)}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400/70 mt-2 font-semibold">
              Savings Rate: {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}