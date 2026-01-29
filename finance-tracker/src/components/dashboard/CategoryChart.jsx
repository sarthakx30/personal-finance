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
      <div className="bg-white p-4 border-2 rounded-lg shadow-lg" style={{ borderColor: data.color }}>
        <p className="font-semibold text-gray-900 text-sm">{data.name}</p>
        <p className="text-sm text-gray-700 mt-1">
          Amount: <span className="font-bold text-lg">{formatCurrencyINR(data.amount)}</span>
        </p>
        <p className="text-sm text-gray-700">
          Percentage: <span className="font-bold">{data.percentage.toFixed(1)}%</span>
        </p>
        {data.bucket && (
          <p className="text-sm mt-1 font-semibold" style={{ color: data.color }}>
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
      <div className="bg-white p-3 border-2 border-gray-300 rounded shadow-lg text-sm">
        <p className="font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-gray-700 font-bold">{formatCurrencyINR(payload[0].value)}</p>
        <p className="text-gray-600">{payload[0].payload.percentage.toFixed(1)}% of total</p>
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
          label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
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
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">No category data available</p>
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">All Categories</h3>
        <p className="text-sm text-gray-600 mb-4">Hover over bars to see detailed information</p>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={false}
            />
            <YAxis
              label={{ value: 'Amount (£)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} label={null}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bucket Distribution Pie Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Bucket Distribution</h3>
        <PieChartComponent bucketTotals={bucketTotals} bucketOrder={bucketOrder} totalIncome={totalIncome} />
      </div>
    </div>
  );
}
