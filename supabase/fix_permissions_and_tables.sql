-- ============================================================================
-- ENSAE Dakar Nexus — Correctif complet Permissions & Tables manquantes
-- Copiez-collez tout ce script dans Supabase -> SQL Editor -> Run
-- ============================================================================

-- 1. Droits d'accès complets pour anon et authenticated sur le schéma public
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- 2. Assurer l'existence des nouvelles tables (salons, groupes, tâches)
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

create table if not exists public.group_tasks (
  id text primary key,
  group_id text not null,
  title text not null,
  status text not null default 'todo',
  assignee text,
  created_at timestamptz not null default now()
);

-- 3. Réappliquer les droits sur les tables nouvellement créées
grant all on table public.profiles to anon, authenticated;
grant all on table public.resources to anon, authenticated;
grant all on table public.activities to anon, authenticated;
grant all on table public.chat_messages to anon, authenticated;
grant all on table public.study_groups to anon, authenticated;
grant all on table public.group_tasks to anon, authenticated;

-- 4. Politiques RLS ouvertes pour permettre lecture/écriture depuis Next.js & Vercel
alter table public.profiles enable row level security;
drop policy if exists "Profils visibles par tous les étudiants connectés" on public.profiles;
drop policy if exists "Chaque étudiant modifie son propre profil" on public.profiles;
drop policy if exists "Chaque étudiant insère son propre profil" on public.profiles;
drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles for all using (true) with check (true);

alter table public.resources enable row level security;
drop policy if exists "Ressources visibles par tous" on public.resources;
drop policy if exists "Utilisateurs connectés peuvent publier une ressource" on public.resources;
drop policy if exists "resources_all" on public.resources;
create policy "resources_all" on public.resources for all using (true) with check (true);

alter table public.chat_messages enable row level security;
drop policy if exists "Lecture publique des messages" on public.chat_messages;
drop policy if exists "Insertion publique des messages" on public.chat_messages;
drop policy if exists "chat_messages_all" on public.chat_messages;
create policy "chat_messages_all" on public.chat_messages for all using (true) with check (true);

alter table public.study_groups enable row level security;
drop policy if exists "Lecture publique des groupes" on public.study_groups;
drop policy if exists "Création publique des groupes" on public.study_groups;
drop policy if exists "Mise à jour publique des groupes" on public.study_groups;
drop policy if exists "study_groups_all" on public.study_groups;
create policy "study_groups_all" on public.study_groups for all using (true) with check (true);

alter table public.group_tasks enable row level security;
drop policy if exists "group_tasks_all" on public.group_tasks;
create policy "group_tasks_all" on public.group_tasks for all using (true) with check (true);

-- 5. Confirmer automatiquement les utilisateurs déjà inscrits en attente
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
