-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: Groupes
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contribution_amount integer not null default 550,
  pot_amount integer not null default 220000,
  rotation_days integer not null default 4,
  start_date date not null default current_date,
  penalty_per_day integer not null default 200,
  currency text not null default 'FCFA',
  password text, -- Mot de passe pour accéder au groupe
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Membres
create table public.members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  full_name text not null,
  phone text,
  photo_url text,
  join_date date default current_date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'ALERT_8J', 'EXCLUDED', 'COMPLETED', 'ARCHIVED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Pointage (Attendance)
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.members(id) on delete cascade not null,
  date date not null default current_date,
  status text not null check (status in ('PAID', 'LATE', 'PENDING')),
  amount_paid integer default 0,
  penalty_paid integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(member_id, date) -- Un seul pointage par membre par jour
);

-- Table: Cagnottes (Pots)
create table public.pots (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  member_id uuid references public.members(id) not null,
  distribution_date date not null,
  status text not null default 'PENDING' check (status in ('COMPLETED', 'PENDING')),
  amount integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Simple pour start : accès public ou anon permissif pour la démo local first)
alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.attendance enable row level security;
alter table public.pots enable row level security;

-- Policy: Allow read/write for all (Dev Mode - A DURCIR EN PROD)
create policy "Enable all for anon" on public.groups for all using (true) with check (true);
create policy "Enable all for anon" on public.members for all using (true) with check (true);
create policy "Enable all for anon" on public.attendance for all using (true) with check (true);
create policy "Enable all for anon" on public.pots for all using (true) with check (true);
