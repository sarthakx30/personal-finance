import { supabase } from './supabaseClient';

let currentUser = null;
let accessToken = null;
let listeners = [];

// Initialize Google Auth on mount
export const initializeGoogleAuth = async () => {
  console.log('Initializing Supabase Auth...');

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth State Change Event:', event);
    
    if (session) {
      // Capture the Google provider token if available
      if (session.provider_token) {
        accessToken = session.provider_token;
        localStorage.setItem('google_access_token', accessToken);
      } else {
        accessToken = localStorage.getItem('google_access_token');
      }

      currentUser = {
        access_token: accessToken,
        email: session.user.email,
        name: session.user.user_metadata?.full_name,
        picture: session.user.user_metadata?.avatar_url,
        id: session.user.id
      };
      
      // Clean up the URL hash if it contains auth data
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, null, window.location.pathname);
      }

      listeners.forEach((cb) => cb(true));
    } else {
      accessToken = null;
      currentUser = null;
      localStorage.removeItem('google_access_token');
      listeners.forEach((cb) => cb(false));
    }
  });

  // Initial session check
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session) {
      console.log('Initial session found');
      accessToken = session.provider_token || localStorage.getItem('google_access_token');
      currentUser = {
        access_token: accessToken,
        email: session.user.email,
        name: session.user.user_metadata?.full_name,
        picture: session.user.user_metadata?.avatar_url,
        id: session.user.id
      };
    } else {
      console.log('No initial session found');
    }
  } catch (err) {
    console.error('Error getting session:', err);
  }
  
  return true;
};

export const loadGoogleIdentityScript = () => Promise.resolve();

export const signInWithGoogle = async () => {
  // Construct the redirect URL carefully
  // origin + BASE_URL ensures it works on both localhost and GitHub Pages
  const baseUrl = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
  const redirectTo = window.location.origin + baseUrl;
  
  console.log('Signing in with Google, redirecting to:', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo,
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
