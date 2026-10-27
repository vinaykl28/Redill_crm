-- ==============================================================================
-- RED HILL INFRA CRM - SUPABASE POSTGRESQL SCHEMA
-- Real Estate Developer CRM - HSR Layout, Bengaluru
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES / USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'telecaller')),
    phone TEXT,
    avatar_url TEXT,
    department TEXT DEFAULT 'Sales & Telecalling',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ------------------------------------------------------------------------------
-- 2. LEADS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT NOT NULL, -- e.g., 'Meta Ads', 'Google Ads', 'MagicBricks', '99acres', 'Housing.com', 'WhatsApp Ads', 'Website', 'Referral', 'Walk-in'
    campaign_name TEXT,
    project_interested TEXT NOT NULL DEFAULT 'Red Hill Heights (HSR)',
    budget TEXT NOT NULL DEFAULT '1 Cr - 1.5 Cr',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'site_visit_scheduled', 'converted', 'not_interested')),
    non_conversion_reason TEXT CHECK (
        non_conversion_reason IS NULL OR non_conversion_reason IN (
            'Budget mismatch',
            'Location mismatch (wants outside HSR)',
            'Delayed plan (6+ months)',
            'Bought competitor property',
            'Loan eligibility rejected',
            'Non-responsive / Invalid number',
            'Looking for rental / commercial only',
            'Other'
        )
    ),
    non_conversion_notes TEXT,
    notes TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. CALLS LOG TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    call_outcome TEXT NOT NULL CHECK (
        call_outcome IN (
            'connected',
            'busy',
            'not_reachable',
            'follow_up_scheduled',
            'interested',
            'site_visit_requested',
            'disqualified'
        )
    ),
    notes TEXT,
    duration_seconds INTEGER DEFAULT 0,
    follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON public.calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON public.calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. SITE VISITS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')
    ),
    vehicle_type TEXT DEFAULT 'Innova Crysta (AC)',
    vehicle_number TEXT DEFAULT 'KA-01-MJ-4589',
    driver_name TEXT DEFAULT 'Ramesh Gowda',
    driver_phone TEXT DEFAULT '+91 98450 12345',
    escort_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    escort_name TEXT,
    pickup_location TEXT NOT NULL,
    party_size INTEGER DEFAULT 2,
    visit_notes TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_visits_lead_id ON public.site_visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_scheduled_date ON public.site_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_escort_id ON public.site_visits(escort_id);

-- ------------------------------------------------------------------------------
-- 5. DOCUMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'image', 'excel', 'docx'
    file_size_kb INTEGER DEFAULT 0,
    category TEXT NOT NULL CHECK (
        category IN ('brochure', 'booking_form', 'cost_sheet', 'floor_plan', 'kyc', 'receipt', 'other')
    ),
    is_company_document BOOLEAN DEFAULT false,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON public.documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_company ON public.documents(is_company_document);

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_site_visits_updated_at ON public.site_visits;
CREATE TRIGGER set_site_visits_updated_at
BEFORE UPDATE ON public.site_visits
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 7.1 PROFILES RLS
-- Everyone authenticated can view staff profiles (so telecallers see assignees/managers)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile; admins can update any profile
CREATE POLICY "Users can update own profile or Admin can update any"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    auth.uid() = id OR public.get_current_user_role() = 'admin'
);

-- Admin can insert profiles
CREATE POLICY "Admin can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = id OR public.get_current_user_role() = 'admin'
);

-- 7.2 LEADS RLS
-- Admins and Managers can view ALL leads.
-- Telecallers can ONLY view leads assigned to them.
CREATE POLICY "Leads SELECT policy"
ON public.leads FOR SELECT
TO authenticated
USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
);

-- Admins and Managers can insert leads. Telecallers can insert leads (assigned to themselves).
CREATE POLICY "Leads INSERT policy"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
);

-- Admins and Managers can update ANY lead. Telecallers can only update leads assigned to them.
CREATE POLICY "Leads UPDATE policy"
ON public.leads FOR UPDATE
TO authenticated
USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
);

-- Only Admins can DELETE leads.
CREATE POLICY "Leads DELETE policy"
ON public.leads FOR DELETE
TO authenticated
USING (
    public.get_current_user_role() = 'admin'
);

-- 7.3 CALLS RLS
-- Admins and Managers can view all call logs.
-- Telecallers can view calls for leads they own or calls they logged.
CREATE POLICY "Calls SELECT policy"
ON public.calls FOR SELECT
TO authenticated
USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR caller_id = auth.uid()
    OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid())
);

-- Telecallers can insert call logs for leads they own or callers matching themselves.
CREATE POLICY "Calls INSERT policy"
ON public.calls FOR INSERT
TO authenticated
WITH CHECK (
    caller_id = auth.uid()
    OR public.get_current_user_role() IN ('admin', 'manager')
);

-- 7.4 SITE VISITS RLS
CREATE POLICY "Site Visits SELECT policy"
ON public.site_visits FOR SELECT
TO authenticated
USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR escort_id = auth.uid()
    OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid())
);

CREATE POLICY "Site Visits INSERT / UPDATE policy"
ON public.site_visits FOR ALL
TO authenticated
USING (
    public.get_current_user_role() IN ('admin', 'manager')
    OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid())
);

-- 7.5 DOCUMENTS RLS
-- Company documents (brochures, booking forms) are accessible by all authenticated users.
-- Lead documents are accessible by Admins, Managers, and the assigned Telecaller.
CREATE POLICY "Documents SELECT policy"
ON public.documents FOR SELECT
TO authenticated
USING (
    is_company_document = true
    OR public.get_current_user_role() IN ('admin', 'manager')
    OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid())
);

CREATE POLICY "Documents INSERT policy"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager')
    OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid())
);

-- ------------------------------------------------------------------------------
-- 8. STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('crm-documents', 'crm-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy
CREATE POLICY "Public or Authenticated Read Document Bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'crm-documents');

CREATE POLICY "Authenticated Upload Document Bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crm-documents');
