import { GOOGLE_CONFIG } from '../config/googleConfig';

let googleScriptLoaded = false;
let tokenClient = null;
let currentUser = null;
let accessToken = null;
let listeners = [];

// Load the Google Identity Services script
export const loadGoogleIdentityScript = () => {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded || window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    if (document.getElementById('google-identity-script')) {
      // Script already added, wait for it to load
      const checkLoaded = () => {
        if (window.google?.accounts?.oauth2) {
          googleScriptLoaded = true;
          resolve();
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });
};

// Initialize Google Identity Services
export const initializeGoogleAuth = async () => {
  try {
    await loadGoogleIdentityScript();
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error('Google Identity Services not loaded');
    }
    // No explicit init needed for GIS, but set up token client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.clientId,
      scope: GOOGLE_CONFIG.scopes.join(' '),
      callback: (response) => {
        if (response && response.access_token) {
          accessToken = response.access_token;
          currentUser = { access_token: accessToken };
          listeners.forEach((cb) => cb(true));
        } else {
          listeners.forEach((cb) => cb(false));
        }
      },
    });
    return true;
  } catch (error) {
    let msg;
    if (error && typeof error === 'object') {
      if (error.message) {
        msg = error.message;
      } else {
        try {
          msg = JSON.stringify(error);
        } catch (e) {
          msg = String(error);
        }
      }
    } else {
      msg = String(error);
    }
    console.error('Error initializing Google Auth:', msg);
    throw new Error(msg);
  }
};

// Sign in with Google (popup)
export const signInWithGoogle = async () => {
  if (!tokenClient) {
    throw new Error('Google Identity Services not initialized');
  }
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response && response.access_token) {
        accessToken = response.access_token;
        currentUser = { access_token: accessToken };
        listeners.forEach((cb) => cb(true));
        resolve(currentUser);
      } else {
        listeners.forEach((cb) => cb(false));
        reject(new Error('Failed to sign in'));
      }
    };
    tokenClient.requestAccessToken();
  });
};

// Sign out (just clear local state)
export const signOutGoogle = async () => {
  accessToken = null;
  currentUser = null;
  listeners.forEach((cb) => cb(false));
};

// Get current auth status
export const isUserSignedIn = () => {
  return !!accessToken;
};

// Get current user (just returns access token)
export const getCurrentUser = () => {
  return currentUser;
};

// Get access token
export const getAccessToken = () => {
  return accessToken;
};

// Listen to auth state changes
export const onAuthStateChanged = (callback) => {
  listeners.push(callback);
};
