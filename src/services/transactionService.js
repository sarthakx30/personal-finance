import { supabase } from './supabaseClient';

/**
 * Fetch transactions for the current user, optionally filtered by date
 */
export const getTransactions = async (startDate, endDate) => {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        type,
        bucket
      )
    `)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Add a new transaction
 */
export const addTransaction = async (transaction) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        ...transaction,
        user_id: user.id,
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Fetch summary stats (Total Income, Total Expense)
 * This is a client-side calculation for now, but can be moved to a RPC later
 */
export const getTransactionSummary = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type');

  if (error) throw error;

  return data.reduce((acc, curr) => {
    if (curr.type === 'income') acc.income += Number(curr.amount);
    if (curr.type === 'expense') acc.expense += Number(curr.amount);
    return acc;
  }, { income: 0, expense: 0 });
};
