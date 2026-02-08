-- 1. Profiles (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Categories
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('expense', 'income')) not null,
  bucket text check (bucket in ('Need', 'Want', 'Save', 'Other')), -- Nullable, primarily for expenses
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table categories enable row level security;
create policy "Users can view their own categories." on categories for select using (auth.uid() = user_id);
create policy "Users can modify their own categories." on categories for all using (auth.uid() = user_id);

-- 3. Transactions (Income/Expense Ledger)
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  amount numeric not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  type text check (type in ('expense', 'income')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table transactions enable row level security;
create policy "Users can view their own transactions." on transactions for select using (auth.uid() = user_id);
create policy "Users can modify their own transactions." on transactions for all using (auth.uid() = user_id);

-- 4. Assets (The Definition Table)
-- Defines what the user tracks: "HDFC Savings", "Home Loan", "Zerodha Stocks"
create table assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('ASSET', 'LIABILITY')) not null,
  tags text[], -- e.g. ['liquid', 'investment'] or ['mortgage']
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table assets enable row level security;
create policy "Users can view their own assets." on assets for select using (auth.uid() = user_id);
create policy "Users can modify their own assets." on assets for all using (auth.uid() = user_id);

-- 5. Asset Logs (The History/Snapshot Table)
-- Tracks the state of an asset over time.
-- Replaces 'loan_entries' and 'net_worth_entries'.
create table asset_logs (
  id uuid default gen_random_uuid() primary key,
  asset_id uuid references assets(id) on delete cascade not null,
  date date not null,
  balance numeric not null, -- The value of the asset or the outstanding loan amount
  
  -- Optional: Record the 'flow' that caused this state (e.g. Loan Payment)
  change_amount numeric, -- e.g. Amount Paid for loans, or Amount Invested for assets
  
  -- Flexible metadata for specific types:
  -- Loans: { "interest": 500 }
  -- Stocks: { "units": 10, "market_price": 100 }
  metadata jsonb default '{}'::jsonb,
  
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table asset_logs enable row level security;
create policy "Users can view their own asset logs." on asset_logs for select using (
  exists ( select 1 from assets where id = asset_logs.asset_id and user_id = auth.uid() )
);
create policy "Users can modify their own asset logs." on asset_logs for all using (
  exists ( select 1 from assets where id = asset_logs.asset_id and user_id = auth.uid() )
);

-- Indexes for performance
create index idx_transactions_user_date on transactions(user_id, date);
create index idx_asset_logs_asset_date on asset_logs(asset_id, date);

-- Helper: Handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();