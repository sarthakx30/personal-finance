import { LayoutDashboard, List, PlusCircle, LogOut } from 'lucide-react';
import AuthButton from '../auth/AuthButton';
import ThemeToggle from '../common/ThemeToggle';

export default function Layout({ children, currentView, onViewChange, isSignedIn }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: List },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Desktop/Tablet Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10 shadow-sm rounded-xl" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">
              Finance Tracker
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            {isSignedIn && (
              <>
                <nav className="hidden md:flex items-center gap-1 mr-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                        ${
                          currentView === item.id
                            ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => onViewChange('add')}
                    className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border
                        ${
                          currentView === 'add'
                            ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-200/50'
                            : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:bg-blue-900/20 dark:border-transparent dark:text-blue-400 dark:hover:bg-blue-900/30'
                        }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add New
                  </button>
                </nav>
                <AuthButton />
              </>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isSignedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
          <div className="flex justify-around items-center h-16 px-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1
                ${currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-medium">Overview</span>
            </button>

            <button
              onClick={() => onViewChange('add')}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div className={`p-3 rounded-full shadow-md shadow-blue-200/30 transform -translate-y-4 transition-transform
                 ${currentView === 'add' 
                    ? 'bg-blue-700 text-white scale-110' 
                    : 'bg-blue-600 text-white'}`}
              >
                 <PlusCircle className="w-6 h-6" />
              </div>
            </button>

            <button
              onClick={() => onViewChange('transactions')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1
                ${currentView === 'transactions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <List className="w-6 h-6" />
              <span className="text-[10px] font-medium">History</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
