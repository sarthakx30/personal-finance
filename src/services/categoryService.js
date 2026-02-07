import { supabase } from './supabaseClient';

/**
 * Fetch all categories for the current user
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Add a new category
 */
export const addCategory = async (category) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        ...category,
        user_id: user.id,
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Update a category
 */
export const updateCategory = async (id, updates) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Delete a category
 */
export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
