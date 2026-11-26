-- ============================================================================
-- ENSAE Dakar Nexus — Schéma PostgreSQL / Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase.
-- ============================================================================

-- 1. Table des profils étudiants (liée à auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null default 'Étudiant ENSAE',
  promo text not null default 'ISE2' check (promo in ('AS1', 'AS2', 'AS3', 'ISEP1', 'ISEP2', 'ISE1 CL', 'ISE1 Math', 'ISE1 Eco', 'ISE2', 'ISE3')),
  specialty text not null default 'Statistique & Data Science',
  skills text[] not null default array['Python', 'R'],
  looking_for text[] not null default array['Économétrie'],
  project_idea text not null default '',
  whatsapp_handle text not null default '',
  discord_handle text not null default '',
  availability text not null default 'Disponible' check (availability in ('Disponible', 'En projet')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profils visibles par tous les étudiants connectés"
  on public.profiles for select
  using (true);

create policy "Chaque étudiant modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Chaque étudiant insère son propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Table des ressources académiques
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subject text not null check (subject in ('Statistiques', 'Économétrie', 'Data Science', 'Python / R', 'Probabilités', 'Français', 'Anglais')),
  file_type text not null check (file_type in ('PDF', 'R', 'Python', 'Notebook')),
  file_size text not null default '1.0 MB',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  promo text not null,
  badge text not null default '100% Validé',
  downloads integer not null default 0,
  file_url text not null default '#',
  created_at timestamptz not null default now()
);

alter table public.resources enable row level security;

create policy "Ressources visibles par tous"
  on public.resources for select
  using (true);

create policy "Utilisateurs connectés peuvent publier une ressource"
  on public.resources for insert
  with check (auth.role() = 'authenticated');

-- 3. Table d'historique d'activité étudiant
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('upload', 'download', 'qcm', 'match')),
  title text not null,
  detail text not null,
  badge text,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "Activités visibles par le propriétaire"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "Insertion d'activité par le propriétaire"
  on public.activities for insert
  with check (auth.uid() = user_id);

-- 4. Trigger pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, promo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'promo', 'ISE 2')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Salons de discussion temps réel (multi-appareils)
create table if not exists public.chat_messages (
  id text primary key,
  group_id text not null,
  author text not null,
  promo text not null,
  specialty text,
  content text not null,
  created_at text not null,
  created_ts bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.chat_messages enable row level security;

create policy "Lecture publique des messages"
  on public.chat_messages for select using (true);

create policy "Insertion publique des messages"
  on public.chat_messages for insert with check (true);

-- 6. Groupes d'étude et projets (synchronisation Vercel multi-ordinateurs)
create table if not exists public.study_groups (
  id text primary key,
  name text not null,
  subject text not null,
  promo text not null,
  code text unique not null,
  members text[] not null default '{}',
  created_by text not null,
  created_at timestamptz not null default now()
);

alter table public.study_groups enable row level security;

create policy "Lecture publique des groupes"
  on public.study_groups for select using (true);

create policy "Création publique des groupes"
  on public.study_groups for insert with check (true);

create policy "Mise à jour publique des groupes"
  on public.study_groups for update using (true);
