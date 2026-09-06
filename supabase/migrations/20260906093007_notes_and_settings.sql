create table public.notes (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  external_id text not null,

  title text,
  body text not null,
  tags text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, external_id)
);

create index notes_user_id_idx
  on public.notes(user_id);


create table public.user_settings (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  focus_year integer not null default 1
    check (focus_year between 1 and 4),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create trigger notes_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

create trigger user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();


alter table public.notes enable row level security;
alter table public.user_settings enable row level security;


revoke all on table public.notes from anon, authenticated;
revoke all on table public.user_settings from anon, authenticated;


grant select, insert, update, delete
on public.notes
to authenticated;

grant select, insert, update, delete
on public.user_settings
to authenticated;


create policy "notes_select_own"
on public.notes
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "notes_insert_own"
on public.notes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "notes_update_own"
on public.notes
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "notes_delete_own"
on public.notes
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "user_settings_select_own"
on public.user_settings
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "user_settings_insert_own"
on public.user_settings
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "user_settings_update_own"
on public.user_settings
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "user_settings_delete_own"
on public.user_settings
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);