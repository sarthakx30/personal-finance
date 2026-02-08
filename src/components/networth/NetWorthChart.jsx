import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  LineChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrencyINR } from '../../utils/formatters';

export default function NetWorthChart({ assets, logs }) {
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Map of asset_id -> { last_known_balance, type }
    const assetBalances = {};
    
    // Sort logs chronologically to build state over time
    const chronologicalLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const dataByDate = {};

    chronologicalLogs.forEach(log => {
      const asset = assets.find(a => a.id === log.asset_id);
      if (!asset) return;

      assetBalances[log.asset_id] = {
        balance: Number(log.balance),
        type: asset.type
      };
      
      // Calculate totals for this date
      const totals = Object.values(assetBalances).reduce((acc, item) => {
        if (item.type === 'ASSET') acc.assets += item.balance;
        else acc.liabilities += item.balance;
        return acc;
      }, { assets: 0, liabilities: 0 });

      dataByDate[log.date] = {
        netWorth: totals.assets - totals.liabilities,
        assets: totals.assets,
        liabilities: totals.liabilities
      };
    });

    return Object.entries(dataByDate).map(([date, values]) => ({
      date,
      ...values,
      formattedDate: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [assets, logs]);

  if (chartData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-400">Add more balance updates to see your progress chart.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700 pb-1 mb-2">
            {new Date(payload[0].payload.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-8 items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Net Worth</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrencyINR(payload.find(p => p.dataKey === 'netWorth')?.value)}</span>
            </div>
            <div className="flex justify-between gap-8 items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Total Assets</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencyINR(payload.find(p => p.dataKey === 'assets')?.value)}</span>
            </div>
            <div className="flex justify-between gap-8 items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Total Liabilities</span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400">{formatCurrencyINR(payload.find(p => p.dataKey === 'liabilities')?.value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            hide={true}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Main Net Worth Area */}
          <Area 
            type="monotone" 
            dataKey="netWorth" 
            stroke="#2563eb" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorNetWorth)" 
            animationDuration={1500}
          />

          {/* Dotted Assets Line */}
          <Line 
            type="monotone" 
            dataKey="assets" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={1500}
          />

          {/* Dotted Liabilities Line */}
          <Line 
            type="monotone" 
            dataKey="liabilities" 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}