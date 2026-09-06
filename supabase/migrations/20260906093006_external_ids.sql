alter table public.tasks
  add column if not exists external_id text;

alter table public.projects
  add column if not exists external_id text;

alter table public.people
  add column if not exists external_id text;

alter table public.opportunities
  add column if not exists external_id text;

alter table public.evidence
  add column if not exists external_id text;

alter table public.reviews
  add column if not exists external_id text;


create unique index if not exists tasks_user_external_id_idx
  on public.tasks(user_id, external_id)
  where external_id is not null;

create unique index if not exists projects_user_external_id_idx
  on public.projects(user_id, external_id)
  where external_id is not null;

create unique index if not exists people_user_external_id_idx
  on public.people(user_id, external_id)
  where external_id is not null;

create unique index if not exists opportunities_user_external_id_idx
  on public.opportunities(user_id, external_id)
  where external_id is not null;

create unique index if not exists evidence_user_external_id_idx
  on public.evidence(user_id, external_id)
  where external_id is not null;

create unique index if not exists reviews_user_external_id_idx
  on public.reviews(user_id, external_id)
  where external_id is not null;