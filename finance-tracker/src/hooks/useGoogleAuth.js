import { useEffect, useState } from 'react';
import {
  initializeGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  isUserSignedIn,
  getCurrentUser,
  onAuthStateChanged,
} from '../services/googleAuth';

export const useGoogleAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Google Auth on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeGoogleAuth();
        setIsInitialized(true);
        // Check initial sign-in status
        const signedIn = isUserSignedIn();
        setIsSignedIn(signedIn);
        setUser(getCurrentUser());
        // Listen for auth state changes
        onAuthStateChanged((isSignedInNow) => {
          setIsSignedIn(isSignedInNow);
          if (isSignedInNow) {
            setUser(getCurrentUser());
          } else {
            setUser(null);
          }
        });
      } catch (err) {
        console.error('Init error:', err);
        setError(err.message || 'Failed to initialize Google Auth');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithGoogle();
      setIsSignedIn(true);
      setUser(getCurrentUser());
      setLoading(false);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOutGoogle();
      setIsSignedIn(false);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return {
    isInitialized,
    isSignedIn,
    user,
    error,
    loading,
    signIn,
    signOut,
  };
};
