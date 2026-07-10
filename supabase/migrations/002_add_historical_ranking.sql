alter table public.game_results
  add column if not exists nickname text not null default 'Invitado',
  add column if not exists is_guest boolean not null default true;

alter table public.game_results
  drop constraint if exists game_results_nickname_length;

alter table public.game_results
  add constraint game_results_nickname_length
  check (char_length(trim(nickname)) between 1 and 20);

grant select on table public.game_results to anon, authenticated;

drop policy if exists "anyone can read historical ranking"
on public.game_results;

create policy "anyone can read historical ranking"
on public.game_results
for select
to anon, authenticated
using (mode not in ('daily', 'detective', 'wordle'));

create index if not exists game_results_ranking_idx
on public.game_results (mode, correct desc, total desc, created_at asc);
