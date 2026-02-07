import { supabase } from './supabaseClient';

let currentUser = null;
let accessToken = null;
let listeners = [];

// Initialize Google Auth on mount
export const initializeGoogleAuth = async () => {
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      // Supabase only provides provider_token on initial sign-in/session events
      if (session.provider_token) {
        accessToken = session.provider_token;
        localStorage.setItem('google_access_token', accessToken);
      } else {
        // Try to recover from localStorage if it's a refresh
        accessToken = localStorage.getItem('google_access_token');
      }

      currentUser = {
        access_token: accessToken,
        email: session.user.email,
        name: session.user.user_metadata?.full_name,
        picture: session.user.user_metadata?.avatar_url,
        id: session.user.id
      };
      listeners.forEach((cb) => cb(true));
    } else {
      accessToken = null;
      currentUser = null;
      localStorage.removeItem('google_access_token');
      listeners.forEach((cb) => cb(false));
    }
  });

  // Initial check
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    accessToken = session.provider_token || localStorage.getItem('google_access_token');
    currentUser = {
      access_token: accessToken,
      email: session.user.email,
      name: session.user.user_metadata?.full_name,
      picture: session.user.user_metadata?.avatar_url,
      id: session.user.id
    };
  }
  
  return true;
};

export const loadGoogleIdentityScript = () => Promise.resolve();

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: window.location.origin,
      scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
    }
  });

  if (error) throw error;
  return data;
};

export const signOutGoogle = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  accessToken = null;
  currentUser = null;
  localStorage.removeItem('google_access_token');
};

export const isUserSignedIn = () => !!currentUser;
export const getCurrentUser = () => currentUser;
export const getAccessToken = () => accessToken;
export const onAuthStateChanged = (callback) => {
  listeners.push(callback);
};
