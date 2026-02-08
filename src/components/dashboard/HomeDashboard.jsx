import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ArrowUpRight, ArrowDownRight, PieChart, Landmark } from 'lucide-react';
import { formatCurrencyINR } from '../../utils/formatters';
import NetWorthChart from '../networth/NetWorthChart';

export default function HomeDashboard({ 
  transactions, 
  loading, 
  error, 
  netWorthData,
  onViewChange 
}) {
  
  // 1. Calculate Cash Flow Stats
  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = Number(t.amount);
      if (t.type === 'income') acc.income += amount;
      else acc.expense += amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  // 2. Top Spending Categories
  const topCategories = useMemo(() => {
    const categories = {};
    transactions.filter(t => t.type === 'expense' && !t.is_transfer).forEach(t => {
      const name = t.categories?.name || 'Other';
      categories[name] = (categories[name] || 0) + Number(t.amount);
    });
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions]);

  // 3. Current Net Worth Breakdown
  const netWorthStats = useMemo(() => {
    const totals = netWorthData.assets.reduce((acc, asset) => {
      const assetLogs = netWorthData.logs.filter(l => l.asset_id === asset.id).sort((a,b) => new Date(b.date) - new Date(a.date));
      const balance = assetLogs[0]?.balance || 0;
      
      if (asset.type === 'ASSET') acc.assets += Number(balance);
      else acc.liabilities += Number(balance);
      
      return acc;
    }, { assets: 0, liabilities: 0 });

    return {
      ...totals,
      netWorth: totals.assets - totals.liabilities
    };
  }, [netWorthData]);

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading your dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* SECTION 1: Holistic Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Net Worth Hero */}
        <div className="lg:col-span-2 bg-slate-900 dark:bg-blue-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-48 h-48 transform rotate-12 -mr-16 -mt-16" />
           </div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-2 opacity-60">
                    <Landmark className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Total Net Worth</span>
                 </div>
                 <h2 className="text-5xl font-black tracking-tighter mb-6">
                    {formatCurrencyINR(netWorthStats.netWorth)}
                 </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Total Assets</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrencyINR(netWorthStats.assets)}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Total Liabilities</p>
                    <p className="text-xl font-bold text-red-400">{formatCurrencyINR(netWorthStats.liabilities)}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Top Accounts Sidebar */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Top Accounts</h3>
              <button onClick={() => onViewChange('net-worth')} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all">
                 <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
           </div>
           
           <div className="space-y-4 flex-1">
              {netWorthData.assets.slice(0, 4).map(asset => {
                 const latestLog = netWorthData.logs.filter(l => l.asset_id === asset.id)[0];
                 return (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${asset.type === 'ASSET' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                             {asset.name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{asset.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{asset.tags?.[0] || asset.type}</p>
                          </div>
                       </div>
                       <p className="text-sm font-black text-slate-700 dark:text-slate-300">{formatCurrencyINR(latestLog?.balance || 0)}</p>
                    </div>
                 )
              })}
           </div>
        </div>
      </div>

      {/* SECTION 2: Insights & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Spending Chart/List */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-lg border border-slate-100 dark:border-slate-700">
           <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                 <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Top Spending</h3>
           </div>

           <div className="space-y-6">
              {topCategories.map((cat, idx) => {
                 const percent = (cat.amount / (stats.expense || 1)) * 100;
                 return (
                    <div key={cat.name} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrencyINR(cat.amount)}</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000" 
                             style={{ width: `${percent}%` }}
                          />
                       </div>
                    </div>
                 )
              })}
              {topCategories.length === 0 && <p className="text-center text-slate-400 py-10 italic">No spending recorded yet.</p>}
           </div>
        </div>

        {/* Wealth Trend Mini Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Wealth Trend</h3>
              </div>
           </div>
           <div className="flex-1 min-h-[200px]">
              <NetWorthChart assets={netWorthData.assets} logs={netWorthData.logs} />
           </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-lg border border-slate-100 dark:border-slate-700">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <button onClick={() => onViewChange('transactions')} className="text-xs font-bold text-blue-600 dark:text-blue-400">See All</button>
           </div>

           <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {transactions.slice(0, 4).map(t => (
                 <div key={t.id} className="py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-8 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                       <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{t.description}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{t.categories?.name || 'Other'}</p>
                       </div>
                    </div>
                    <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                       {t.type === 'income' ? '+' : ''}{formatCurrencyINR(t.amount)}
                    </span>
                 </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-slate-400 py-10 italic">No recent activity.</p>}
           </div>
        </div>

      </div>
    </div>
  );
}
