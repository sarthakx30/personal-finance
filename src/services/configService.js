import { getAccessToken } from './googleAuth';
import { BUCKET_CONFIG, EXPENSE_CATEGORIES } from '../config/categories';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const CONFIG_FILE_NAME = 'finance-tracker-config.json';

/**
 * Find the config file in Google Drive
 */
const findConfigFile = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const params = new URLSearchParams({
    q: `name = '${CONFIG_FILE_NAME}' and trashed = false`,
    spaces: 'drive',
    fields: 'files(id, name)',
  });

  const res = await fetch(`${DRIVE_API}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to search for config file');
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

/**
 * Create the config file with default values
 */
const createConfigFile = async (config) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const metadata = {
    name: CONFIG_FILE_NAME,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!res.ok) throw new Error('Failed to create config file');
  return await res.json();
};

/**
 * Read the config file content
 */
const readConfigFile = async (fileId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(`${DRIVE_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to read config file');
  return await res.json();
};

/**
 * Update the config file content
 */
const updateConfigFile = async (fileId, config) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(config, null, 2),
  });

  if (!res.ok) throw new Error('Failed to update config file');
  return await res.json();
};

/**
 * Get application configuration (Buckets, Categories)
 * Creates the file if it doesn't exist.
 */
export const getAppConfig = async () => {
  try {
    const existingFile = await findConfigFile();
    
    if (existingFile) {
      const config = await readConfigFile(existingFile.id);
      return { config, fileId: existingFile.id };
    } else {
      // Create new with defaults
      const defaultConfig = {
        buckets: BUCKET_CONFIG,
        categories: EXPENSE_CATEGORIES,
      };
      const newFile = await createConfigFile(defaultConfig);
      return { config: defaultConfig, fileId: newFile.id };
    }
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
};

/**
 * Save application configuration
 */
export const saveAppConfig = async (fileId, newConfig) => {
    if (!fileId) {
        // If we somehow lost the fileId, try to find or create again
        const { fileId: newId } = await getAppConfig();
        return updateConfigFile(newId, newConfig);
    }
    return updateConfigFile(fileId, newConfig);
};
