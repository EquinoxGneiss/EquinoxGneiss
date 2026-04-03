-- ─────────────────────────────────────────────────────────────────────────────
-- V2 Whitelabel Portfolio Schema
-- Run this in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per invited user. The username becomes the public URL slug.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public can read profiles"
  on public.profiles for select using (true);

create policy "Owner can insert profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Owner can update profile"
  on public.profiles for update using (auth.uid() = id);

-- ─── portfolio_data ───────────────────────────────────────────────────────────
-- One row per user. Stores hero and social links as JSONB blobs.
create table if not exists public.portfolio_data (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles(id) on delete cascade,
  hero        jsonb not null default '{}'::jsonb,
  social      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.portfolio_data enable row level security;

create policy "Public can read portfolio_data"
  on public.portfolio_data for select using (true);

create policy "Owner can insert portfolio_data"
  on public.portfolio_data for insert with check (auth.uid() = user_id);

create policy "Owner can update portfolio_data"
  on public.portfolio_data for update using (auth.uid() = user_id);

-- ─── achievements ─────────────────────────────────────────────────────────────
create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default '',
  description text not null default '',
  image       text not null default '',
  date        text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "Public can read achievements"
  on public.achievements for select using (true);

create policy "Owner can manage achievements"
  on public.achievements for all using (auth.uid() = user_id);

-- ─── projects ─────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default '',
  description text not null default '',
  image       text not null default '',
  live_url    text not null default '',
  github_url  text not null default '',
  tech        text[] not null default '{}',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Public can read projects"
  on public.projects for select using (true);

create policy "Owner can manage projects"
  on public.projects for all using (auth.uid() = user_id);

-- ─── inquiries ────────────────────────────────────────────────────────────────
-- Anyone can submit; only the portfolio owner can read/update/delete.
create table if not exists public.inquiries (
  id                 uuid primary key default gen_random_uuid(),
  portfolio_user_id  uuid not null references public.profiles(id) on delete cascade,
  name               text not null,
  email              text not null,
  subject            text not null default '',
  message            text not null,
  read               boolean not null default false,
  created_at         timestamptz not null default now()
);

alter table public.inquiries enable row level security;

create policy "Public can submit inquiries"
  on public.inquiries for insert with check (true);

create policy "Owner can read inquiries"
  on public.inquiries for select using (auth.uid() = portfolio_user_id);

create policy "Owner can update inquiry"
  on public.inquiries for update using (auth.uid() = portfolio_user_id);

create policy "Owner can delete inquiry"
  on public.inquiries for delete using (auth.uid() = portfolio_user_id);
