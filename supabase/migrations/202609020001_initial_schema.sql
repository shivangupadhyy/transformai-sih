-- TransformAI Phase 2 schema. Run with the Supabase CLI or SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title varchar(140) not null check (char_length(trim(title)) > 0),
  source_type varchar(32) not null default 'text',
  source_text text,
  settings jsonb not null default '{}'::jsonb,
  status varchar(32) not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_updated_idx on public.projects (owner_id, updated_at desc);

create table if not exists public.source_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  filename varchar(255) not null,
  mime_type varchar(120) not null,
  storage_path varchar(500),
  extracted_text text,
  extraction_status varchar(32) not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists source_assets_project_idx on public.source_assets (project_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute procedure public.set_updated_at();

alter table public.projects enable row level security;
alter table public.source_assets enable row level security;

create policy "Users manage their own projects" on public.projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Users manage assets in their projects" on public.source_assets
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  output_type varchar(40) not null,
  content jsonb not null default '{}'::jsonb,
  model varchar(64) not null default 'gpt-4o',
  status varchar(32) not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generations_project_idx on public.generations (project_id);

create table if not exists public.generation_versions (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  version_number int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists generation_versions_gen_idx on public.generation_versions (generation_id);

alter table public.generations enable row level security;
alter table public.generation_versions enable row level security;

create policy "Users manage generations in their projects" on public.generations
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

create policy "Users manage generation versions in their projects" on public.generation_versions
  for all using (exists (
    select 1 from public.generations g
    join public.projects p on p.id = g.project_id
    where g.id = generation_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.generations g
    join public.projects p on p.id = g.project_id
    where g.id = generation_id and p.owner_id = auth.uid()
  ));

insert into storage.buckets (id, name, public)
values ('source-assets', 'source-assets', false)
on conflict (id) do nothing;

-- The API uses the service-role key for uploads. Browser uploads are not enabled.

