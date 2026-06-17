create extension if not exists "pgcrypto";

create type user_role as enum ('viewer', 'producer', 'admin');
create type price_status as enum ('pending', 'approved', 'rejected');
create type unit_kind as enum ('kg', 'L');
create type retailer_kind as enum ('Mercadona', 'Carrefour', 'Dia');
create type scrape_status as enum ('success', 'failed', 'skipped');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

create table producer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  display_name text not null,
  province text not null,
  production_type text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table products (
  id text primary key,
  name text not null,
  category text not null,
  base_unit unit_kind not null,
  aliases text[] not null default '{}'
);

create table retailer_prices (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id),
  retailer retailer_kind not null,
  source_name text not null,
  source_url text not null,
  original_price numeric(10, 2) not null check (original_price > 0),
  original_unit_label text not null,
  package_size numeric(10, 3) not null check (package_size > 0),
  package_unit unit_kind not null,
  normalized_price numeric(10, 2) not null check (normalized_price > 0),
  captured_at timestamptz not null default now(),
  unique (product_id, retailer, captured_at)
);

create table producer_prices (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id),
  producer_id uuid not null references producer_profiles(id) on delete cascade,
  normalized_price numeric(10, 2) not null check (normalized_price > 0),
  unit unit_kind not null,
  province text not null,
  effective_date date not null,
  notes text,
  status price_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table scrape_runs (
  id uuid primary key default gen_random_uuid(),
  retailer retailer_kind not null,
  status scrape_status not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  inserted_rows integer not null default 0,
  message text
);

alter table profiles enable row level security;
alter table producer_profiles enable row level security;
alter table products enable row level security;
alter table retailer_prices enable row level security;
alter table producer_prices enable row level security;
alter table scrape_runs enable row level security;

-- Helper function to check if the current user is an admin without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
security definer
set search_path = public
language plpgsql as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Trigger to automatically create a profile in public.profiles when a user signs up
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "Public products are readable" on products for select using (true);
create policy "Public retailer prices are readable" on retailer_prices for select using (true);
create policy "Approved producer prices are readable" on producer_prices for select using (status = 'approved');
create policy "Scrape runs readable by admins" on scrape_runs for select using (public.is_admin());

create policy "Users read own profile" on profiles for select using (id = auth.uid());
create policy "Admins read all profiles" on profiles for select using (public.is_admin());

create policy "Producers read own producer profile" on producer_profiles for select using (user_id = auth.uid());
create policy "Producers manage own producer profile" on producer_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins read producer profiles" on producer_profiles for select using (public.is_admin());

create policy "Producers insert own pending prices" on producer_prices for insert with check (
  status = 'pending'
  and exists (
    select 1 from producer_profiles
    where producer_profiles.id = producer_id
      and producer_profiles.user_id = auth.uid()
  )
);

create policy "Producers read own prices" on producer_prices for select using (
  exists (
    select 1 from producer_profiles
    where producer_profiles.id = producer_id
      and producer_profiles.user_id = auth.uid()
  )
);

create policy "Admins review producer prices" on producer_prices for update using (
  public.is_admin()
) with check (
  public.is_admin()
);

insert into products (id, name, category, base_unit, aliases) values
  ('tomate-pera', 'Tomate pera', 'Hortalizas', 'kg', array['tomate pera granel', 'tomate pera categoria i', 'tomate ensalada pera']),
  ('patata-lavada', 'Patata lavada', 'Tuberculos', 'kg', array['patata nueva lavada', 'patata malla', 'patata blanca']),
  ('leche-entera', 'Leche entera', 'Lacteos', 'L', array['leche entera brik', 'leche entera uht', 'leche vaca entera']),
  ('aceite-oliva-virgen-extra', 'Aceite oliva virgen extra', 'Aceites', 'L', array['aove', 'aceite virgen extra', 'aceite oliva virgen extra botella']),
  ('naranja-mesa', 'Naranja mesa', 'Fruta', 'kg', array['naranja para mesa', 'naranja granel', 'naranja zumo mesa'])
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  base_unit = excluded.base_unit,
  aliases = excluded.aliases;
