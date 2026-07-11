alter table public.game_results
  add column if not exists duration_seconds integer not null default 0,
  add column if not exists difficulty text not null default 'normal',
  add column if not exists timer_limit_seconds integer;

alter table public.game_results
  drop constraint if exists game_results_duration_non_negative,
  drop constraint if exists game_results_valid_difficulty,
  drop constraint if exists game_results_timer_positive;

alter table public.game_results
  add constraint game_results_duration_non_negative check (duration_seconds >= 0),
  add constraint game_results_valid_difficulty check (difficulty in ('easy', 'normal', 'hard')),
  add constraint game_results_timer_positive check (timer_limit_seconds is null or timer_limit_seconds > 0);

create index if not exists game_results_competitive_ranking_idx
on public.game_results (mode, difficulty, correct desc, total desc, duration_seconds asc, created_at asc);
