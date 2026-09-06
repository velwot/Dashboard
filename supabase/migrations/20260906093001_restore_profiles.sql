create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  degree text default 'BE ICT',
  start_year integer,
  target_direction text,
  current_year integer default 1
    check (current_year between 1 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
