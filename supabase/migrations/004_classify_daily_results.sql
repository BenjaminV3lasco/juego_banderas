alter table public.game_results
  add column if not exists is_daily boolean not null default false;

update public.game_results
set is_daily = true
where mode in (
  'daily', 'detective', 'wordle', 'daily-capital', 'capital-wordle',
  'flag-choice', 'geo-connection', 'country-map', 'neighbour-countries'
);

drop policy if exists "anyone can read historical ranking"
on public.game_results;

create policy "anyone can read historical ranking"
on public.game_results
for select
to anon, authenticated
using (is_daily = false);

create index if not exists game_results_daily_created_at_idx
on public.game_results (is_daily, mode, created_at desc);
