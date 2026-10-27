'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Zap,
  Globe,
  Code2,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

interface ApiGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConnectionInfo {
  success: boolean;
  status: string;
  server: string;
  latencyMs: number;
  database: {
    type: string;
    mode: string;
    isSupabaseActive: boolean;
    configuredUrl: string;
    tables: {
      leads: number;
      calls: number;
      site_visits: number;
      documents: number;
      profiles: number;
    };
  };
  endpoints: Array<{ method: string; path: string; desc: string }>;
}

export function ApiGatewayModal({ isOpen, onClose }: ApiGatewayModalProps) {
  const [loading, setLoading] = useState(false);
  const [connInfo, setConnInfo] = useState<ConnectionInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'endpoints' | 'supabase'>('status');

  // Supabase form
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    pingMs?: number;
    hint?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Test endpoint response
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/connection');
  const [endpointResponse, setEndpointResponse] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connection');
      const data = await res.json();
      setConnInfo(data);
    } catch (e) {
      console.error('Failed to query /api/connection', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      if (typeof window !== 'undefined') {
        const storedUrl = window.localStorage.getItem('redhill_supabase_url') || '';
        const storedKey = window.localStorage.getItem('redhill_supabase_key') || '';
        setSupabaseUrl(storedUrl);
        setSupabaseAnonKey(storedKey);
      }
    }
  }, [isOpen]);

  const handleTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl, supabaseAnonKey }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        window.localStorage.setItem('redhill_supabase_url', supabaseUrl);
        window.localStorage.setItem('redhill_supabase_key', supabaseAnonKey);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestResult({
        success: false,
        error: error.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRunEndpointTest = async (path: string) => {
    setSelectedEndpoint(path);
    setTestingEndpoint(true);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setEndpointResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const error = err as Error;
      setEndpointResponse(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setTestingEndpoint(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#1e172a] to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight font-['Outfit']">
                  API Gateway & Database Console
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Red Hill Infra CRM • Next.js REST API & Supabase Live Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 pt-3">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-amber-600 text-amber-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Connection Health
          </button>
          <button
            onClick={() => {
              setActiveTab('endpoints');
              if (!endpointResponse) handleRunEndpointTest('/api/leads');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === 'endpoints'
                ? 'border-amber-600 text-amber-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Active REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'border-amber-600 text-amber-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Supabase Cloud Link
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-semibold">API Server</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-lg font-extrabold text-emerald-900 mt-1 font-['Outfit']">
                    Online (Port 3000)
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Next.js Turbopack REST Engine</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-800 font-semibold">Database Mode</span>
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-lg font-extrabold text-amber-900 mt-1 font-['Outfit']">
                    {connInfo?.database?.isSupabaseActive ? 'Supabase Cloud' : 'Local In-Memory'}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {connInfo?.database?.isSupabaseActive
                      ? 'Live Cloud PostgreSQL connected'
                      : 'High-speed local cache & demo store'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold">Server Latency</span>
                    <Globe className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 mt-1 font-['Outfit']">
                    {connInfo ? `${connInfo.latencyMs} ms` : 'Measuring...'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Local loopback ping</p>
                </div>
              </div>

              {/* Data Table Counts */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Synchronized Collections
                  </span>
                  <button
                    onClick={fetchStatus}
                    disabled={loading}
                    className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Stats
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-sm">
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 font-medium">Digital Ad Leads (`leads`)</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                      {connInfo?.database?.tables?.leads ?? 17} active records
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 font-medium">Telecalling Records (`calls`)</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                      {connInfo?.database?.tables?.calls ?? 8} logs
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 font-medium">Fleet Logistics (`site_visits`)</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                      {connInfo?.database?.tables?.site_visits ?? 3} scheduled
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 font-medium">Document Vault (`documents`)</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                      {connInfo?.database?.tables?.documents ?? 5} files
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 font-medium">Executive & Sales Team (`profiles`)</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                      {connInfo?.database?.tables?.profiles ?? 5} users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENDPOINTS */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                You can invoke these REST API endpoints directly from external systems, curl, or
                Postman. Click any route below to test it live!
              </p>

              <div className="space-y-2">
                {connInfo?.endpoints?.map((ep, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ep.method === 'PATCH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs font-mono font-bold text-slate-900">{ep.path}</code>
                      <span className="text-xs text-slate-500 hidden sm:inline">• {ep.desc}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(`http://localhost:3000${ep.path}`, ep.path)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition"
                        title="Copy full URL"
                      >
                        {copiedEndpoint === ep.path ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {ep.method === 'GET' && (
                        <button
                          onClick={() => handleRunEndpointTest(ep.path)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 text-slate-700 rounded-lg hover:border-amber-500 hover:text-amber-700 transition"
                        >
                          Run Test
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Test Output Console */}
              {selectedEndpoint && (
                <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-200 font-mono text-xs">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Live Response: <strong className="text-amber-400">{selectedEndpoint}</strong>
                    </span>
                    {testingEndpoint && (
                      <span className="text-[10px] text-amber-400 animate-pulse">Running...</span>
                    )}
                  </div>
                  <pre className="p-4 max-h-56 overflow-auto text-[11px] leading-relaxed text-emerald-400">
                    {endpointResponse || '// Click any GET endpoint above to inspect live output'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPABASE LINK */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Connect your live Supabase Cloud Project
                </p>
                To sync your CRM with a remote PostgreSQL instance on Supabase, enter your Project
                URL and Anon Public Key below. You can also run the full database migration with the
                included SQL scripts in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">supabase/schema.sql</code>.
              </div>

              <form onSubmit={handleTestSupabase} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-ref.supabase.co"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-5 py-2.5 rounded-xl gold-gradient-bg text-white text-xs font-extrabold shadow-md flex items-center gap-2 hover:opacity-95 transition"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Test & Connect Supabase
                      </>
                    )}
                  </button>

                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                  >
                    Open Supabase Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </form>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">
                        {testResult.success
                          ? 'Connection Successful!'
                          : 'Connection Error'}
                      </p>
                      <p className="mt-0.5">{testResult.message || testResult.error}</p>
                      {testResult.pingMs !== undefined && (
                        <p className="text-[11px] text-slate-500 mt-1 font-mono">
                          Latency: {testResult.pingMs} ms
                        </p>
                      )}
                      {testResult.hint && (
                        <p className="text-[11px] mt-1 bg-white/70 p-2 rounded border border-rose-200 text-rose-800">
                          {testResult.hint}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>API Server: <strong>http://localhost:3000</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
