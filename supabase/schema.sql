create extension if not exists "pgcrypto";

-- ---------- TABLES ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency     text not null default 'USD',
  created_at   timestamptz not null default now()
);

-- user_id NULL = built-in category shared by everyone
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,
  icon       text not null,          -- lucide icon name
  color      text not null,          -- hex
  created_at timestamptz not null default now()
);

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('income', 'expense')),
  amount      numeric(12,2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  title       text not null,
  note        text,                  -- "where it was spent"
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

-- one active budget per user
create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  period       text not null check (period in ('weekly', 'monthly')),
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  start_date   date not null default current_date
);

create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index transactions_category_idx  on public.transactions (category_id);

-- ---------- SEED DEFAULT CATEGORIES ----------
insert into public.categories (user_id, name, icon, color) values
  (null, 'Food',     'utensils',       '#D98F3E'),
  (null, 'Travel',   'plane',          '#4A90A4'),
  (null, 'Bills',    'receipt',        '#8C6BB1'),
  (null, 'Shopping', 'shopping-bag',   '#C4607A'),
  (null, 'Health',   'heart-pulse',    '#5FA96B'),
  (null, 'Fun',      'party-popper',   '#E0B13A'),
  (null, 'Other',    'circle-ellipsis','#8A8A7A');

-- ---------- AUTO-CREATE PROFILE ON SIGNUP ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

-- profiles
create policy "profiles: read own"   on public.profiles for select using (id = (select auth.uid()));
create policy "profiles: insert own" on public.profiles for insert with check (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles for update using (id = (select auth.uid()));

-- categories: see built-ins + own, edit only own
create policy "categories: read"   on public.categories for select
  using (user_id is null or user_id = (select auth.uid()));
create policy "categories: insert" on public.categories for insert
  with check (user_id = (select auth.uid()));
create policy "categories: update" on public.categories for update
  using (user_id = (select auth.uid()));
create policy "categories: delete" on public.categories for delete
  using (user_id = (select auth.uid()));

-- transactions + budgets: full access to own rows only
create policy "transactions: own" on public.transactions for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "budgets: own" on public.budgets for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
