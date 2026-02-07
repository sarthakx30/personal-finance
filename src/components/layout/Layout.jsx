import React, { useState } from 'react';
import { LayoutDashboard, List, PlusCircle, LogOut, Menu, User, Wallet } from 'lucide-react';
import AuthButton from '../auth/AuthButton';
import ThemeToggle from '../common/ThemeToggle';
import Sidebar from './Sidebar';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

import DateRangeFilter from '../common/DateRangeFilter';

export default function Layout({ 
  children, 
  currentView, 
  onViewChange, 
  isSignedIn,
  subView,
  onSubViewChange,
  dateFilter,
  onDateChange
}) {
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
      <div className={`${isSignedIn ? 'md:pl-64' : ''} transition-all duration-300 min-h-screen flex flex-col`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            
            {/* Left: Mobile Toggle & Logo */}
            <div className="flex items-center gap-3">
              {isSignedIn && (
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              <div className="md:hidden flex items-center gap-2">
                 <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-8 h-8 rounded-lg" />
                 <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">FinTrack</h1>
              </div>
            </div>

            {/* Right: Date Filter & Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Date Filter */}
              {isSignedIn && (
                 <div className="hidden md:block">
                    <DateRangeFilter 
                       startDate={dateFilter.start} 
                       endDate={dateFilter.end} 
                       onChange={onDateChange} 
                    />
                 </div>
              )}

              <ThemeToggle />
              
              {isSignedIn && (
                <button
                  onClick={() => onViewChange('account')}
                  className={`relative p-0.5 rounded-full transition-all duration-200 ring-2 ring-offset-2 dark:ring-offset-slate-900
                    ${currentView === 'account' 
                      ? 'ring-blue-600 dark:ring-blue-500' 
                      : 'ring-transparent hover:ring-slate-200 dark:hover:ring-slate-700'
                    }`}
                  title="Account"
                >
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover bg-slate-200" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Date Filter (Sub-header) */}
          {isSignedIn && (
             <div className="md:hidden px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <DateRangeFilter 
                   startDate={dateFilter.start} 
                   endDate={dateFilter.end} 
                   onChange={onDateChange} 
                />
             </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Contextual Navigation (Transactions Screen Only) */}
      {isSignedIn && currentView === 'transactions' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-around items-center h-16 px-2">
            <button
              onClick={() => onSubViewChange('overview')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                ${subView === 'overview' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold">Overview</span>
            </button>

            <button
              onClick={() => onSubViewChange('add')}
              className="flex flex-col items-center justify-center w-full h-full -mt-8"
            >
              <div className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform ring-4 ring-white dark:ring-slate-900
                 ${subView === 'add' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-110 -translate-y-1 shadow-blue-500/50' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'}`}
              >
                 <PlusCircle className="w-7 h-7" />
              </div>
            </button>

            <button
              onClick={() => onSubViewChange('history')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                ${subView === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
            >
              <List className="w-5 h-5" />
              <span className="text-[10px] font-bold">History</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
