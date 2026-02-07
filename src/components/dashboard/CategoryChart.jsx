import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Settings } from 'lucide-react';
import { groupCategoriesByBucket } from '../../config/categories';
import { formatCurrencyINR } from '../../utils/formatters';
import Modal from '../common/Modal';
import BucketEditor from '../settings/BucketEditor';
import { useConfig } from '../../context/ConfigContext';

/**
 * CustomPieTooltip Component
 * Shows detailed info when hovering over pie slices
 */
function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl shadow-slate-200/50 dark:shadow-none text-sm" style={{ borderColor: data.color || 'transparent' }}>
        <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
        <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">{formatCurrencyINR(data.value)}</p>
        <p className="text-slate-500 dark:text-slate-400">{data.percentage.toFixed(1)}% of total</p>
        {data.bucket && (
          <p className="text-xs mt-1 font-bold uppercase tracking-wider" style={{ color: data.color }}>
            {data.bucket} Bucket
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * GenericPieChart Component
 * Renders a pie chart using Recharts
 */
function GenericPieChart({ data, labelThreshold = 5 }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => percentage > labelThreshold ? `${name} (${percentage.toFixed(0)}%)` : ''}
          outerRadius={105}
          innerRadius={40}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * CategoryChart Component
 * Displays two side-by-side pie charts:
 * 1. Individual Categories Distribution
 * 2. Bucket Distribution
 */
export default function CategoryChart({ categoryBreakdown, totalIncome }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { config } = useConfig();
  const currentBuckets = config.buckets;

  if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) {
    return (
      <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
        <p className="text-slate-500 dark:text-slate-400 font-medium">No category data available</p>
      </div>
    );
  }

  const bucketTotals = groupCategoriesByBucket(categoryBreakdown, currentBuckets);

  // Calculate total expenses for percentage calculation
  const totalExpenses = Object.values(bucketTotals).reduce((sum, bucket) => sum + bucket.amount, 0);

  // Add (Total Income - Total Expenses) to "Save" bucket
  // This represents unspent money which counts as savings
  const netSavings = totalIncome - totalExpenses;
  if (bucketTotals['Save']) {
    bucketTotals['Save'].amount += netSavings;
  }

  // Get bucket order for consistent display
  const bucketOrder = ['Need', 'Want', 'Save', 'Other'];

  // Get bucket color for each category
  const getCategoryBucket = (categoryName) => {
    for (const [bucketName, bucketConfig] of Object.entries(currentBuckets)) {
      if (bucketConfig.categories.some(cat => cat.toLowerCase() === categoryName.toLowerCase())) {
        return bucketName;
      }
    }
    return 'Other';
  };

  // Prepare data for "All Categories" Pie Chart
  const categoryData = Object.entries(categoryBreakdown)
    .map(([name, amount]) => {
      const bucket = getCategoryBucket(name);
      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      return {
        name,
        value: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        bucket,
        color: currentBuckets[bucket]?.color || currentBuckets['Other']?.color || '#cbd5e1',
      };
    })
    .sort((a, b) => b.value - a.value);

  // Prepare data for "Bucket Distribution" Pie Chart
  const bucketData = bucketOrder.map(bucketName => {
    const bucket = bucketTotals[bucketName];
    const percentage = totalIncome > 0 ? (bucket.amount / totalIncome) * 100 : 0;
    return {
      name: bucketName,
      value: parseFloat(bucket.amount.toFixed(2)),
      percentage: percentage,
      color: currentBuckets[bucketName]?.color || '#cbd5e1',
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Categories Pie Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
           <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600">
             % of Total Income
           </span>
        </div>
        <GenericPieChart data={categoryData} labelThreshold={3} />
      </div>

      {/* Bucket Distribution Pie Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
           <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bucket Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Need / Want / Save</p>
           </div>
           <button 
              onClick={() => setIsEditorOpen(true)}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 flex items-center gap-2 text-xs font-medium"
           >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Manage Buckets</span>
           </button>
        </div>
        <GenericPieChart data={bucketData} labelThreshold={5} />
      </div>

      <Modal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)}
        title="Manage Budget Buckets"
      >
        <BucketEditor 
          onClose={() => setIsEditorOpen(false)} 
          activeCategories={Object.keys(categoryBreakdown)}
        />
      </Modal>
    </div>
  );
}