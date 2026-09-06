create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    name,
    degree,
    start_year,
    target_direction,
    current_year
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    coalesce(new.raw_user_meta_data ->> 'degree', 'BE ICT'),
    nullif(new.raw_user_meta_data ->> 'start_year', '')::integer,
    coalesce(
      new.raw_user_meta_data ->> 'target_direction',
      'AI Systems / AI Engineering + Systems'
    ),
    1
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();