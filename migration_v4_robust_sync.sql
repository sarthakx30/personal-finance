-- Migration V4: Robust Balance Sync (CRUD)
-- This version handles INSERT, UPDATE, and DELETE operations to ensure 
-- balances stay accurate even if transactions are modified or removed.

create or replace function public.handle_transaction_balance_sync()
returns trigger as $$
declare
  change_amount numeric;
  old_source_id uuid;
  old_dest_id uuid;
  new_source_id uuid;
  new_dest_id uuid;
begin
  -- 1. DETERMINE OPERATION AND IMPACT
  
  -- DELETE: We reverse the impact of the old transaction
  if (TG_OP = 'DELETE') then
    if (old.account_id is not null) then
      perform public.adjust_asset_balance(old.account_id, old.amount, old.date, 'Revert Expense: ' || coalesce(old.description, 'Transaction'));
    end if;
    if (old.destination_account_id is not null) then
      perform public.adjust_asset_balance(old.destination_account_id, -old.amount, old.date, 'Revert Income: ' || coalesce(old.description, 'Transaction'));
    end if;
    return old;
  end if;

  -- INSERT: Standard impact
  if (TG_OP = 'INSERT') then
    if (new.account_id is not null) then
      perform public.adjust_asset_balance(new.account_id, -new.amount, new.date, 'Auto-update: ' || coalesce(new.description, 'Transaction'));
    end if;
    if (new.destination_account_id is not null) then
      perform public.adjust_asset_balance(new.destination_account_id, new.amount, new.date, 'Auto-update: ' || coalesce(new.description, 'Transaction'));
    end if;
    return new;
  end if;

  -- UPDATE: Reverse old, apply new
  if (TG_OP = 'UPDATE') then
    -- Reverse OLD
    if (old.account_id is not null) then
      perform public.adjust_asset_balance(old.account_id, old.amount, old.date, 'Update Adjustment (Old)');
    end if;
    if (old.destination_account_id is not null) then
      perform public.adjust_asset_balance(old.destination_account_id, -old.amount, old.date, 'Update Adjustment (Old)');
    end if;
    
    -- Apply NEW
    if (new.account_id is not null) then
      perform public.adjust_asset_balance(new.account_id, -new.amount, new.date, 'Update Adjustment (New)');
    end if;
    if (new.destination_account_id is not null) then
      perform public.adjust_asset_balance(new.destination_account_id, new.amount, new.date, 'Update Adjustment (New)');
    end if;
    return new;
  end if;

  return null;
end;
$$ language plpgsql;

-- Helper function to calculate and insert log
create or replace function public.adjust_asset_balance(p_asset_id uuid, p_delta numeric, p_date date, p_note text)
returns void as $$
declare
  current_bal numeric;
begin
  select balance into current_bal 
  from public.asset_logs 
  where asset_id = p_asset_id 
  order by date desc, created_at desc 
  limit 1;
  
  current_bal := coalesce(current_bal, 0);
  
  insert into public.asset_logs (asset_id, date, balance, note)
  values (p_asset_id, p_date, current_bal + p_delta, p_note);
end;
$$ language plpgsql;

-- Re-attach trigger for all operations
drop trigger if exists on_transaction_added on public.transactions;
drop trigger if exists on_transaction_modified on public.transactions;

create trigger on_transaction_modified
  after insert or update or delete on public.transactions
  for each row
  execute procedure public.handle_transaction_balance_sync();
