import {
  UserProfile,
  Lead,
  CallLog,
  SiteVisit,
  CrmDocument,
  TelecallerStats,
  LeadStatus,
} from '@/types/crm';
import {
  INITIAL_PROFILES,
  INITIAL_LEADS,
  INITIAL_CALLS,
  INITIAL_SITE_VISITS,
  INITIAL_DOCUMENTS,
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  LEADS: 'redhill_crm_leads',
  CALLS: 'redhill_crm_calls',
  SITE_VISITS: 'redhill_crm_site_visits',
  DOCUMENTS: 'redhill_crm_documents',
  PROFILES: 'redhill_crm_profiles',
};

// Safe local storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export class CrmService {
  // --------------------------------------------------------------------------
  // PROFILES
  // --------------------------------------------------------------------------
  static async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) return data as UserProfile[];
      } catch (err) {
        console.warn('Falling back to local profiles:', err);
      }
    }
    return getFromStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  // --------------------------------------------------------------------------
  // LEADS
  // --------------------------------------------------------------------------
  static async getLeads(currentUser: UserProfile): Promise<Lead[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (currentUser.role === 'telecaller') {
          query = query.eq('assigned_to', currentUser.id);
        }
        const { data, error } = await query;
        if (!error && data) return data as Lead[];
      } catch (err) {
        console.warn('Falling back to API / local leads:', err);
      }
    }

    // Connect to Next.js REST API
    if (typeof window !== 'undefined') {
      try {
        const queryParams = currentUser.role === 'telecaller' ? `?assigned_to=${currentUser.id}` : '';
        const res = await fetch(`/api/leads${queryParams}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const currentLocal = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, []);
            const apiIds = new Set(json.data.map((l: Lead) => l.id));
            const localOnly = currentLocal.filter((l) => !apiIds.has(l.id));
            const merged = [...localOnly, ...json.data];
            saveToStorage(STORAGE_KEYS.LEADS, merged);
            if (currentUser.role === 'telecaller') {
              return merged.filter((l) => l.assigned_to === currentUser.id);
            }
            return merged;
          }
        }
      } catch (err) {
        console.warn('API /api/leads fetch error, using local storage cache:', err);
      }
    }

    const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    if (currentUser.role === 'telecaller') {
      return allLeads.filter((l) => l.assigned_to === currentUser.id);
    }
    return allLeads;
  }

  static async createLead(leadData: Partial<Lead>, currentUser: UserProfile): Promise<Lead> {
    const newLead: Lead = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}`,
      name: leadData.name || 'Untitled Lead',
      phone: leadData.phone || '',
      email: leadData.email || '',
      source: leadData.source || 'Meta Ads',
      campaign_name: leadData.campaign_name || 'Direct_Inquiry',
      project_interested: leadData.project_interested || 'Red Hill Heights (HSR)',
      budget: leadData.budget || '1 Cr - 1.5 Cr',
      status: leadData.status || 'new',
      non_conversion_reason: leadData.non_conversion_reason || null,
      non_conversion_notes: leadData.non_conversion_notes || '',
      notes: leadData.notes || '',
      assigned_to: leadData.assigned_to || (currentUser.role === 'telecaller' ? currentUser.id : 'c0000000-0000-0000-0000-000000000003'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('leads').insert([newLead]).select().single();
        if (!error && data) return data as Lead;
      } catch (err) {
        console.warn('Supabase createLead failed, falling back:', err);
      }
    }

    // Call REST API endpoint
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
            saveToStorage(STORAGE_KEYS.LEADS, [json.data, ...current.filter((l) => l.id !== json.data.id)]);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('REST API createLead failed, using local storage:', err);
      }
    }

    const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    const updated = [newLead, ...current];
    saveToStorage(STORAGE_KEYS.LEADS, updated);
    return newLead;
  }

  static async updateLead(
    leadId: string,
    updates: Partial<Lead>,
    _currentUser: UserProfile
  ): Promise<Lead> {
    const patch = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .update(patch)
          .eq('id', leadId)
          .select()
          .single();
        if (!error && data) return data as Lead;
      } catch (err) {
        console.warn('Supabase updateLead failed, falling back:', err);
      }
    }

    // Sync with REST API
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: leadId, ...patch }),
        });
      } catch (err) {
        console.warn('REST API updateLead failed:', err);
      }
    }

    const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    let updatedLead: Lead | null = null;
    const nextList = current.map((item) => {
      if (item.id === leadId) {
        updatedLead = { ...item, ...patch };
        return updatedLead;
      }
      return item;
    });

    if (updatedLead) {
      saveToStorage(STORAGE_KEYS.LEADS, nextList);
      return updatedLead;
    }
    throw new Error('Lead not found');
  }

  static async deleteLead(leadId: string, _currentUser: UserProfile): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', leadId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteLead failed:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        await fetch(`/api/leads?id=${encodeURIComponent(leadId)}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('REST API deleteLead failed:', err);
      }
    }

    const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    const filtered = current.filter((l) => l.id !== leadId);
    saveToStorage(STORAGE_KEYS.LEADS, filtered);
    return true;
  }

  static async bulkImportLeads(
    leadsData: Partial<Lead>[],
    currentUser: UserProfile
  ): Promise<{ successCount: number; errors: string[] }> {
    const errors: string[] = [];
    const validLeads: Lead[] = [];

    leadsData.forEach((row, idx) => {
      if (!row.name || !row.phone) {
        errors.push(`Row ${idx + 1}: Name and phone number are required.`);
        return;
      }

      const lead: Lead = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lead_imp_${Date.now()}_${idx}`,
        name: String(row.name).trim(),
        phone: String(row.phone).trim(),
        email: row.email ? String(row.email).trim() : '',
        source: row.source ? String(row.source).trim() : 'Excel Import (Digital Ads)',
        campaign_name: row.campaign_name ? String(row.campaign_name).trim() : 'Bulk_Ad_Import',
        project_interested: row.project_interested ? String(row.project_interested).trim() : 'Red Hill Heights (HSR)',
        budget: row.budget ? String(row.budget).trim() : '1 Cr - 1.5 Cr',
        status: (row.status as LeadStatus) || 'new',
        non_conversion_reason: row.non_conversion_reason || null,
        non_conversion_notes: row.non_conversion_notes || '',
        notes: row.notes || 'Imported via Excel lead batch',
        assigned_to: row.assigned_to || (currentUser.role === 'telecaller' ? currentUser.id : 'c0000000-0000-0000-0000-000000000003'),
        created_at: row.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      validLeads.push(lead);
    });

    if (validLeads.length > 0) {
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase.from('leads').insert(validLeads);
          if (!error) return { successCount: validLeads.length, errors };
        } catch (err) {
          console.warn('Supabase bulk insert failed, fallback:', err);
        }
      }

      // Sync with Next.js REST API
      if (typeof window !== 'undefined') {
        try {
          const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validLeads),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
              const combined = [...json.data, ...current.filter((c) => !json.data.some((d: Lead) => d.id === c.id))];
              saveToStorage(STORAGE_KEYS.LEADS, combined);
              return { successCount: validLeads.length, errors };
            }
          }
        } catch (err) {
          console.warn('REST API bulkImportLeads failed, saving to local storage:', err);
        }
      }

      const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      saveToStorage(STORAGE_KEYS.LEADS, [...validLeads, ...current]);
    }

    return { successCount: validLeads.length, errors };
  }

  // --------------------------------------------------------------------------
  // CALLS
  // --------------------------------------------------------------------------
  static async getCalls(leadId?: string, currentUser?: UserProfile): Promise<CallLog[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('calls').select('*').order('created_at', { ascending: false });
        if (leadId) query = query.eq('lead_id', leadId);
        const { data, error } = await query;
        if (!error && data) return data as CallLog[];
      } catch (err) {
        console.warn('Supabase getCalls fallback:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const queryParams = leadId ? `?lead_id=${leadId}` : '';
        const res = await fetch(`/api/calls${queryParams}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            saveToStorage(STORAGE_KEYS.CALLS, json.data);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API /api/calls fetch fallback:', err);
      }
    }

    const allCalls = getFromStorage<CallLog[]>(STORAGE_KEYS.CALLS, INITIAL_CALLS);
    let filtered = allCalls;

    if (leadId) {
      filtered = filtered.filter((c) => c.lead_id === leadId);
    } else if (currentUser && currentUser.role === 'telecaller') {
      const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      const myLeadIds = new Set(allLeads.filter((l) => l.assigned_to === currentUser.id).map((l) => l.id));
      filtered = filtered.filter((c) => c.caller_id === currentUser.id || myLeadIds.has(c.lead_id));
    }

    return filtered;
  }

  static async logCall(callData: Partial<CallLog>, currentUser: UserProfile): Promise<CallLog> {
    const newCall: CallLog = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `call_${Date.now()}`,
      lead_id: callData.lead_id || '',
      lead_name: callData.lead_name || 'Lead',
      caller_id: currentUser.id,
      caller_name: currentUser.full_name,
      call_outcome: callData.call_outcome || 'connected',
      notes: callData.notes || '',
      duration_seconds: callData.duration_seconds || 180,
      follow_up_date: callData.follow_up_date || undefined,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('calls').insert([newCall]).select().single();
        if (!error && data) return data as CallLog;
      } catch (err) {
        console.warn('Supabase logCall fallback:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/calls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCall),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const current = getFromStorage<CallLog[]>(STORAGE_KEYS.CALLS, INITIAL_CALLS);
            saveToStorage(STORAGE_KEYS.CALLS, [json.data, ...current.filter((c) => c.id !== json.data.id)]);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API /api/calls create fallback:', err);
      }
    }

    const current = getFromStorage<CallLog[]>(STORAGE_KEYS.CALLS, INITIAL_CALLS);
    saveToStorage(STORAGE_KEYS.CALLS, [newCall, ...current]);
    return newCall;
  }

  // --------------------------------------------------------------------------
  // SITE VISITS
  // --------------------------------------------------------------------------
  static async getSiteVisits(currentUser: UserProfile): Promise<SiteVisit[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('site_visits').select('*').order('scheduled_date', { ascending: true });
        const { data, error } = await query;
        if (!error && data) return data as SiteVisit[];
      } catch (err) {
        console.warn('Supabase getSiteVisits fallback:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/site-visits');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            saveToStorage(STORAGE_KEYS.SITE_VISITS, json.data);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API /api/site-visits fetch fallback:', err);
      }
    }

    const allVisits = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
    if (currentUser.role === 'telecaller') {
      const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      const myLeadIds = new Set(allLeads.filter((l) => l.assigned_to === currentUser.id).map((l) => l.id));
      return allVisits.filter((v) => v.escort_id === currentUser.id || myLeadIds.has(v.lead_id));
    }
    return allVisits;
  }

  static async scheduleSiteVisit(
    visitData: Partial<SiteVisit>,
    _currentUser: UserProfile
  ): Promise<SiteVisit> {
    const newVisit: SiteVisit = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sv_${Date.now()}`,
      lead_id: visitData.lead_id || '',
      lead_name: visitData.lead_name || 'Client',
      lead_phone: visitData.lead_phone || '',
      project_name: visitData.project_name || 'Red Hill Heights (HSR)',
      scheduled_date: visitData.scheduled_date || new Date(Date.now() + 86400000).toISOString(),
      status: visitData.status || 'scheduled',
      vehicle_type: visitData.vehicle_type || 'Innova Crysta (AC)',
      vehicle_number: visitData.vehicle_number || 'KA-01-MJ-4589',
      driver_name: visitData.driver_name || 'Ramesh Gowda',
      driver_phone: visitData.driver_phone || '+91 98450 12345',
      escort_id: visitData.escort_id,
      escort_name: visitData.escort_name || 'Relationship Manager',
      pickup_location: visitData.pickup_location || 'HSR Layout Sector 1, BDA Complex',
      party_size: visitData.party_size || 2,
      visit_notes: visitData.visit_notes || '',
      feedback: visitData.feedback || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('site_visits').insert([newVisit]).select().single();
        if (!error && data) return data as SiteVisit;
      } catch (err) {
        console.warn('Supabase scheduleSiteVisit fallback:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/site-visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVisit),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const current = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
            saveToStorage(STORAGE_KEYS.SITE_VISITS, [json.data, ...current.filter((v) => v.id !== json.data.id)]);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API /api/site-visits create fallback:', err);
      }
    }

    const current = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
    saveToStorage(STORAGE_KEYS.SITE_VISITS, [newVisit, ...current]);
    return newVisit;
  }

  static async updateSiteVisit(visitId: string, updates: Partial<SiteVisit>): Promise<SiteVisit> {
    const patch = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('site_visits')
          .update(patch)
          .eq('id', visitId)
          .select()
          .single();
        if (!error && data) return data as SiteVisit;
      } catch (err) {
        console.warn('Supabase updateSiteVisit fallback:', err);
      }
    }

    const current = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
    let updatedVisit: SiteVisit | null = null;
    const nextList = current.map((v) => {
      if (v.id === visitId) {
        updatedVisit = { ...v, ...patch };
        return updatedVisit;
      }
      return v;
    });

    if (updatedVisit) {
      saveToStorage(STORAGE_KEYS.SITE_VISITS, nextList);
      return updatedVisit;
    }
    throw new Error('Site visit not found');
  }

  // --------------------------------------------------------------------------
  // DOCUMENTS
  // --------------------------------------------------------------------------
  static async getDocuments(leadId?: string, currentUser?: UserProfile): Promise<CrmDocument[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (leadId) query = query.eq('lead_id', leadId);
        const { data, error } = await query;
        if (!error && data) return data as CrmDocument[];
      } catch (err) {
        console.warn('Supabase getDocuments fallback:', err);
      }
    }

    const allDocs = getFromStorage<CrmDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    if (leadId) {
      return allDocs.filter((d) => d.lead_id === leadId);
    }

    if (currentUser && currentUser.role === 'telecaller') {
      const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      const myLeadIds = new Set(allLeads.filter((l) => l.assigned_to === currentUser.id).map((l) => l.id));
      return allDocs.filter((d) => d.is_company_document || (d.lead_id && myLeadIds.has(d.lead_id)));
    }

    return allDocs;
  }

  static async uploadDocument(
    docData: Partial<CrmDocument>,
    currentUser: UserProfile
  ): Promise<CrmDocument> {
    const newDoc: CrmDocument = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc_${Date.now()}`,
      title: docData.title || 'Document',
      description: docData.description || '',
      file_url: docData.file_url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
      file_type: docData.file_type || 'pdf',
      file_size_kb: docData.file_size_kb || 1200,
      category: docData.category || 'brochure',
      is_company_document: docData.is_company_document ?? false,
      lead_id: docData.lead_id,
      lead_name: docData.lead_name,
      uploaded_by: currentUser.id,
      uploaded_by_name: currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('documents').insert([newDoc]).select().single();
        if (!error && data) return data as CrmDocument;
      } catch (err) {
        console.warn('Supabase uploadDocument fallback:', err);
      }
    }

    const current = getFromStorage<CrmDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    saveToStorage(STORAGE_KEYS.DOCUMENTS, [newDoc, ...current]);
    return newDoc;
  }

  static async deleteDocument(docId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('documents').delete().eq('id', docId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteDocument fallback:', err);
      }
    }

    const current = getFromStorage<CrmDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    saveToStorage(STORAGE_KEYS.DOCUMENTS, current.filter((d) => d.id !== docId));
    return true;
  }

  // --------------------------------------------------------------------------
  // TELECALLER LEADERBOARD
  // --------------------------------------------------------------------------
  static async getTelecallerLeaderboard(): Promise<TelecallerStats[]> {
    const profiles = await this.getProfiles();
    const telecallers = profiles.filter((p) => p.role === 'telecaller' || p.role === 'manager');

    const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    const allCalls = getFromStorage<CallLog[]>(STORAGE_KEYS.CALLS, INITIAL_CALLS);
    const allVisits = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);

    const stats: TelecallerStats[] = telecallers.map((t) => {
      const myCalls = allCalls.filter((c) => c.caller_id === t.id);
      const connected = myCalls.filter((c) => c.call_outcome === 'connected' || c.call_outcome === 'interested' || c.call_outcome === 'site_visit_requested');
      const myLeads = allLeads.filter((l) => l.assigned_to === t.id);
      const converted = myLeads.filter((l) => l.status === 'converted');
      const bookedVisits = allVisits.filter((v) => v.escort_id === t.id || myLeads.some((l) => l.id === v.lead_id));

      const totalCalls = myCalls.length;
      const convertedCount = converted.length;
      const rate = myLeads.length > 0 ? Math.round((convertedCount / myLeads.length) * 100) : 0;
      const avgDuration = totalCalls > 0 ? Math.round(myCalls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / totalCalls) : 0;

      return {
        id: t.id,
        name: t.full_name,
        email: t.email,
        role: t.role,
        calls_count: totalCalls,
        connected_count: connected.length,
        site_visits_booked: bookedVisits.length,
        converted_count: convertedCount,
        conversion_rate: rate,
        avg_duration_sec: avgDuration,
        rank: 1, // Will be set after sorting
      };
    });

    // Sort descending by converted_count first, then conversion_rate, then total calls
    stats.sort((a, b) => {
      if (b.converted_count !== a.converted_count) return b.converted_count - a.converted_count;
      if (b.conversion_rate !== a.conversion_rate) return b.conversion_rate - a.conversion_rate;
      return b.calls_count - a.calls_count;
    });

    stats.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return stats;
  }

  // Reset to default seed data
  static resetDemoData(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.LEADS);
      window.localStorage.removeItem(STORAGE_KEYS.CALLS);
      window.localStorage.removeItem(STORAGE_KEYS.SITE_VISITS);
      window.localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      window.localStorage.removeItem(STORAGE_KEYS.PROFILES);
    }
  }
}
