-- ============================================================
-- CAREER OS SECURITY
-- RLS + grants + updated_at triggers
-- ============================================================


-- ============================================================
-- 1. UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 2. UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger goals_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

create trigger tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create trigger projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger skills_updated_at
before update on public.skills
for each row
execute function public.set_updated_at();

create trigger people_updated_at
before update on public.people
for each row
execute function public.set_updated_at();

create trigger opportunities_updated_at
before update on public.opportunities
for each row
execute function public.set_updated_at();

create trigger evidence_updated_at
before update on public.evidence
for each row
execute function public.set_updated_at();

create trigger update_links_updated_at
before update on public.update_links
for each row
execute function public.set_updated_at();


-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.people enable row level security;
alter table public.opportunities enable row level security;
alter table public.evidence enable row level security;
alter table public.reviews enable row level security;
alter table public.update_links enable row level security;


-- ============================================================
-- 4. REMOVE TABLE ACCESS FROM ANON + AUTHENTICATED
--    We will grant it back explicitly below.
-- ============================================================

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.goals from anon, authenticated;
revoke all on table public.tasks from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.skills from anon, authenticated;
revoke all on table public.people from anon, authenticated;
revoke all on table public.opportunities from anon, authenticated;
revoke all on table public.evidence from anon, authenticated;
revoke all on table public.reviews from anon, authenticated;
revoke all on table public.update_links from anon, authenticated;


-- ============================================================
-- 5. GRANT NORMAL CRUD TO AUTHENTICATED USERS
--    RLS policies below decide which rows they can access.
-- ============================================================

grant select, insert, update, delete
on public.profiles,
   public.goals,
   public.tasks,
   public.projects,
   public.skills,
   public.people,
   public.opportunities,
   public.evidence,
   public.reviews,
   public.update_links
to authenticated;


-- ============================================================
-- 6. PROFILES POLICIES
--
-- profiles.id = auth.users.id
-- ============================================================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (
  (select auth.uid()) = id
);


-- ============================================================
-- 7. GOALS POLICIES
-- ============================================================

create policy "goals_select_own"
on public.goals
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "goals_insert_own"
on public.goals
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "goals_update_own"
on public.goals
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "goals_delete_own"
on public.goals
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 8. TASKS POLICIES
-- ============================================================

create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "tasks_insert_own"
on public.tasks
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "tasks_update_own"
on public.tasks
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 9. PROJECTS POLICIES
-- ============================================================

create policy "projects_select_own"
on public.projects
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "projects_update_own"
on public.projects
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 10. SKILLS POLICIES
-- ============================================================

create policy "skills_select_own"
on public.skills
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "skills_insert_own"
on public.skills
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "skills_update_own"
on public.skills
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "skills_delete_own"
on public.skills
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 11. PEOPLE POLICIES
-- ============================================================

create policy "people_select_own"
on public.people
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "people_insert_own"
on public.people
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "people_update_own"
on public.people
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "people_delete_own"
on public.people
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 12. OPPORTUNITIES POLICIES
-- ============================================================

create policy "opportunities_select_own"
on public.opportunities
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "opportunities_insert_own"
on public.opportunities
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "opportunities_update_own"
on public.opportunities
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "opportunities_delete_own"
on public.opportunities
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 13. EVIDENCE POLICIES
-- ============================================================

create policy "evidence_select_own"
on public.evidence
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "evidence_insert_own"
on public.evidence
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "evidence_update_own"
on public.evidence
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "evidence_delete_own"
on public.evidence
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 14. REVIEWS POLICIES
-- ============================================================

create policy "reviews_select_own"
on public.reviews
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "reviews_insert_own"
on public.reviews
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "reviews_update_own"
on public.reviews
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "reviews_delete_own"
on public.reviews
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 15. UPDATE LINKS POLICIES
-- ============================================================

create policy "update_links_select_own"
on public.update_links
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

create policy "update_links_insert_own"
on public.update_links
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

create policy "update_links_update_own"
on public.update_links
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

create policy "update_links_delete_own"
on public.update_links
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);
