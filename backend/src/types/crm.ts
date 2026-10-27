export type UserRole = 'admin' | 'manager' | 'telecaller';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  avatar_url?: string;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'site_visit_scheduled'
  | 'converted'
  | 'not_interested';

export type NonConversionReason =
  | 'Budget mismatch'
  | 'Location mismatch (wants outside HSR)'
  | 'Delayed plan (6+ months)'
  | 'Bought competitor property'
  | 'Loan eligibility rejected'
  | 'Non-responsive / Invalid number'
  | 'Looking for rental / commercial only'
  | 'Other';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  campaign_name?: string;
  project_interested: string;
  budget: string;
  status: LeadStatus;
  non_conversion_reason?: NonConversionReason | null;
  non_conversion_notes?: string;
  notes?: string;
  assigned_to?: string;
  assigned_user?: UserProfile;
  created_at: string;
  updated_at: string;
}

export type CallOutcome =
  | 'connected'
  | 'busy'
  | 'not_reachable'
  | 'follow_up_scheduled'
  | 'interested'
  | 'site_visit_requested'
  | 'disqualified';

export interface CallLog {
  id: string;
  lead_id: string;
  lead_name?: string;
  caller_id: string;
  caller_name?: string;
  call_outcome: CallOutcome;
  notes?: string;
  duration_seconds: number;
  follow_up_date?: string;
  created_at: string;
}

export type SiteVisitStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export interface SiteVisit {
  id: string;
  lead_id: string;
  lead_name?: string;
  lead_phone?: string;
  project_name: string;
  scheduled_date: string;
  status: SiteVisitStatus;
  vehicle_type?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  escort_id?: string;
  escort_name?: string;
  pickup_location: string;
  party_size: number;
  visit_notes?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory =
  | 'brochure'
  | 'booking_form'
  | 'cost_sheet'
  | 'floor_plan'
  | 'kyc'
  | 'receipt'
  | 'other';

export interface CrmDocument {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: 'pdf' | 'image' | 'excel' | 'docx' | 'other';
  file_size_kb: number;
  category: DocumentCategory;
  is_company_document: boolean;
  lead_id?: string;
  lead_name?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  created_at: string;
}

export interface TelecallerStats {
  id: string;
  name: string;
  email: string;
  role: string;
  calls_count: number;
  connected_count: number;
  site_visits_booked: number;
  converted_count: number;
  conversion_rate: number;
  avg_duration_sec: number;
  rank: number;
}
