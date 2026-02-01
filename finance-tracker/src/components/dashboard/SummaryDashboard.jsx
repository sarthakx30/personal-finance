import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/formatters';
import CategoryChart from './CategoryChart';

export default function SummaryDashboard({ summary, loading, error }) {
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

  if (!summary) return null;

  const { totalIncome, totalExpenses, categoryBreakdown, endBalance } = summary;
  
  const investmentAmount = categoryBreakdown['Investment'] || 0;
  const realSavings = investmentAmount + (endBalance || 0);
  const savingsRate = totalIncome > 0 ? (realSavings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-800 dark:bg-gradient-to-br dark:from-emerald-900/20 dark:to-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shadow-md dark:shadow-none hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-600 dark:text-emerald-500 transform rotate-12" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-transparent">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-emerald-200 uppercase tracking-wide">Total Income</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-emerald-400">
              {formatCurrencyINR(totalIncome)}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/70 mt-2 font-semibold bg-emerald-50 dark:bg-transparent px-2 py-1 rounded-md inline-block border border-emerald-100 dark:border-transparent">
              +100% of cash flow
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-800 dark:bg-gradient-to-br dark:from-red-900/20 dark:to-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-red-500/20 shadow-md dark:shadow-none hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-24 h-24 text-red-600 dark:text-red-500 transform -rotate-12" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 border border-red-100 dark:border-transparent">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-red-200 uppercase tracking-wide">Total Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-red-400">
              {formatCurrencyINR(totalExpenses)}
            </p>
            <div className="mt-3 w-full bg-slate-100 dark:bg-red-900/30 rounded-full h-1.5">
               <div 
                  className="bg-red-500 dark:bg-red-500/80 h-1.5 rounded-full" 
                  style={{ width: `${Math.min((totalExpenses / (totalIncome || 1)) * 100, 100)}%` }}
               ></div>
            </div>
          </div>
        </div>

        {/* Savings Card - Changed back to Blue */}
        <div className="bg-white dark:bg-slate-800 dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-md dark:shadow-none hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-24 h-24 text-blue-600 dark:text-blue-500" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-transparent">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-blue-200 uppercase tracking-wide">Net Savings</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-blue-400">
              {formatCurrencyINR(realSavings)}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-xs text-blue-700 dark:text-blue-400/70 font-semibold flex items-center gap-1 bg-blue-50 dark:bg-transparent px-2 py-1 rounded-md w-fit border border-blue-100 dark:border-transparent">
                 <PieChart className="w-3 h-3" />
                 Savings Rate: {savingsRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-1">
                Includes Investment ({formatCurrencyINR(investmentAmount)}) + Balance ({formatCurrencyINR(endBalance || 0)})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
         <CategoryChart categoryBreakdown={categoryBreakdown} totalIncome={totalIncome} />
      </div>
    </div>
  );
}
