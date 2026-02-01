import { LogIn, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export default function AuthButton() {
  const { isSignedIn, loading, error, isInitialized, signIn, signOut } = useGoogleAuth();

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center text-red-500 text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 mr-1.5" />
          <span>Error</span>
        </div>
        <button
          onClick={isInitialized ? signIn : undefined}
          disabled={!isInitialized}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-xl">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <button
        onClick={signOut}
        className="group flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm"
        title="Sign Out"
      >
        <span>Sign Out</span>
        <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <button
      onClick={isInitialized ? signIn : undefined}
      disabled={!isInitialized}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <LogIn className="w-4 h-4" />
      <span>Sign In with Google</span>
    </button>
  );
}
