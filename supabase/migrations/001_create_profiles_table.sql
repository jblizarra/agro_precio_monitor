-- Crear tabla de perfiles de usuarios
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  display_name text,
  role text not null default 'viewer' check (role in ('admin', 'producer', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índice para email
create index profiles_email_idx on public.profiles(email);

-- Crear función para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Crear trigger para updated_at
create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Habilitar RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Crear política para que cada usuario vea su propio perfil
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Crear política para que los admins vean todos los perfiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Crear política para que los admins actualicen perfiles
create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
