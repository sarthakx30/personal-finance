import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useSheetsList } from '../../hooks/useGoogleSheets';
import { ChevronDown, FileSpreadsheet, Check, Search } from 'lucide-react';

export default function SheetSelector({ onSelectSheet, selectedSheetId }) {
  const { sheets, loading, error } = useSheetsList();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedSheet = sheets.find((s) => s.id === selectedSheetId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (loading) {
    return (
      <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center px-4">
        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full mr-3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2">
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group ${
          isOpen ? 'ring-2 ring-blue-100 dark:ring-blue-900/30 border-blue-400 dark:border-blue-500' : ''
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-1.5 rounded-lg ${selectedSheet ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
             <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="flex flex-col truncate">
             <span className={`font-medium truncate ${selectedSheet ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {selectedSheet ? selectedSheet.name : 'Choose a spreadsheet...'}
             </span>
             {selectedSheet && (
                <span className="text-xs text-slate-500 dark:text-slate-400">Google Sheets</span>
             )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {sheets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>No monthly budget sheets found.</p>
              </div>
            ) : (
              sheets.map((sheet) => (
                <button
                  key={sheet.id}
                  onClick={() => {
                    onSelectSheet(sheet);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-colors ${
                    sheet.id === selectedSheetId 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <FileSpreadsheet className={`w-4 h-4 ${
                        sheet.id === selectedSheetId ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'
                     }`} />
                     <span className="font-medium">{sheet.name}</span>
                  </div>
                  {sheet.id === selectedSheetId && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

