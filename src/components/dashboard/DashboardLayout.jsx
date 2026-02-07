import React from 'react';
import SummaryDashboard from './SummaryDashboard';
import NetWorthDashboard from '../networth/NetWorthDashboard';
import { formatCurrencyINR } from '../../utils/formatters';
import { Wallet, ArrowRight } from 'lucide-react';

export default function DashboardLayout({ 
  transactions, 
  loading, 
  error, 
  dateFilter, 
  onDateChange,
  netWorthData,
  onViewChange
}) {
  
  // Calculate Net Worth summary for the "Holistic" view
  // Note: Net Worth is typically "As of Today", so we take the latest values from the hook
  const totalNetWorth = netWorthData.assets.reduce((acc, asset) => {
     // Find latest log for this asset
     const assetLogs = netWorthData.logs.filter(l => l.asset_id === asset.id).sort((a,b) => new Date(b.date) - new Date(a.date));
     const balance = assetLogs[0]?.balance || 0;
     return acc + (asset.type === 'ASSET' ? Number(balance) : -Number(balance));
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
             <p className="text-slate-500 dark:text-slate-400">Your financial health at a glance.</p>
          </div>
       </div>

       {/* Top Row: Cash Flow + Net Worth Snapshot */}
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cash Flow takes up 3 cols */}
          <div className="lg:col-span-3">
             <SummaryDashboard transactions={transactions} loading={loading} error={error} />
          </div>

          {/* Net Worth Snapshot Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
             {/* Decor */}
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="w-32 h-32 transform rotate-12 -mr-8 -mt-8" />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                   <Wallet className="w-5 h-5" />
                   <span className="text-sm font-bold uppercase tracking-wider">Current Net Worth</span>
                </div>
                <p className="text-3xl font-bold mb-1">
                   {formatCurrencyINR(totalNetWorth)}
                </p>
                <p className="text-blue-100 text-xs">
                   Across {netWorthData.assets.length} accounts
                </p>
             </div>

             <div className="relative z-10 mt-6">
                <button 
                   onClick={() => onViewChange('net-worth')}
                   className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-medium text-sm group-hover:pl-5"
                >
                   View Details
                   <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
       </div>

       {/* Recent Transactions Preview */}
       <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
             <button 
                onClick={() => onViewChange('transactions')}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
             >
                View All
             </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
             {loading ? (
                <div className="p-8 text-center text-slate-400">Loading activity...</div>
             ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No transactions in this period.</div>
             ) : (
                transactions.slice(0, 5).map((t) => ( // Only show top 5
                   <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                         <div>
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{t.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.categories?.name || 'Uncategorized'} • {new Date(t.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                         {t.type === 'income' ? '+' : ''}{formatCurrencyINR(t.amount)}
                      </span>
                   </div>
                ))
             )}
          </div>
       </div>
    </div>
  );
}
