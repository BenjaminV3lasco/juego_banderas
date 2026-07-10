create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  mode text not null,
  correct integer not null check (correct >= 0),
  wrong integer not null check (wrong >= 0),
  total integer not null check (total = correct + wrong and total > 0),
  created_at timestamptz not null default now()
);

alter table public.game_results enable row level security;

create policy "anyone can submit game results"
on public.game_results
for insert
to anon, authenticated
with check (true);

create index if not exists game_results_mode_created_at_idx
on public.game_results (mode, created_at desc);
