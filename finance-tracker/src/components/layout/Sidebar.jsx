import { LayoutDashboard, Wallet, List, PlusCircle, X } from 'lucide-react';

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }) {
  const budgetItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: List },
    { id: 'add', label: 'Add New', icon: PlusCircle },
  ];

  const assetItems = [
    { id: 'net-worth', label: 'Net Worth', icon: Wallet, disabled: true },
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
              <img src="/logo.svg" alt="Logo" className="w-10 h-10 shadow-sm rounded-xl" />
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">FinTrack</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto min-h-0">
          {/* Monthly Budget Section - Desktop Only */}
          <div className="space-y-1 hidden md:block">
            <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Monthly Budget
                </h3>
            </div>
            {budgetItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Assets Section */}
          <div className="space-y-1">
            <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Assets
                </h3>
            </div>
            {assetItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && handleItemClick(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                  ${item.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.disabled && (
                    <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Soon</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
