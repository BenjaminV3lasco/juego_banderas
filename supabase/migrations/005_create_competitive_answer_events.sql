create table if not exists public.answer_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_player_id uuid not null,
  session_id uuid not null,
  country_code text not null,
  game_mode text not null,
  difficulty text not null,
  language text not null,
  correct boolean not null,
  response_time_ms integer not null,
  attempts_used integer not null default 1,
  source text not null default 'real',
  created_at timestamptz not null default now(),

  constraint answer_events_country_code_format check (country_code ~ '^[A-Z]{3}$'),
  constraint answer_events_competitive_mode check (
    game_mode in ('world', 'sovereign', 'capitals', 'americas', 'europe', 'asia', 'africa')
  ),
  constraint answer_events_valid_difficulty check (difficulty in ('easy', 'normal', 'hard')),
  constraint answer_events_valid_language check (language in ('es', 'en')),
  constraint answer_events_response_time_range check (response_time_ms between 0 and 3600000),
  constraint answer_events_attempts_range check (attempts_used between 1 and 10),
  constraint answer_events_real_source check (source = 'real')
);

alter table public.answer_events enable row level security;

revoke all on table public.answer_events from anon, authenticated;
grant insert on table public.answer_events to anon, authenticated;

drop policy if exists "submit competitive answer events"
on public.answer_events;

create policy "submit competitive answer events"
on public.answer_events
for insert
to anon, authenticated
with check (
  source = 'real'
  and game_mode in ('world', 'sovereign', 'capitals', 'americas', 'europe', 'asia', 'africa')
);

create index if not exists answer_events_country_mode_created_idx
on public.answer_events (country_code, game_mode, created_at desc);

create index if not exists answer_events_session_idx
on public.answer_events (session_id);
