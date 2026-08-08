-- Schema for the energy-radar app.
-- Mirrors ProjectSchema / SignalSchema in actions/types.ts.
-- Paste into the Supabase dashboard -> SQL Editor -> Run.
--
-- QUOTING: actions/server.ts does `select("*")` and parses raw rows with Zod,
-- which expects the exact camelCase keys "capacityMw", "updatedMinutesAgo" and
-- "whyNow". Unquoted Postgres identifiers fold to lowercase, so those columns
-- MUST stay double-quoted or ProjectArray.safeParse() fails. "time" is quoted
-- because TIME is a Postgres type keyword.
--
-- NUMERIC TYPES: double precision, not numeric. PostgREST serializes `numeric`
-- as a JSON string, which Zod's z.number() rejects.

drop table if exists public.signals cascade;
drop table if exists public.projects cascade;

create table public.projects (
  id                   text primary key,
  name                 text             not null,
  city                 text             not null,
  state                text             not null,
  lat                  double precision not null,
  lng                  double precision not null,
  category             text             not null,
  technology           text             not null,
  "capacityMw"         double precision not null,
  stage                text             not null,
  score                double precision not null,
  momentum             text             not null,
  confidence           double precision not null,
  signals              double precision not null,
  "updatedMinutesAgo"  double precision not null,
  "whyNow"             text             not null,

  -- Must match the EnergyCategory union in lib/types.ts (the UI switches on these).
  constraint projects_category_check check (
    category in ('Generation', 'Data Center', 'Storage', 'Transmission', 'Renewable', 'Industrial')
  ),
  -- Must match the Momentum union in lib/types.ts.
  constraint projects_momentum_check check (
    momentum in ('Accelerating', 'Watch', 'Stalled')
  )
);

-- getProjects() orders by confidence desc.
create index projects_confidence_idx on public.projects (confidence desc);

create table public.signals (
  id           text primary key,
  project      text not null,
  category     text not null,
  source       text not null,
  "time"       text not null,
  importance   text not null,

  constraint signals_importance_check check (
    importance in ('Low', 'Medium', 'High')
  )
);

-- getSignals() filters on project.
create index signals_project_idx on public.signals (project);


-- ---------------------------------------------------------------------------
-- Row Level Security
-- The app reads with the publishable (anon) key. Without an explicit select
-- policy, RLS makes every read return an empty array instead of an error.
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.signals  enable row level security;

drop policy if exists "projects are publicly readable" on public.projects;
create policy "projects are publicly readable"
  on public.projects
  for select
  to anon, authenticated
  using (true);

drop policy if exists "signals are publicly readable" on public.signals;
create policy "signals are publicly readable"
  on public.signals
  for select
  to anon, authenticated
  using (true);

-- Supabase normally applies these via default privileges, but they are stated
-- explicitly so the script is safe to run on a project whose defaults were changed.
grant usage on schema public to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant select on public.signals  to anon, authenticated;

-- Writes (syncProjects / addProjects / addSignals) are deliberately NOT granted
-- to anon; run them with the service-role key. If you want the browser client to
-- write during the hackathon, uncomment the block below.
--
-- create policy "projects are publicly writable"
--   on public.projects for all
--   to anon, authenticated
--   using (true) with check (true);
-- grant insert, update, delete on public.projects to anon, authenticated;
