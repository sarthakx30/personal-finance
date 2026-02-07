import React from 'react';
import { useNetWorth } from '../../hooks/useNetWorth';
import { formatCurrencyINR, formatDate } from '../../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function NetWorthDashboard() {
  const { data, loading, error } = useNetWorth();

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl inline-block">
          {error}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No net worth data recorded yet.
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const latest = sortedData[sortedData.length - 1];
  const previous = sortedData.length > 1 ? sortedData[sortedData.length - 2] : latest;

  const netWorthChange = latest.netWorth - previous.netWorth;
  const isPositive = netWorthChange >= 0;

  // Format date for chart (e.g., "Jan 25")
  const chartData = sortedData.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Worth */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Wallet className="w-24 h-24 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Net Worth</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyINR(latest.netWorth)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{formatCurrencyINR(Math.abs(netWorthChange))}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs last month</span>
          </div>
        </div>

        {/* Total Assets */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-24 h-24 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Total Assets</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyINR(latest.totalAssets)}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-2">
             <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md whitespace-nowrap">Savings: {formatCurrencyINR(latest.savings)}</span>
             <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md whitespace-nowrap">Stocks: {formatCurrencyINR(latest.stocks)}</span>
             <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md whitespace-nowrap">MF: {formatCurrencyINR(latest.mutualFunds)}</span>
             <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md whitespace-nowrap">PPF: {formatCurrencyINR(latest.ppf)}</span>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingDown className="w-24 h-24 text-red-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Total Liabilities</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrencyINR(latest.totalLiabilities)}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
             Current Debt Load
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Net Worth Trend</h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => formatCurrencyINR(value)}
              />
              <Area 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNetWorth)" 
                name="Net Worth"
              />
              <Line type="monotone" dataKey="totalAssets" stroke="#10b981" strokeWidth={2} dot={false} name="Assets" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="totalLiabilities" stroke="#ef4444" strokeWidth={2} dot={false} name="Liabilities" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">History</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Assets</th>
                     <th className="px-6 py-4">Liabilities</th>
                     <th className="px-6 py-4">Net Worth</th>
                     <th className="px-6 py-4">Comment</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {[...sortedData].reverse().map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{formatDate(row.date)}</td>
                        <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(row.totalAssets)}</td>
                        <td className="px-6 py-4 text-red-600 dark:text-red-400">{formatCurrencyINR(row.totalLiabilities)}</td>
                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrencyINR(row.netWorth)}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={row.comment}>{row.comment}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
