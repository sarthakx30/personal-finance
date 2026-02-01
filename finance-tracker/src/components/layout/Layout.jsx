import { useState } from 'react';
import { LayoutDashboard, List, PlusCircle, LogOut, Menu, User } from 'lucide-react';
import AuthButton from '../auth/AuthButton';
import ThemeToggle from '../common/ThemeToggle';
import Sidebar from './Sidebar';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export default function Layout({ children, currentView, onViewChange, isSignedIn }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useGoogleAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {isSignedIn && (
        <Sidebar 
          currentView={currentView} 
          onViewChange={onViewChange} 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`${isSignedIn ? 'md:pl-64' : ''} transition-all duration-300`}>
        {/* Header - Simplified for Sidebar Layout */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 md:hidden">
              {isSignedIn && (
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <img src="/logo.svg" alt="Logo" className="w-10 h-10 shadow-sm rounded-xl" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                FinTrack
              </h1>
            </div>

            <div className="hidden md:block"></div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isSignedIn && (
                <button
                  onClick={() => onViewChange('account')}
                  className={`relative p-1 rounded-full transition-all duration-200 border-2 
                    ${currentView === 'account' 
                      ? 'border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/20' 
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  title="Account"
                >
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>

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
