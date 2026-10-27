import { Lead, CallLog, SiteVisit, CrmDocument, UserProfile, LeadStatus } from '../types/crm';
import {
  INITIAL_PROFILES,
  INITIAL_LEADS,
  INITIAL_CALLS,
  INITIAL_SITE_VISITS,
  INITIAL_DOCUMENTS,
} from './mockData';
import { supabase, isSupabaseConfigured } from '../config/db';

interface ServerState {
  leads: Lead[];
  calls: CallLog[];
  siteVisits: SiteVisit[];
  documents: CrmDocument[];
  profiles: UserProfile[];
  configuredSupabaseUrl?: string;
  configuredSupabaseAnonKey?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __redhillServerState: ServerState | undefined;
}

if (!global.__redhillServerState || global.__redhillServerState.siteVisits.length < INITIAL_SITE_VISITS.length) {
  global.__redhillServerState = {
    leads: global.__redhillServerState?.leads || JSON.parse(JSON.stringify(INITIAL_LEADS)),
    calls: global.__redhillServerState?.calls || JSON.parse(JSON.stringify(INITIAL_CALLS)),
    siteVisits: JSON.parse(JSON.stringify(INITIAL_SITE_VISITS)),
    documents: global.__redhillServerState?.documents || JSON.parse(JSON.stringify(INITIAL_DOCUMENTS)),
    profiles: global.__redhillServerState?.profiles || JSON.parse(JSON.stringify(INITIAL_PROFILES)),
  };
}

export const serverState = global.__redhillServerState;

export class ServerStore {
  // --- LEADS ---
  static async getLeads(filters?: {
    status?: string;
    assigned_to?: string;
    source?: string;
    search?: string;
  }): Promise<Lead[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
        if (filters?.source) query = query.eq('source', filters.source);
        const { data, error } = await query;
        if (!error && data) return data as Lead[];
      } catch (e) {
        console.warn('Supabase getLeads failed on server, using in-memory store:', e);
      }
    }

    let list = [...serverState.leads];
    if (filters?.status) {
      list = list.filter((l) => l.status === filters.status);
    }
    if (filters?.assigned_to) {
      list = list.filter((l) => l.assigned_to === filters.assigned_to);
    }
    if (filters?.source) {
      list = list.filter((l) => l.source.toLowerCase() === filters.source?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          l.project_interested.toLowerCase().includes(q)
      );
    }
    return list;
  }

  static async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const newLead: Lead = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: leadData.name || 'Untitled Lead',
      phone: leadData.phone || '',
      email: leadData.email || '',
      source: leadData.source || 'Direct Meta Ads',
      campaign_name: leadData.campaign_name || 'HSR_PreLaunch_Digital',
      project_interested: leadData.project_interested || 'Red Hill Heights (HSR)',
      budget: leadData.budget || '1.5 Cr - 2.5 Cr',
      status: (leadData.status as LeadStatus) || 'new',
      non_conversion_reason: leadData.non_conversion_reason || null,
      non_conversion_notes: leadData.non_conversion_notes || '',
      notes: leadData.notes || '',
      assigned_to: leadData.assigned_to || 'c0000000-0000-0000-0000-000000000003',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('leads').insert([newLead]).select().single();
        if (!error && data) return data as Lead;
      } catch (e) {
        console.warn('Supabase createLead failed on server, using in-memory store:', e);
      }
    }

    serverState.leads.unshift(newLead);
    return newLead;
  }

  static async bulkCreateLeads(leadsList: Partial<Lead>[]): Promise<Lead[]> {
    const createdList: Lead[] = [];
    for (const leadData of leadsList) {
      const newLead: Lead = {
        id:
          leadData.id ||
          (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
        name: leadData.name || 'Untitled Lead',
        phone: leadData.phone || '',
        email: leadData.email || '',
        source: leadData.source || 'CSV Import',
        campaign_name: leadData.campaign_name || 'Bulk_Import',
        project_interested: leadData.project_interested || 'Red Hill Heights (HSR)',
        budget: leadData.budget || '1.5 Cr - 2.5 Cr',
        status: (leadData.status as LeadStatus) || 'new',
        non_conversion_reason: leadData.non_conversion_reason || null,
        non_conversion_notes: leadData.non_conversion_notes || '',
        notes: leadData.notes || '',
        assigned_to: leadData.assigned_to || 'c0000000-0000-0000-0000-000000000003',
        created_at: leadData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      createdList.push(newLead);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('leads').insert(createdList);
      } catch (e) {
        console.warn('Supabase bulkCreateLeads failed, stored in memory:', e);
      }
    }

    serverState.leads.unshift(...createdList);
    return createdList;
  }

  static async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const patch = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .update(patch)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Lead;
      } catch (e) {
        console.warn('Supabase updateLead failed on server, using in-memory store:', e);
      }
    }

    const idx = serverState.leads.findIndex((l) => l.id === id);
    if (idx !== -1) {
      serverState.leads[idx] = { ...serverState.leads[idx], ...patch };
      return serverState.leads[idx];
    }
    return null;
  }

  static async deleteLead(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteLead failed on server, using in-memory store:', e);
      }
    }

    const initialLen = serverState.leads.length;
    serverState.leads = serverState.leads.filter((l) => l.id !== id);
    return serverState.leads.length < initialLen;
  }

  // --- CALL LOGS ---
  static async getCalls(leadId?: string, callerId?: string): Promise<CallLog[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('calls').select('*').order('created_at', { ascending: false });
        if (leadId) query = query.eq('lead_id', leadId);
        if (callerId) query = query.eq('caller_id', callerId);
        const { data, error } = await query;
        if (!error && data) return data as CallLog[];
      } catch (e) {
        console.warn('Supabase getCalls failed on server:', e);
      }
    }

    let list = [...serverState.calls];
    if (leadId) list = list.filter((c) => c.lead_id === leadId);
    if (callerId) list = list.filter((c) => c.caller_id === callerId);
    return list;
  }

  static async createCall(callData: Partial<CallLog>): Promise<CallLog> {
    const lead = serverState.leads.find((l) => l.id === callData.lead_id);
    const caller = serverState.profiles.find((p) => p.id === callData.caller_id);

    const newCall: CallLog = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      lead_id: callData.lead_id || '',
      lead_name: lead ? lead.name : callData.lead_name || 'Client',
      caller_id: callData.caller_id || 'c0000000-0000-0000-0000-000000000003',
      caller_name: caller ? caller.full_name : callData.caller_name || 'Amit Kumar',
      call_outcome: callData.call_outcome || 'connected',
      notes: callData.notes || '',
      duration_seconds: Number(callData.duration_seconds || 120),
      follow_up_date: callData.follow_up_date,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('calls').insert([newCall]).select().single();
        if (!error && data) return data as CallLog;
      } catch (e) {
        console.warn('Supabase createCall failed on server:', e);
      }
    }

    serverState.calls.unshift(newCall);

    // Auto update lead status if applicable
    if (callData.lead_id) {
      let targetStatus: LeadStatus | null = null;
      if (newCall.call_outcome === 'interested') targetStatus = 'interested';
      if (newCall.call_outcome === 'site_visit_requested') targetStatus = 'site_visit_scheduled';
      if (newCall.call_outcome === 'disqualified') targetStatus = 'not_interested';

      if (targetStatus) {
        await this.updateLead(callData.lead_id, { status: targetStatus });
      }
    }

    return newCall;
  }

  // --- SITE VISITS ---
  static async getSiteVisits(status?: string, leadId?: string): Promise<SiteVisit[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('site_visits').select('*').order('scheduled_date', { ascending: true });
        if (status) query = query.eq('status', status);
        if (leadId) query = query.eq('lead_id', leadId);
        const { data, error } = await query;
        if (!error && data) return data as SiteVisit[];
      } catch (e) {
        console.warn('Supabase getSiteVisits failed on server:', e);
      }
    }

    let list = [...serverState.siteVisits];
    if (status) list = list.filter((v) => v.status === status);
    if (leadId) list = list.filter((v) => v.lead_id === leadId);
    return list;
  }

  static async createSiteVisit(visitData: Partial<SiteVisit>): Promise<SiteVisit> {
    const lead = serverState.leads.find((l) => l.id === visitData.lead_id);
    const newVisit: SiteVisit = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      lead_id: visitData.lead_id || '',
      lead_name: lead ? lead.name : visitData.lead_name || 'Client',
      lead_phone: lead ? lead.phone : visitData.lead_phone || '',
      project_name: visitData.project_name || 'Red Hill Heights (HSR)',
      scheduled_date: visitData.scheduled_date || new Date().toISOString(),
      status: visitData.status || 'scheduled',
      vehicle_type: visitData.vehicle_type || 'Toyota Innova Crysta (Company Fleet)',
      vehicle_number: visitData.vehicle_number || 'KA-01-MJ-8821',
      driver_name: visitData.driver_name || 'Ramesh Gowda',
      driver_phone: visitData.driver_phone || '+91 98440 22331',
      escort_id: visitData.escort_id || 'c0000000-0000-0000-0000-000000000003',
      escort_name: visitData.escort_name || 'Amit Kumar',
      pickup_location: visitData.pickup_location || 'Customer Residence / Office',
      party_size: Number(visitData.party_size || 2),
      visit_notes: visitData.visit_notes || '',
      feedback: visitData.feedback || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('site_visits').insert([newVisit]).select().single();
        if (!error && data) return data as SiteVisit;
      } catch (e) {
        console.warn('Supabase createSiteVisit failed on server:', e);
      }
    }

    serverState.siteVisits.unshift(newVisit);

    if (visitData.lead_id) {
      await this.updateLead(visitData.lead_id, { status: 'site_visit_scheduled' });
    }

    return newVisit;
  }

  static async updateSiteVisit(id: string, updates: Partial<SiteVisit>): Promise<SiteVisit | null> {
    const patch = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('site_visits')
          .update(patch)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as SiteVisit;
      } catch (e) {
        console.warn('Supabase updateSiteVisit failed on server:', e);
      }
    }

    const idx = serverState.siteVisits.findIndex((v) => v.id === id);
    if (idx !== -1) {
      serverState.siteVisits[idx] = { ...serverState.siteVisits[idx], ...patch };
      return serverState.siteVisits[idx];
    }
    return null;
  }

  // --- DOCUMENTS ---
  static async getDocuments(category?: string): Promise<CrmDocument[]> {
    let list = [...serverState.documents];
    if (category && category !== 'all') {
      list = list.filter((d) => d.category === category);
    }
    return list;
  }

  static async createDocument(docData: Partial<CrmDocument>): Promise<CrmDocument> {
    const newDoc: CrmDocument = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: docData.title || 'Untitled Document',
      category: docData.category || 'brochure',
      file_type: docData.file_type || 'pdf',
      file_size_kb: docData.file_size_kb || 2400,
      file_url: docData.file_url || '#',
      description: docData.description || '',
      uploaded_by: docData.uploaded_by || 'Red Hill Team',
      is_company_document: docData.is_company_document ?? true,
      created_at: new Date().toISOString(),
    };

    serverState.documents.unshift(newDoc);
    return newDoc;
  }

  // --- CRM STATS ---
  static async getStats() {
    const leads = serverState.leads;
    const calls = serverState.calls;
    const siteVisits = serverState.siteVisits;

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const contacted = leads.filter((l) => l.status === 'contacted').length;
    const interested = leads.filter((l) => l.status === 'interested').length;
    const siteVisitsScheduled = leads.filter((l) => l.status === 'site_visit_scheduled').length;
    const converted = leads.filter((l) => l.status === 'converted').length;
    const notInterested = leads.filter((l) => l.status === 'not_interested').length;

    const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0';

    return {
      totalLeads,
      newLeads,
      contacted,
      interested,
      siteVisitsScheduled,
      converted,
      notInterested,
      conversionRate: `${conversionRate}%`,
      totalCalls: calls.length,
      totalVisits: siteVisits.length,
      stages: [
        { name: 'Ad Ingestion (New)', count: newLeads },
        { name: 'Telecaller Contacted', count: contacted },
        { name: 'Qualified & Interested', count: interested },
        { name: 'Site Visit Completed', count: siteVisitsScheduled },
        { name: 'Final Booking Done', count: converted },
      ],
    };
  }
}

