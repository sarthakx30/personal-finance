// Google API Configuration
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'openid',
    'email',
    'profile',
  ],
};

// Debug logging (Safe: does not log actual keys)
console.log('Google Auth Config Check:');
console.log('- Client ID Loaded:', !!GOOGLE_CONFIG.clientId);
console.log('- API Key Loaded:', !!GOOGLE_CONFIG.apiKey);

if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.apiKey) {
  console.error("CRITICAL: Google API Client ID or API Key is missing. App will not function.");
}

if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.apiKey) {
  console.error("CRITICAL: Google API Client ID or API Key is missing. Check your environment variables.");
  console.log("Client ID present:", !!GOOGLE_CONFIG.clientId);
  console.log("API Key present:", !!GOOGLE_CONFIG.apiKey);
}
