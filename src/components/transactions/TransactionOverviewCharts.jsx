import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrencyINR } from '../../utils/formatters';

const BUCKET_COLORS = {
  'Need': '#ef4444', // Red
  'Want': '#f59e0b', // Amber
  'Save': '#10b981', // Emerald
  'Other': '#6366f1', // Indigo
};

const CATEGORY_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', 
  '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'
];

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-sm">
        <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">{formatCurrencyINR(data.value)}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{data.percentage.toFixed(1)}% of expenses</p>
      </div>
    );
  }
  return null;
}

export default function TransactionOverviewCharts({ transactions }) {
  const expenseTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'expense' && !t.is_transfer), 
  [transactions]);

  const totalExpense = useMemo(() => 
    expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
  [expenseTransactions]);

  // 1. Prepare Category Data
  const categoryData = useMemo(() => {
    const counts = {};
    expenseTransactions.forEach(t => {
      const name = t.categories?.name || 'Uncategorized';
      counts[name] = (counts[name] || 0) + Number(t.amount);
    });

    return Object.entries(counts)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: (value / (totalExpense || 1)) * 100,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseTransactions, totalExpense]);

  // 2. Prepare Bucket Data
  const bucketData = useMemo(() => {
    const counts = { 'Need': 0, 'Want': 0, 'Save': 0, 'Other': 0 };
    expenseTransactions.forEach(t => {
      const bucket = t.categories?.bucket || 'Other';
      if (counts[bucket] !== undefined) {
        counts[bucket] += Number(t.amount);
      } else {
        counts['Other'] += Number(t.amount);
      }
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / (totalExpense || 1)) * 100,
        color: BUCKET_COLORS[name] || BUCKET_COLORS['Other']
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseTransactions, totalExpense]);

  if (expenseTransactions.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-lg">
        <p className="text-slate-400 font-medium">No expenses to display charts for this period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Pie */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           Category Distribution
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bucket Pie */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           Bucket Distribution
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={bucketData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {bucketData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
