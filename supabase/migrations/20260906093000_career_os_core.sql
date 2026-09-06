
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null check (year between 1 and 4),
  title text not null,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'completed', 'paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  year integer check (year between 1 and 4),
  due_date date,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  link text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  problem text,
  stack text,
  role text,
  result text,
  year integer check (year between 1 and 4),
  status text not null default 'active'
    check (status in ('idea', 'active', 'completed', 'archived')),
  github_url text,
  demo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  target_level integer default 1 check (target_level between 1 and 5),
  current_level integer default 0 check (current_level between 0 and 5),
  year integer check (year between 1 and 4),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  organization text,
  how_met text,
  last_contact date,
  next_action text,
  linkedin_url text,
  github_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null
    check (type in (
      'Hackathon',
      'Internship',
      'Research',
      'Competition',
      'Fellowship',
      'Event',
      'Open Source',
      'Scholarship',
      'Startup',
      'Other'
    )),
  organization text,
  date date,
  deadline date,
  status text not null default 'open'
    check (status in (
      'open',
      'applied',
      'shortlisted',
      'accepted',
      'rejected',
      'done',
      'closed'
    )),
  link text,
  why_it_matters text,
  notes text,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null
    check (type in (
      'Project',
      'Open Source',
      'Competition',
      'Hackathon',
      'Internship',
      'Research',
      'Publication',
      'Talk',
      'Award',
      'Users',
      'Other'
    )),
  result text,
  metric text,
  link text,
  date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_date date not null default current_date,
  shipped text,
  capability text,
  proof_network_opportunity text,
  fake_productivity text,
  next_actions text,
  created_at timestamptz not null default now()
);

create table public.update_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  url text not null,
  description text,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx
  on public.goals(user_id);

create index tasks_user_id_idx
  on public.tasks(user_id);

create index tasks_due_date_idx
  on public.tasks(user_id, due_date);

create index projects_user_id_idx
  on public.projects(user_id);

create index skills_user_id_idx
  on public.skills(user_id);

create index people_user_id_idx
  on public.people(user_id);

create index opportunities_user_id_idx
  on public.opportunities(user_id);

create index opportunities_deadline_idx
  on public.opportunities(user_id, deadline);

create index evidence_user_id_idx
  on public.evidence(user_id);

create index reviews_user_id_idx
  on public.reviews(user_id);

create index update_links_user_id_idx
  on public.update_links(user_id);

