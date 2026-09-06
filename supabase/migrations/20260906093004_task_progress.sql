create table public.task_progress (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  task_id text not null,

  status text not null default 'todo'
    check (
      status in ('todo', 'in_progress', 'done', 'skipped')
    ),

  notes text,

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, task_id)
);

create index task_progress_user_id_idx
  on public.task_progress(user_id);

create index task_progress_task_id_idx
  on public.task_progress(task_id);

create trigger task_progress_updated_at
before update on public.task_progress
for each row
execute function public.set_updated_at();

alter table public.task_progress enable row level security;

revoke all on table public.task_progress from anon, authenticated;

grant select, insert, update, delete
on public.task_progress
to authenticated;

create policy "task_progress_select_own"
on public.task_progress
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "task_progress_insert_own"
on public.task_progress
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "task_progress_update_own"
on public.task_progress
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "task_progress_delete_own"
on public.task_progress
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);