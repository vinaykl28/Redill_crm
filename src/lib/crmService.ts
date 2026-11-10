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

  // --- ROUND-ROBIN SALES EXECUTIVE AUTO-ASSIGNMENT (ALPHABETICAL) ---
  static getSortedSalesExecutives(): UserProfile[] {
    const profiles = getFromStorage<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles
      .filter((p) => p.role === 'sales_executive')
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  static getNextSalesExecutive(): UserProfile {
    const salesExecs = this.getSortedSalesExecutives();
    if (salesExecs.length === 0) {
      return getFromStorage<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES)[0];
    }
    const currentIdx = getFromStorage<number>('redhill_crm_sales_rr_index', 0);
    const assigned = salesExecs[currentIdx % salesExecs.length];
    saveToStorage('redhill_crm_sales_rr_index', (currentIdx + 1) % salesExecs.length);
    return assigned;
  }

  static peekNextSalesExecutive(): UserProfile {
    const salesExecs = this.getSortedSalesExecutives();
    if (salesExecs.length === 0) {
      return getFromStorage<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES)[0];
    }
    const currentIdx = getFromStorage<number>('redhill_crm_sales_rr_index', 0);
    return salesExecs[currentIdx % salesExecs.length];
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
        } else if (currentUser.role === 'sales_executive') {
          query = query.or(`assigned_sales_id.eq.${currentUser.id},assigned_to.eq.${currentUser.id}`);
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
        let queryParams = '';
        if (currentUser.role === 'telecaller') {
          queryParams = `?assigned_to=${currentUser.id}`;
        } else if (currentUser.role === 'sales_executive') {
          queryParams = `?assigned_sales_id=${currentUser.id}`;
        }
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
            } else if (currentUser.role === 'sales_executive') {
              return merged.filter(
                (l) => l.assigned_sales_id === currentUser.id || l.assigned_to === currentUser.id
              );
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
    } else if (currentUser.role === 'sales_executive') {
      return allLeads.filter(
        (l) => l.assigned_sales_id === currentUser.id || l.assigned_to === currentUser.id
      );
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
      assigned_sales_id:
        leadData.assigned_sales_id || (currentUser.role === 'sales_executive' ? currentUser.id : undefined),
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

    if (newLead.status === 'site_visit_scheduled' && !newLead.assigned_sales_id) {
      newLead.assigned_sales_id = this.getNextSalesExecutive().id;
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
    const patch: Partial<Lead> = {
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

    // Sync with REST API first so server performs authoritative round-robin assignment
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: leadId, ...patch }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const savedLead: Lead = json.data;
            const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
            const exists = current.some((item) => item.id === leadId);
            const nextList = exists
              ? current.map((item) => (item.id === leadId ? savedLead : item))
              : [savedLead, ...current];
            saveToStorage(STORAGE_KEYS.LEADS, nextList);
            return savedLead;
          }
        }
      } catch (err) {
        console.warn('REST API updateLead failed, using local fallback:', err);
      }
    }

    const current = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    const existingLead = current.find((l) => l.id === leadId);
    if (
      updates.status === 'site_visit_scheduled' &&
      !patch.assigned_sales_id &&
      !existingLead?.assigned_sales_id
    ) {
      patch.assigned_sales_id = this.getNextSalesExecutive().id;
    }

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

  static async deleteLead(_leadId: string, _currentUser: UserProfile): Promise<boolean> {
    console.warn('Lead deletion is permanently disabled across Red Hill Infra CRM.');
    return false;
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
            const list = json.data;
            if (leadId) {
              return list.filter((c: CallLog) => c.lead_id === leadId);
            }
            if (currentUser && currentUser.role === 'telecaller') {
              const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
              const myLeadIds = new Set(allLeads.filter((l) => l.assigned_to === currentUser.id).map((l) => l.id));
              return list.filter((c: CallLog) => c.caller_id === currentUser.id || myLeadIds.has(c.lead_id));
            }
            if (currentUser && currentUser.role === 'sales_executive') {
              const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
              const myLeadIds = new Set(
                allLeads
                  .filter((l) => l.assigned_sales_id === currentUser.id || l.assigned_to === currentUser.id)
                  .map((l) => l.id)
              );
              return list.filter((c: CallLog) => c.caller_id === currentUser.id || myLeadIds.has(c.lead_id));
            }
            return list;
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
    } else if (currentUser && currentUser.role === 'sales_executive') {
      const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      const myLeadIds = new Set(
        allLeads
          .filter((l) => l.assigned_sales_id === currentUser.id || l.assigned_to === currentUser.id)
          .map((l) => l.id)
      );
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
        if (currentUser.role === 'sales_executive') {
          query = query.eq('escort_id', currentUser.id);
        }
        const { data, error } = await query;
        if (!error && data) return data as SiteVisit[];
      } catch (err) {
        console.warn('Supabase getSiteVisits fallback:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const queryParams = currentUser.role === 'sales_executive' ? `?escort_id=${currentUser.id}` : '';
        const res = await fetch(`/api/site-visits${queryParams}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const currentLocal = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
            const apiIds = new Set(json.data.map((v: SiteVisit) => v.id));
            const localOnly = currentLocal.filter((v) => !apiIds.has(v.id));
            const merged = [...json.data, ...localOnly];
            saveToStorage(STORAGE_KEYS.SITE_VISITS, merged);

            if (currentUser.role === 'telecaller') {
              const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
              const myLeadIds = new Set(allLeads.filter((l) => l.assigned_to === currentUser.id).map((l) => l.id));
              return merged.filter((v: SiteVisit) => v.escort_id === currentUser.id || myLeadIds.has(v.lead_id));
            }
            if (currentUser.role === 'sales_executive') {
              const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
              const myLeadIds = new Set(
                allLeads
                  .filter((l) => l.assigned_sales_id === currentUser.id || l.assigned_to === currentUser.id)
                  .map((l) => l.id)
              );
              return merged.filter((v: SiteVisit) => v.escort_id === currentUser.id || myLeadIds.has(v.lead_id));
            }
            return merged;
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
    if (currentUser.role === 'sales_executive') {
      const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      const myLeadIds = new Set(
        allLeads
          .filter((l) => l.assigned_sales_id === currentUser.id || l.assigned_to === currentUser.id)
          .map((l) => l.id)
      );
      return allVisits.filter((v) => v.escort_id === currentUser.id || myLeadIds.has(v.lead_id));
    }
    return allVisits;
  }

  static async scheduleSiteVisit(
    visitData: Partial<SiteVisit>,
    _currentUser: UserProfile
  ): Promise<SiteVisit> {
    const allLeads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    const targetLead = allLeads.find((l) => l.id === visitData.lead_id);
    const salesExecs = this.getSortedSalesExecutives();
    const isExplicitSalesExec =
      visitData.escort_id && salesExecs.some((s) => s.id === visitData.escort_id);

    const requestPayload: Partial<SiteVisit> = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sv_${Date.now()}`,
      lead_id: visitData.lead_id || '',
      lead_name: targetLead ? targetLead.name : visitData.lead_name || 'Client',
      lead_phone: targetLead ? targetLead.phone : visitData.lead_phone || '',
      project_name: visitData.project_name || targetLead?.project_interested || 'Red Hill Heights (HSR)',
      scheduled_date: visitData.scheduled_date || new Date(Date.now() + 86400000).toISOString(),
      status: visitData.status || 'scheduled',
      vehicle_type: visitData.vehicle_type || 'Innova Crysta (AC)',
      vehicle_number: visitData.vehicle_number || 'KA-01-MJ-4589',
      driver_name: visitData.driver_name || 'Ramesh Gowda',
      driver_phone: visitData.driver_phone || '+91 98450 12345',
      escort_id: isExplicitSalesExec ? visitData.escort_id : targetLead?.assigned_sales_id,
      escort_name: isExplicitSalesExec ? visitData.escort_name : undefined,
      pickup_location: visitData.pickup_location || 'HSR Layout Sector 1, BDA Complex',
      party_size: visitData.party_size || 2,
      visit_notes: visitData.visit_notes || '',
      feedback: visitData.feedback || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('site_visits').insert([requestPayload]).select().single();
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
          body: JSON.stringify(requestPayload),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const savedVisit: SiteVisit = json.data;
            const current = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
            saveToStorage(STORAGE_KEYS.SITE_VISITS, [savedVisit, ...current.filter((v) => v.id !== savedVisit.id)]);

            if (savedVisit.lead_id && savedVisit.escort_id) {
              const leadsNow = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
              const updatedLeads = leadsNow.map((l) =>
                l.id === savedVisit.lead_id
                  ? {
                      ...l,
                      status: 'site_visit_scheduled' as LeadStatus,
                      assigned_sales_id: savedVisit.escort_id,
                      updated_at: new Date().toISOString(),
                    }
                  : l
              );
              saveToStorage(STORAGE_KEYS.LEADS, updatedLeads);
            }
            return savedVisit;
          }
        }
      } catch (err) {
        console.warn('API /api/site-visits create fallback:', err);
      }
    }

    // Offline fallback only
    let assignedSalesId = targetLead?.assigned_sales_id || (isExplicitSalesExec ? visitData.escort_id : undefined);
    let escortName = isExplicitSalesExec ? visitData.escort_name : undefined;
    if (!assignedSalesId) {
      const nextSales = this.getNextSalesExecutive();
      assignedSalesId = nextSales.id;
      escortName = nextSales.full_name;
    } else if (!escortName) {
      escortName = salesExecs.find((s) => s.id === assignedSalesId)?.full_name || 'Relationship Manager';
    }

    const offlineVisit: SiteVisit = {
      ...(requestPayload as SiteVisit),
      escort_id: assignedSalesId,
      escort_name: escortName,
    };

    const current = getFromStorage<SiteVisit[]>(STORAGE_KEYS.SITE_VISITS, INITIAL_SITE_VISITS);
    saveToStorage(STORAGE_KEYS.SITE_VISITS, [offlineVisit, ...current]);

    if (offlineVisit.lead_id) {
      const leadsNow = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
      const updatedLeads = leadsNow.map((l) =>
        l.id === offlineVisit.lead_id
          ? {
              ...l,
              status: 'site_visit_scheduled' as LeadStatus,
              assigned_sales_id: assignedSalesId,
              updated_at: new Date().toISOString(),
            }
          : l
      );
      saveToStorage(STORAGE_KEYS.LEADS, updatedLeads);
    }

    return offlineVisit;
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
    const telecallers = profiles.filter((p) => p.role === 'telecaller' || p.role === 'manager' || p.role === 'sales_executive');

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
