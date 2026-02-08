import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    resolve: null,
    type: 'warning' // 'warning' | 'danger' | 'info'
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || '',
        type: options.type || 'warning',
        resolve
      });
    });
  }, []);

  const handleClose = useCallback((value) => {
    if (dialog.resolve) {
      dialog.resolve(value);
    }
    setDialog((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [dialog]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog 
        isOpen={dialog.isOpen} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type}
        onConfirm={() => handleClose(true)} 
        onCancel={() => handleClose(false)} 
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, type }) {
  if (!isOpen) return null;

  const themes = {
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
      bg: 'bg-amber-50 dark:bg-amber-900/10'
    },
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
      bg: 'bg-red-50 dark:bg-red-900/10'
    }
  };

  const theme = themes[type] || themes.warning;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${theme.bg}`}>
            {theme.icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold text-white rounded-2xl shadow-lg transition-all active:scale-95 ${theme.button}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
