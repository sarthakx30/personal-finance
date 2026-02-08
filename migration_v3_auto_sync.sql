-- Migration V3: Automated Balance Sync
-- This script creates a trigger that automatically updates account balances 
-- whenever a new transaction is recorded.

-- 1. Create the function that calculates and inserts new balance logs
create or replace function public.handle_transaction_balance_update()
returns trigger as $$
declare
  last_source_balance numeric;
  last_dest_balance numeric;
begin
  -- 1. Handle Source Account (Expenses or Transfers)
  -- Money leaves this account, so we subtract the amount
  if (new.account_id is not null) then
    -- Get latest balance for source account
    select balance into last_source_balance 
    from public.asset_logs 
    where asset_id = new.account_id 
    order by date desc, created_at desc 
    limit 1;
    
    -- If no logs exist, assume starting balance of 0
    last_source_balance := coalesce(last_source_balance, 0);

    -- Insert new log with decreased balance
    insert into public.asset_logs (asset_id, date, balance, note)
    values (new.account_id, new.date, last_source_balance - new.amount, 'Auto-update: ' || coalesce(new.description, 'Transaction'));
  end if;

  -- 2. Handle Destination Account (Income or Transfers)
  -- Money enters this account, so we add the amount
  if (new.destination_account_id is not null) then
    -- Get latest balance for destination account
    select balance into last_dest_balance 
    from public.asset_logs 
    where asset_id = new.destination_account_id 
    order by date desc, created_at desc 
    limit 1;

    -- If no logs exist, assume starting balance of 0
    last_dest_balance := coalesce(last_dest_balance, 0);

    -- Insert new log with increased balance
    insert into public.asset_logs (asset_id, date, balance, note)
    values (new.destination_account_id, new.date, last_dest_balance + new.amount, 'Auto-update: ' || coalesce(new.description, 'Transaction'));
  end if;

  return new;
end;
$$ language plpgsql;

-- 2. Attach the trigger to the transactions table
-- This ensures the function runs automatically AFTER every INSERT
drop trigger if exists on_transaction_added on public.transactions;
create trigger on_transaction_added
  after insert on public.transactions
  for each row
  execute procedure public.handle_transaction_balance_update();
