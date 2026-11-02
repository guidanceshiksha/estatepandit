-- Run once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists public.pe_kv (
  ns text not null,
  k  text not null,
  v  jsonb not null,
  primary key (ns, k)
);

-- Only the server (service_role key) may touch this table; the public/anon key gets nothing.
alter table public.pe_kv enable row level security;
