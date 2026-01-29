import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/formatters';

export default function SummaryDashboard({ summary, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2">
        <span className="font-semibold">Error loading summary:</span> {error}
      </div>
    );
  }

  if (!summary) return null;

  const { totalIncome, totalExpenses, savings } = summary;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-600 transform rotate-12" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-emerald-900">Total Income</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {formatCurrencyINR(totalIncome)}
            </p>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">
              +100% of cash flow
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-24 h-24 text-red-600 transform -rotate-12" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-red-900">Total Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrencyINR(totalExpenses)}
            </p>
            <div className="mt-2 w-full bg-red-100 rounded-full h-1.5">
               <div 
                  className="bg-red-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min((totalExpenses / (totalIncome || 1)) * 100, 100)}%` }}
               ></div>
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-blue-900">Net Savings</h3>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrencyINR(savings)}
            </p>
            <p className="text-xs text-blue-600/80 mt-1 font-medium flex items-center gap-1">
               <PieChart className="w-3 h-3" />
               Savings Rate: {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
