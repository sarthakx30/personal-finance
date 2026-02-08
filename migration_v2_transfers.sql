-- Migration V2: Add Transfer Support and Account Linking

-- 1. Add columns to link transactions to specific asset accounts
alter table transactions 
add column account_id uuid references assets(id) on delete set null, -- The account money leaves (Expense/Transfer)
add column destination_account_id uuid references assets(id) on delete set null, -- The account money enters (Income/Transfer)
add column is_transfer boolean default false;

-- 2. Add indexes for performance
create index idx_transactions_account_id on transactions(account_id);
create index idx_transactions_dest_account_id on transactions(destination_account_id);

-- 3. (Optional) Comment explaining the logic
comment on column transactions.account_id is 'Source account for Expenses and Transfers';
comment on column transactions.destination_account_id is 'Destination account for Income and Transfers';
