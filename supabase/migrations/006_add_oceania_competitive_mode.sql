alter table public.answer_events
  drop constraint if exists answer_events_competitive_mode;

alter table public.answer_events
  add constraint answer_events_competitive_mode check (
    game_mode in ('world', 'sovereign', 'capitals', 'americas', 'europe', 'asia', 'africa', 'oceania')
  );

drop policy if exists "submit competitive answer events"
on public.answer_events;

create policy "submit competitive answer events"
on public.answer_events
for insert
to anon, authenticated
with check (
  source = 'real'
  and game_mode in ('world', 'sovereign', 'capitals', 'americas', 'europe', 'asia', 'africa', 'oceania')
);
