import React from 'react';
import { LayoutDashboard, Wallet, List, X, Settings, User } from 'lucide-react';

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }) {
  const mainItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'net-worth', label: 'Net Worth', icon: Wallet },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'account', label: 'Profile', icon: User },
  ];

  const handleItemClick = (id) => {
    onViewChange(id);
    onClose && onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-[100dvh] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 px-2">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-10 h-10 shadow-sm rounded-xl" />
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">FinTrack</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col justify-between overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-3">
            {mainItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200
                  ${
                    currentView === item.id || (item.id === 'transactions' && currentView === 'add')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Bottom Utility Items */}
          <div className="space-y-2 pt-4 pb-4 border-t border-slate-100 dark:border-slate-800">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                  ${
                    currentView === item.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}