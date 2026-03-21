-- ════════════════════════════════════════════════════════════════
--  Samouraï Learn — Schema initial
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── BADGES (définitions statiques) ──────────────────────────────
create table if not exists public.badges (
  id               text primary key,
  name             text        not null,
  description      text        not null,
  icon             text        not null,
  condition_type   text        not null,
  condition_value  integer     not null,
  created_at       timestamptz default now()
);

insert into public.badges (id, name, description, icon, condition_type, condition_value) values
  ('first_step',   'Premier Pas',        'Complète ta première révision',         '🌸', 'reviews',  1),
  ('streak_3',     'Flamme Naissante',   '3 jours de suite',                      '🔥', 'streak',   3),
  ('streak_7',     'Guerrier Assidu',    '7 jours de suite',                      '⚔️', 'streak',   7),
  ('streak_30',    'Légende Vivante',    '30 jours de suite',                     '🏯', 'streak',  30),
  ('level_5',      'Apprenti Samouraï', 'Atteins le niveau 5',                   '🗡️', 'level',    5),
  ('level_10',     'Samouraï Confirmé', 'Atteins le niveau 10',                  '🎌', 'level',   10),
  ('level_25',     'Maître du Dojo',    'Atteins le niveau 25',                  '⛩️', 'level',   25),
  ('reviews_100',  'Centurion',          '100 révisions complétées',              '📚', 'reviews', 100),
  ('reviews_500',  'Érudit',             '500 révisions complétées',              '🎓', 'reviews', 500),
  ('perfect_10',   'Perfection',         '10 réponses correctes d''affilée',      '✨', 'perfect_session', 10)
on conflict (id) do nothing;

-- ── USER PROFILES ────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id                uuid        primary key references auth.users(id) on delete cascade,
  username          text        unique,
  avatar_skin       text        default 'samurai' check (avatar_skin in ('samurai','kawaii','shinobi')),
  level             integer     default 1 check (level between 1 and 50),
  xp                integer     default 0 check (xp >= 0),
  xp_to_next_level  integer     default 1000,
  streak            integer     default 0,
  longest_streak    integer     default 0,
  last_activity_date date,
  total_reviews     integer     default 0,
  correct_reviews   integer     default 0,
  xp_this_week      integer     default 0,
  week_start        date        default date_trunc('week', now())::date,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── VOCAB REVIEWS (SRS) ──────────────────────────────────────────
create table if not exists public.vocab_reviews (
  id               uuid        default uuid_generate_v4() primary key,
  user_id          uuid        not null references public.user_profiles(id) on delete cascade,
  vocab_id         integer     not null,
  srs_level        integer     default 0 check (srs_level between 0 and 9),
  next_review_at   timestamptz default now(),
  last_reviewed_at timestamptz,
  correct_count    integer     default 0,
  incorrect_count  integer     default 0,
  created_at       timestamptz default now(),
  unique (user_id, vocab_id)
);

-- ── USER BADGES ──────────────────────────────────────────────────
create table if not exists public.user_badges (
  id         uuid        default uuid_generate_v4() primary key,
  user_id    uuid        not null references public.user_profiles(id) on delete cascade,
  badge_id   text        not null references public.badges(id),
  earned_at  timestamptz default now(),
  unique (user_id, badge_id)
);

-- ── DAILY QUESTS ─────────────────────────────────────────────────
create table if not exists public.daily_quests (
  id               uuid        default uuid_generate_v4() primary key,
  user_id          uuid        not null references public.user_profiles(id) on delete cascade,
  quest_date       date        not null default current_date,
  quest_type       text        not null check (quest_type in ('review','learn_new','games','streak')),
  target           integer     not null,
  current_progress integer     default 0,
  xp_reward        integer     not null,
  completed        boolean     default false,
  completed_at     timestamptz,
  created_at       timestamptz default now(),
  unique (user_id, quest_date, quest_type)
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────
alter table public.user_profiles  enable row level security;
alter table public.vocab_reviews   enable row level security;
alter table public.user_badges     enable row level security;
alter table public.daily_quests    enable row level security;
alter table public.badges          enable row level security;

-- user_profiles
create policy "own profile read"   on public.user_profiles for select using (true);
create policy "own profile update" on public.user_profiles for update using (auth.uid() = id);

-- vocab_reviews
create policy "own reviews"        on public.vocab_reviews for all using (auth.uid() = user_id);

-- user_badges
create policy "own badges read"    on public.user_badges for select using (auth.uid() = user_id);
create policy "own badges insert"  on public.user_badges for insert with check (auth.uid() = user_id);

-- daily_quests
create policy "own quests"         on public.daily_quests for all using (auth.uid() = user_id);

-- badges (public read)
create policy "badges public read" on public.badges for select using (true);

-- ── TRIGGER : auto-create profile on signup ──────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_uname text;
  final_uname text;
  counter     integer := 0;
begin
  base_uname  := regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g');
  if length(base_uname) < 3 then base_uname := 'samurai' || base_uname; end if;
  final_uname := base_uname;
  loop
    begin
      insert into public.user_profiles (id, username) values (new.id, final_uname);
      exit;
    exception when unique_violation then
      counter     := counter + 1;
      final_uname := base_uname || counter::text;
    end;
  end loop;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── TRIGGER : updated_at ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

-- ── FUNCTION : XP threshold per level ───────────────────────────
create or replace function public.xp_for_level(p_level integer)
returns integer language sql immutable as $$
  select (p_level * p_level * 100)::integer;
$$;

-- ── FUNCTION : add_xp (handles level-up) ────────────────────────
create or replace function public.add_xp(p_user_id uuid, p_amount integer)
returns jsonb language plpgsql security definer as $$
declare
  v   public.user_profiles%rowtype;
  nx  integer;
  nl  integer;
  lu  boolean := false;
  ws  date;
begin
  select * into v from public.user_profiles where id = p_user_id for update;
  nx := v.xp + p_amount;
  nl := v.level;
  ws := date_trunc('week', now())::date;

  while nl < 50 and nx >= public.xp_for_level(nl) loop
    nx := nx - public.xp_for_level(nl);
    nl := nl + 1;
    lu := true;
  end loop;

  update public.user_profiles set
    xp              = nx,
    level           = nl,
    xp_to_next_level = public.xp_for_level(nl),
    xp_this_week   = case when week_start = ws then xp_this_week + p_amount else p_amount end,
    week_start      = ws
  where id = p_user_id;

  return jsonb_build_object('new_xp',nl,'new_level',nl,'leveled_up',lu,'xp_added',p_amount);
end;
$$;

-- ── INDEXES ──────────────────────────────────────────────────────
create index if not exists idx_vr_user_next     on public.vocab_reviews  (user_id, next_review_at);
create index if not exists idx_vr_user_level    on public.vocab_reviews  (user_id, srs_level);
create index if not exists idx_dq_user_date     on public.daily_quests   (user_id, quest_date);
create index if not exists idx_up_xp_week       on public.user_profiles  (xp_this_week desc);
