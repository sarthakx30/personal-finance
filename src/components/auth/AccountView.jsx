import React from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { LogOut, User } from 'lucide-react';

export default function AccountView() {
  const { user, signOut } = useGoogleAuth();

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="h-32 bg-blue-600 dark:bg-blue-900/50"></div>
        <div className="px-6 pb-6 relative">
          <div className="-mt-16 mb-4 flex justify-center">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.name || 'User'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {user?.email || 'No email available'}
            </p>
          </div>

          <div className="space-y-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                <p className="text-center">
                   Signed in via Google
                </p>
             </div>

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl font-semibold transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
