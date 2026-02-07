import React from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export default function DateRangeFilter({ startDate, endDate, onChange }) {
  // Helper to get ranges
  const getRanges = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    return [
      { label: 'This Month', start: formatDate(startOfMonth), end: formatDate(endOfMonth) },
      { label: 'Last Month', start: formatDate(startOfLastMonth), end: formatDate(endOfLastMonth) },
      { label: 'This Year', start: formatDate(startOfYear), end: formatDate(today) }, // To today
    ];
  };

  const formatDate = (d) => d.toISOString().split('T')[0];

  const ranges = getRanges();

  // Detect active preset
  const activePreset = ranges.find(r => r.start === startDate && r.end === endDate);

  return (
    <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 gap-3 sm:gap-2">
      <div className="flex items-center justify-center gap-2 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 w-full sm:w-auto">
        <CalendarIcon className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Period</span>
      </div>
      
      {/* Presets */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-full sm:w-auto justify-center">
        {ranges.map((range) => (
          <button
            key={range.label}
            onClick={() => onChange(range.start, range.end)}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all ${
              startDate === range.start && endDate === range.end
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Manual Inputs */}
      <div className="flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto px-2 pb-1 sm:pb-0">
         <input 
            type="date" 
            value={startDate} 
            onChange={(e) => onChange(e.target.value, endDate)}
            className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-900 border-none text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500/20 text-center"
         />
         <span className="text-slate-300 dark:text-slate-600">-</span>
         <input 
            type="date" 
            value={endDate} 
            onChange={(e) => onChange(startDate, e.target.value)}
            className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-900 border-none text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500/20 text-center"
         />
      </div>
    </div>
  );
}
