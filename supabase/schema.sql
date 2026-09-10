-- ============================================================================
-- Samadhan Setu (SIH26043) Database Schema Migration
-- Database: PostgreSQL / Supabase
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CITIZEN PROBLEM SUBMISSIONS
create table if not exists public.problems (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    category text default 'Water & Environment',
    location text not null,
    evidence_file_name text,
    status text default 'submitted' check (status in ('submitted', 'analyzing', 'analyzed', 'matched', 'project_active', 'resolved')),
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. GEMINI AI STRUCTURED ANALYSES
create table if not exists public.problem_analyses (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid references public.problems(id) on delete cascade,
    primary_classification text not null,
    severity text not null check (severity in ('HIGH', 'MEDIUM', 'LOW')),
    confidence numeric(5, 2) not null,
    required_expertise jsonb not null default '[]'::jsonb,
    extracted_keywords jsonb not null default '[]'::jsonb,
    root_causes jsonb not null default '[]'::jsonb,
    reasoning text not null,
    model_version text default 'gemini-1.5-flash',
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. INSTITUTIONAL REGISTRY (Universities & Industry Partners)
create table if not exists public.institutions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    type text not null check (type in ('UNIVERSITY', 'INDUSTRY')),
    department text not null,
    expertise text[] not null default '{}',
    facilities text[] not null default '{}',
    district text default 'Dhanbad',
    state text default 'Jharkhand',
    is_verified boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. EXPLAINABLE PARTNER MATCHES
create table if not exists public.partner_matches (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid references public.problems(id) on delete cascade,
    institution_id uuid references public.institutions(id) on delete set null,
    institution_name text not null,
    institution_type text not null,
    match_score numeric(5, 2) not null,
    criteria_breakdown jsonb default '{}'::jsonb,
    reasons jsonb not null default '[]'::jsonb,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. PROJECT LIFECYCLE & COLLABORATION
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid references public.problems(id) on delete cascade,
    title text not null,
    current_stage text default 'Proposal' check (current_stage in ('Proposal', 'Pilot', 'Field Testing', 'Scale', 'Adopted')),
    progress_pct integer default 0 check (progress_pct between 0 and 100),
    active_milestone text,
    university_partner text,
    industry_partner text,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- SEED INITIAL VERIFIED INSTITUTIONS
-- ============================================================================

insert into public.institutions (name, type, department, expertise, facilities, district, state)
values
    (
        'University of Environmental & Mining Research',
        'UNIVERSITY',
        'Department of Hydrology & Mineral Waste Management',
        array['Environmental Engineering', 'Water Treatment', 'Mining & Pollution', 'Hydrology'],
        array['Mineral Leaching Spectrometry Lab', 'Heavy Metal Water Testing Facility', 'Geo-Hydrology Field Van'],
        'Dhanbad',
        'Jharkhand'
    ),
    (
        'Regional Water Technology Partner',
        'INDUSTRY',
        'Civic Water Filtration & Environmental Solutions',
        array['Water Treatment', 'Field Deployment', 'Rural Infrastructure', 'Environmental Monitoring'],
        array['Modular RO & Ultrafiltration Plants', 'Mobile Water Quality Sensor Grid', 'Turbidity Telemetry Base'],
        'Dhanbad',
        'Jharkhand'
    ),
    (
        'Urban Mobility Research Centre',
        'UNIVERSITY',
        'Department of Transportation Engineering & Smart Cities',
        array['Transportation Engineering', 'Traffic Management', 'Urban Planning', 'Smart Mobility'],
        array['Traffic Simulation Lab', 'Smart Signal Optimization Rig', 'Road Surface Stress Testing Lab'],
        'Ranchi',
        'Jharkhand'
    ),
    (
        'Smart Transport Solutions Partner',
        'INDUSTRY',
        'Integrated Mobility & Traffic Management Systems',
        array['Traffic Optimization', 'Sensor Deployment', 'Municipal Logistics', 'Real-time Mobility Analytics'],
        array['Edge Camera Sensor Network', 'Dynamic Signal Control Hub', 'Road Obstacle Rapid Telemetry'],
        'Ranchi',
        'Jharkhand'
    ),
    (
        'Public Health Research Institute',
        'UNIVERSITY',
        'Department of Epidemiology & Community Health',
        array['Public Health Engineering', 'Epidemiology', 'Rural Healthcare', 'Medical Logistics'],
        array['Diagnostic Pathology Unit', 'Community Health Survey Database', 'Epidemiological Modelling Lab'],
        'Hazaribagh',
        'Jharkhand'
    ),
    (
        'Rural Healthcare Solutions Partner',
        'INDUSTRY',
        'Community Health Delivery & Telemedicine Solutions',
        array['Telemedicine Platforms', 'Rural Clinic Deployment', 'Supply Chain', 'Preventive Diagnostics'],
        array['Solar-Powered Telemedicine Kiosks', 'Cold-Chain Telemetry Vans', 'Point-of-Care Blood Testing Kits'],
        'Hazaribagh',
        'Jharkhand'
    ),
    (
        'Agricultural Systems Research Centre',
        'UNIVERSITY',
        'Department of Agronomy & Irrigation Engineering',
        array['Agricultural Engineering', 'Irrigation Systems', 'Agronomy', 'Rural Development'],
        array['Soil Nutrient Spectrometry Lab', 'Micro-Irrigation Test Beds', 'Drought Crop Resilience Greenhouse'],
        'Bokaro',
        'Jharkhand'
    ),
    (
        'Rural AgriTech Solutions Partner',
        'INDUSTRY',
        'Farm Technology & Rural Infrastructure Deployment',
        array['Drip Irrigation', 'Sensor Networks', 'Rural Field Operations', 'Farm Advisory'],
        array['Soil Moisture LoRa Sensor Gateway', 'Micro-Sprinkler Manufacturing Unit', 'Farmer Drone Fleet'],
        'Bokaro',
        'Jharkhand'
    )
on conflict do nothing;

-- Enable Row Level Security (RLS)
alter table public.problems enable row level security;
alter table public.problem_analyses enable row level security;
alter table public.institutions enable row level security;
alter table public.partner_matches enable row level security;
alter table public.projects enable row level security;

-- Public read policies for civic transparency
create policy "Public can view problems" on public.problems for select using (true);
create policy "Public can insert problems" on public.problems for insert with check (true);

create policy "Public can view analyses" on public.problem_analyses for select using (true);
create policy "Public can insert analyses" on public.problem_analyses for insert with check (true);

create policy "Public can view institutions" on public.institutions for select using (true);

create policy "Public can view partner matches" on public.partner_matches for select using (true);
create policy "Public can insert partner matches" on public.partner_matches for insert with check (true);

create policy "Public can view projects" on public.projects for select using (true);
create policy "Public can insert projects" on public.projects for insert with check (true);
