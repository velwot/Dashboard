alter table public.opportunities
  add column if not exists year integer
    check (year between 1 and 4);

alter table public.opportunities
  add column if not exists follow_up_date date;

alter table public.opportunities
  add column if not exists stage text
    check (
      stage in (
        'discovered',
        'shortlisted',
        'preparing',
        'applied',
        'assessment',
        'interview',
        'accepted',
        'rejected',
        'withdrawn'
      )
    );

alter table public.opportunities
  add column if not exists fit integer
    check (fit between 0 and 100);

alter table public.opportunities
  add column if not exists proof_value integer
    check (proof_value between 0 and 100);

alter table public.opportunities
  add column if not exists learning_value integer
    check (learning_value between 0 and 100);

alter table public.opportunities
  add column if not exists contact text;

alter table public.opportunities
  add column if not exists apply_url text;

alter table public.opportunities
  add column if not exists source_url text;

create index if not exists opportunities_stage_idx
  on public.opportunities(user_id, stage);

create index if not exists opportunities_follow_up_idx
  on public.opportunities(user_id, follow_up_date);