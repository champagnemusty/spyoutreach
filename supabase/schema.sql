-- SpyOutreach — Core schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- users — mirrors auth.users, holds the credit balance
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  credits    integer not null default 3 check (credits >= 0),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- Auto-provision a public.users row (3 free credits) whenever someone
-- signs up via magic link, so there's no separate "onboarding" step.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- leads_batches — Lead Cleanser uploads
-- ─────────────────────────────────────────────────────────────
create table if not exists public.leads_batches (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users (id) on delete cascade,
  original_filename  text not null,
  status             text not null default 'pending'
                        check (status in ('pending', 'processing', 'completed', 'failed')),
  total_leads        integer not null default 0,
  cleaned_leads      integer not null default 0,
  input_storage_path  text,
  output_storage_path text,
  credits_used       integer not null default 1,
  error_message      text,
  created_at         timestamptz not null default now(),
  completed_at       timestamptz
);

create index if not exists leads_batches_user_id_idx on public.leads_batches (user_id);

alter table public.leads_batches enable row level security;

create policy "users manage own leads_batches"
  on public.leads_batches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- pdf_reports — Spy Brief Generator jobs
-- ─────────────────────────────────────────────────────────────
create table if not exists public.pdf_reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  brand_name     text not null,
  brand_url      text,
  status         text not null default 'pending'
                    check (status in ('pending', 'processing', 'completed', 'failed')),
  pdf_storage_path text,
  credits_used   integer not null default 1,
  error_message  text,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create index if not exists pdf_reports_user_id_idx on public.pdf_reports (user_id);

alter table public.pdf_reports enable row level security;

create policy "users manage own pdf_reports"
  on public.pdf_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- credit_topups — idempotency ledger for the Lemon Squeezy
-- "Check My Payment & Refill Credits" button. Prevents double-crediting
-- if the user mashes the button for the same order.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.credit_topups (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users (id) on delete cascade,
  lemon_squeezy_order_id text not null unique,
  credits_added          integer not null,
  created_at             timestamptz not null default now()
);

alter table public.credit_topups enable row level security;

create policy "users read own topups"
  on public.credit_topups for select
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Atomic credit helpers — call these from API routes (with the
-- service-role key) instead of read-then-write from app code, so two
-- concurrent requests can't push credits negative or double-refill.
-- ─────────────────────────────────────────────────────────────
create or replace function public.deduct_credit(p_user_id uuid, p_amount integer default 1)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.users
     set credits = credits - p_amount
   where id = p_user_id
     and credits >= p_amount;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

create or replace function public.add_credits_for_order(
  p_user_id uuid,
  p_order_id text,
  p_amount integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.credit_topups (user_id, lemon_squeezy_order_id, credits_added)
  values (p_user_id, p_order_id, p_amount)
  on conflict (lemon_squeezy_order_id) do nothing;

  if not found then
    return false; -- already credited for this order
  end if;

  update public.users set credits = credits + p_amount where id = p_user_id;
  return true;
end;
$$;
