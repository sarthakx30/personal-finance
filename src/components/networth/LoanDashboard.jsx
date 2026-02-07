import React, { useState } from 'react';
import { useLoans } from '../../hooks/useLoans';
import { formatCurrencyINR } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { CreditCard, TrendingDown, Calendar, AlertCircle, Plus, Pencil } from 'lucide-react';
import LoanEntryModal from './LoanEntryModal';

export default function LoanDashboard() {
  const { data, loading, error, addEntry, updateEntry } = useLoans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { entry, index }
  const [modalBaseBalance, setModalBaseBalance] = useState(0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    // For new entry, base balance is the balance of the last entry
    const latestBalance = data.length > 0 ? data[data.length - 1].balance : 0;
    setModalBaseBalance(latestBalance);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry, index) => {
    setEditingItem({ entry, index });
    // For editing, base balance is the balance of the previous entry
    // If index is 0 (first entry), base balance is effectively unknown/0, 
    // user might need to adjust manually or we assume 0.
    const prevBalance = index > 0 ? data[index - 1].balance : 0;
    setModalBaseBalance(prevBalance);
    setIsModalOpen(true);
  };

  const handleSave = async (transaction) => {
    if (editingItem) {
      await updateEntry(editingItem.index, transaction);
    } else {
      await addEntry(transaction);
    }
  };

  if (loading && !data.length) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl inline-block flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No loan data found. Check your "Education Loan" tab.
      </div>
    );
  }

  const latest = data[data.length - 1];
  const totalPaid = data.reduce((sum, item) => sum + item.paid, 0);
  const totalInterest = data.reduce((sum, item) => sum + item.interest, 0);

  // Chart Data Preparation
  const chartData = data.map(item => ({
    ...item,
    formattedDate: `${item.month.substr(0, 3)} ${item.year.toString().substr(2)}`,
  }));

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">Loan Tracker</h2>
         <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-all text-sm"
         >
            <Plus className="w-4 h-4" />
            Add Payment
         </button>
      </div>

      {/* KPI Cards */}
      {/* ... (KPI cards code remains same, implicitly included by not changing this block) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outstanding Balance */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CreditCard className="w-24 h-24 text-red-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Outstanding Balance</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyINR(latest.balance)}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
             As of {latest.month} {latest.year}
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingDown className="w-24 h-24 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyINR(totalPaid)}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
             Total Interest Paid: <span className="text-red-500 dark:text-red-400 font-medium">{formatCurrencyINR(totalInterest)}</span>
          </div>
        </div>
      </div>

      {/* Payment vs Interest Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
              />
              <Legend />
              <Bar dataKey="paid" name="Principal Paid" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="interest" name="Interest Paid" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance Trend Line */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Balance Reduction</h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => formatCurrencyINR(value)}
              />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Loan Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Repayment Schedule</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                     <th className="px-6 py-4">Month</th>
                     <th className="px-6 py-4">Paid</th>
                     <th className="px-6 py-4">Interest</th>
                     <th className="px-6 py-4">Balance</th>
                     <th className="px-6 py-4 w-10"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {[...data].reverse().map((row, i) => {
                     // Calculate original index (data is reversed here)
                     const originalIndex = data.length - 1 - i;
                     return (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-slate-400" />
                             {row.month} {row.year}
                          </td>
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{formatCurrencyINR(row.paid)}</td>
                          <td className="px-6 py-4 text-red-500 dark:text-red-400">{formatCurrencyINR(row.interest)}</td>
                          <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrencyINR(row.balance)}</td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => handleOpenEdit(row, originalIndex)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit Entry"
                             >
                                <Pencil className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal */}
      <LoanEntryModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSave={handleSave}
         baseBalance={modalBaseBalance}
         initialData={editingItem?.entry}
      />
    </div>
  );
}
