-- Run this in Supabase SQL Editor
-- 1) Creates rules + editors tables
-- 2) Applies RLS so everyone can read rules, only approved editors can write

create extension if not exists pgcrypto;

create table if not exists public.rules (
    id uuid primary key default gen_random_uuid(),
    position integer not null unique check (position > 0),
    text text not null check (char_length(btrim(text)) between 4 and 500),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.editors (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'rules_position_positive'
          and conrelid = 'public.rules'::regclass
    ) then
        alter table public.rules
            add constraint rules_position_positive check (position > 0);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'rules_text_length_guard'
          and conrelid = 'public.rules'::regclass
    ) then
        alter table public.rules
            add constraint rules_text_length_guard check (char_length(btrim(text)) between 4 and 500);
    end if;
end;
$$;

create index if not exists rules_position_idx on public.rules(position);
create index if not exists rules_updated_at_idx on public.rules(updated_at desc);
create unique index if not exists rules_text_unique_idx on public.rules ((lower(btrim(text))));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_rules_updated_at on public.rules;
create trigger trg_rules_updated_at
before update on public.rules
for each row execute function public.set_updated_at();

alter table public.rules enable row level security;
alter table public.editors enable row level security;

drop policy if exists "rules_read_public" on public.rules;
create policy "rules_read_public"
on public.rules
for select
using (true);

drop policy if exists "rules_write_editors" on public.rules;
create policy "rules_write_editors"
on public.rules
for all
using (
    exists (
        select 1
        from public.editors e
        where e.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.editors e
        where e.user_id = auth.uid()
    )
);

drop policy if exists "editors_self_read" on public.editors;
create policy "editors_self_read"
on public.editors
for select
using (user_id = auth.uid());

drop policy if exists "editors_no_client_write" on public.editors;
create policy "editors_no_client_write"
on public.editors
for all
using (false)
with check (false);

-- Seed default rules once
insert into public.rules (position, text)
values
    (1, 'NSFW is eternally forbidden and is never allowed in any form.'),
    (2, 'Racism, hate speech, or discrimination is forbidden across all realms.'),
    (3, 'Spamming is allowed only if it does not intentionally harm or break the server.'),
    (4, 'Advertising or promoting unrelated servers is forbidden.'),
    (5, 'Impersonation of members, bots, or entities is forbidden.'),
    (6, 'Malicious links, scams, or harmful content are forbidden.'),
    (7, 'Respect channel order and post content where it belongs.'),
    (8, 'Evading punishments or bypassing restrictions is forbidden.'),
    (9, 'Excessive disruption intended to ruin others experience is forbidden.'),
    (10, 'Alternate accounts used for abuse or evasion are forbidden.'),
    (11, 'Use reason and restraint. Loopholes do not grant immunity.')
on conflict (position) do nothing;

-- Add yourself as editor (replace with your auth.users id)
-- insert into public.editors (user_id) values ('00000000-0000-0000-0000-000000000000');
