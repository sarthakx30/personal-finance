import { supabase } from './supabaseClient';

/**
 * Fetch all assets/liabilities for the user
 */
export const getAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Add a new asset/liability
 */
export const addAsset = async (asset) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('assets')
    .insert([{ ...asset, user_id: user.id }])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Fetch logs for a specific asset
 */
export const getAssetLogs = async (assetId) => {
  const { data, error } = await supabase
    .from('asset_logs')
    .select('*')
    .eq('asset_id', assetId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch all logs for all assets (for Net Worth calculation)
 */
export const getAllAssetLogs = async () => {
  const { data, error } = await supabase
    .from('asset_logs')
    .select(`
      *,
      assets (
        name,
        type
      )
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Add a new log entry (snapshot) for an asset
 */
export const addAssetLog = async (log) => {
  const { data, error } = await supabase
    .from('asset_logs')
    .insert([log])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Delete an asset
 */
export const deleteAsset = async (id) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
