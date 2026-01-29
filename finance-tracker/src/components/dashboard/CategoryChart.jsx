import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { groupCategoriesByBucket, BUCKET_CONFIG } from '../../config/categories';
import { formatCurrencyINR } from '../../utils/formatters';

/**
 * CustomBarTooltip Component
 * Shows detailed info when hovering over a bar
 */
function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border rounded-lg shadow-xl shadow-slate-200/50" style={{ borderColor: data.color }}>
        <p className="font-bold text-slate-900 text-sm">{data.name}</p>
        <p className="text-sm text-slate-700 mt-1">
          Amount: <span className="font-bold text-lg">{formatCurrencyINR(data.amount)}</span>
        </p>
        <p className="text-sm text-slate-600">
          Percentage: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
        </p>
        {data.bucket && (
          <p className="text-xs mt-2 font-bold uppercase tracking-wider" style={{ color: data.color }}>
            {data.bucket} Bucket
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * CustomPieTooltip Component
 * Shows detailed info when hovering over pie slices
 */
function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl shadow-slate-200/50 text-sm">
        <p className="font-bold text-slate-900">{payload[0].name}</p>
        <p className="text-slate-700 font-bold text-lg">{formatCurrencyINR(payload[0].value)}</p>
        <p className="text-slate-500">{payload[0].payload.percentage.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
}

/**
 * PieChartComponent Component
 * Renders a pie chart for bucket distribution using Recharts
 */
function PieChartComponent({ bucketTotals, bucketOrder, totalIncome }) {
  const data = bucketOrder.map(bucketName => {
    const bucket = bucketTotals[bucketName];
    const percentage = totalIncome > 0 ? (bucket.amount / totalIncome) * 100 : 0;
    return {
      name: bucketName,
      value: parseFloat(bucket.amount.toFixed(2)),
      percentage: percentage,
    };
  });

  const colors = bucketOrder.map(bucketName => BUCKET_CONFIG[bucketName].color);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => percentage > 5 ? `${name} (${percentage.toFixed(0)}%)` : ''}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {colors.map((color, index) => (
            <Cell key={`cell-${index}`} fill={color} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * CategoryChart Component
 * Displays all individual categories in an interactive bar chart
 * Shows bucket breakdown in a pie chart below
 * Features: Hover tooltips for detailed information
 */
export default function CategoryChart({ categoryBreakdown, totalIncome }) {
  if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <p className="text-slate-500 font-medium">No category data available</p>
      </div>
    );
  }

  const bucketTotals = groupCategoriesByBucket(categoryBreakdown);

  // Calculate total expenses for percentage calculation
  const totalExpenses = Object.values(bucketTotals).reduce((sum, bucket) => sum + bucket.amount, 0);

  // Get bucket order for consistent display
  const bucketOrder = ['Need', 'Want', 'Save', 'Other'];

  // Get bucket color for each category
  const getCategoryBucket = (categoryName) => {
    for (const [bucketName, bucketConfig] of Object.entries(BUCKET_CONFIG)) {
      if (bucketConfig.categories.some(cat => cat.toLowerCase() === categoryName.toLowerCase())) {
        return bucketName;
      }
    }
    return 'Other';
  };

  // Prepare data for bar chart - percentages based on total income
  const chartData = Object.entries(categoryBreakdown)
    .map(([name, amount]) => {
      const bucket = getCategoryBucket(name);
      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      return {
        name,
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        bucket,
        color: BUCKET_CONFIG[bucket].color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-8">
      {/* Interactive Bar Chart for Categories */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-900">All Categories</h3>
           <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
             Sorted by Amount
           </span>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} label={null}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bucket Distribution Pie Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">Bucket Distribution</h3>
        <PieChartComponent bucketTotals={bucketTotals} bucketOrder={bucketOrder} totalIncome={totalIncome} />
      </div>
    </div>
  );
}