/* ============================================================
   AUTOREPHERO — Admin Panel (Chuck Only)
   Design: Dark Command Center / Field Operations UI
   Features: All businesses, leads, plan management, trial extension
   ============================================================ */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Shield, LogOut, Users, BarChart3, Loader2, ExternalLink,
  Edit2, Trash2, Plus, ChevronDown, ChevronUp, Check, X,
  AlertTriangle, Star, Zap, RefreshCw, Mail, Phone
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Plan tier badge ──────────────────────────────────────────
function PlanBadge({ tier, expired }: { tier: string; expired?: boolean }) {
  if (expired) return (
    <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
      EXPIRED
    </span>
  );
  const styles: Record<string, string> = {
    trial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    kit: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    core: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };
  const labels: Record<string, string> = { trial: "TRIAL", kit: "KIT", core: "CORE", pro: "PRO" };
  return (
    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded border ${styles[tier] || styles.trial}`}>
      {labels[tier] || tier.toUpperCase()}
    </span>
  );
}

// ─── Business row ─────────────────────────────────────────────
function BusinessRow({ biz, onRefresh }: { biz: any; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(biz.planTier);

  const updatePlan = trpc.admin.updateBusinessPlan.useMutation({
    onSuccess: () => { toast.success("Plan updated"); setEditPlan(false); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });
  const extendTrial = trpc.admin.extendTrial.useMutation({
    onSuccess: () => { toast.success("Trial extended 14 days"); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteBiz = trpc.admin.deleteBusiness.useMutation({
    onSuccess: () => { toast.success("Business deleted"); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  const hubUrl = `${window.location.origin}/review/${biz.slug}`;
  const trialDaysLeft = biz.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(biz.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
      {/* Row header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-bold truncate">{biz.name}</span>
            <PlanBadge tier={biz.planTier} expired={biz.trialExpired} />
            {biz.planTier === "trial" && !biz.trialExpired && trialDaysLeft !== null && (
              <span className="text-[0.6rem] text-white/30">{trialDaysLeft}d left</span>
            )}
          </div>
          <div className="text-white/30 text-xs mt-0.5">{biz.ownerEmail} · /{biz.slug}</div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/owner?bizId=${biz.id}`}
            onClick={e => e.stopPropagation()}
            className="text-[0.65rem] text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-400/30 hover:border-blue-300/50 transition-all">
            Manage
          </a>
          <a href={hubUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-white/30 hover:text-white/60 p-1.5 rounded transition-all">
            <ExternalLink size={14} />
          </a>
          {expanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          {/* Business info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Owner", value: biz.ownerName || "—" },
              { label: "Type", value: biz.businessType || "—" },
              { label: "Phone", value: biz.phone || "—" },
              { label: "Created", value: biz.createdAt ? new Date(biz.createdAt).toLocaleDateString() : "—" },
              { label: "Platforms", value: `${biz.platformCount || 0} active` },
              { label: "Staff", value: `${biz.staffCount || 0} members` },
            ].map(f => (
              <div key={f.label}>
                <div className="text-white/30 text-[0.6rem] font-bold tracking-widest uppercase">{f.label}</div>
                <div className="text-white/70">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Plan management */}
          <div className="rounded-lg p-3"
            style={{ background: "oklch(0.11 0.015 240)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs font-bold tracking-widest uppercase">Plan</span>
              <button onClick={() => setEditPlan(v => !v)}
                className="text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors">
                {editPlan ? "Cancel" : "Change"}
              </button>
            </div>
            {editPlan ? (
              <div className="flex gap-2 flex-wrap">
                {["trial", "kit", "core", "pro"].map(p => (
                  <button key={p} onClick={() => setSelectedPlan(p)}
                    className="px-3 py-1.5 rounded text-xs font-bold transition-all"
                    style={{
                      background: selectedPlan === p ? "oklch(0.62 0.2 240)" : "oklch(0.18 0.02 240)",
                      color: selectedPlan === p ? "#fff" : "oklch(0.6 0.05 240)",
                      border: `1px solid ${selectedPlan === p ? "oklch(0.62 0.2 240)" : "oklch(0.25 0.03 240)"}`,
                    }}>
                    {p.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={() => updatePlan.mutate({ businessId: biz.id, planTier: selectedPlan })}
                  disabled={updatePlan.isPending}
                  className="px-3 py-1.5 rounded text-xs font-bold transition-all"
                  style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}>
                  {updatePlan.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <PlanBadge tier={biz.planTier} expired={biz.trialExpired} />
                {biz.planTier === "trial" && (
                  <button
                    onClick={() => extendTrial.mutate({ businessId: biz.id })}
                    disabled={extendTrial.isPending}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors">
                    {extendTrial.isPending ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    Extend 14 days
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (confirm(`Delete "${biz.name}"? This cannot be undone.`)) {
                  deleteBiz.mutate({ businessId: biz.id });
                }
              }}
              disabled={deleteBiz.isPending}
              className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors">
              {deleteBiz.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Delete business
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Business Modal ────────────────────────────────────
function CreateBusinessModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<{
    ownerName: string; ownerEmail: string; ownerPassword: string; businessName: string;
    planTier: "trial" | "kit" | "core" | "pro";
  }>({
    ownerName: "", ownerEmail: "", ownerPassword: "", businessName: "", planTier: "trial",
  });

  const create = trpc.admin.createBusiness.useMutation({
    onSuccess: () => { toast.success("Business created"); onSuccess(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6"
        style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.12)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Create Business</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { key: "ownerName", label: "Owner Name", placeholder: "John Smith" },
            { key: "ownerEmail", label: "Owner Email", placeholder: "john@business.com", type: "email" },
            { key: "ownerPassword", label: "Password", placeholder: "Min 8 chars", type: "password" },
            { key: "businessName", label: "Business Name", placeholder: "Smith Auto Repair" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-white/40 text-[0.6rem] font-bold tracking-widest mb-1 uppercase">{f.label}</label>
              <input
                type={(f as any).type || "text"}
                placeholder={f.placeholder}
                className={inputClass}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="block text-white/40 text-[0.6rem] font-bold tracking-widest mb-1 uppercase">Plan</label>
            <select
              className={`${inputClass} cursor-pointer`}
              value={form.planTier}
              onChange={e => setForm(prev => ({ ...prev, planTier: e.target.value as "trial" | "kit" | "core" | "pro" }))}>
              <option value="trial" style={{ background: "#1a1a2e" }}>Trial (14 days)</option>
              <option value="kit" style={{ background: "#1a1a2e" }}>RRDS Kit ($149)</option>
              <option value="core" style={{ background: "#1a1a2e" }}>Core Plan ($47/mo)</option>
              <option value="pro" style={{ background: "#1a1a2e" }}>Pro ($197/mo)</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => create.mutate(form)}
          disabled={create.isPending}
          className="w-full mt-4 py-3 rounded-lg text-sm font-bold disabled:opacity-50 transition-all"
          style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
          {create.isPending ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
          Create Business
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────
export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"businesses" | "leads" | "stats">("businesses");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const meQuery = trpc.auth.me.useQuery();
  const bizQuery = trpc.admin.getAllBusinesses.useQuery();
  const leadsQuery = trpc.admin.getAllLeads.useQuery();
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => navigate("/login") });

  // Redirect if not admin
  useEffect(() => {
    if (!meQuery.isLoading && meQuery.data && meQuery.data.role !== "admin") {
      navigate("/owner");
    }
    if (!meQuery.isLoading && !meQuery.data) {
      navigate("/login");
    }
  }, [meQuery.isLoading, meQuery.data]);

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.10 0.015 240)" }}>
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  const businesses = bizQuery.data || [];
  const leads = leadsQuery.data || [];

  const filteredBiz = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase()) ||
    (b.email || "").toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total: businesses.length,
    trial: businesses.filter(b => b.planTier === "trial").length,
    kit: businesses.filter(b => b.planTier === "kit").length,
    core: businesses.filter(b => b.planTier === "core").length,
    expired: businesses.filter(b => b.trialExpired).length,
    leads: leads.length,
  };

  const tabClass = (t: string) => `px-4 py-2 text-xs font-bold tracking-widest rounded-lg transition-all ${
    activeTab === t ? "text-white" : "text-white/40 hover:text-white/70"
  }`;
  const tabStyle = (t: string) => activeTab === t
    ? { background: "oklch(0.62 0.2 240 / 0.2)", color: "oklch(0.7 0.22 240)" }
    : {};

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.10 0.015 240)", fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.55 0.18 80 / 0.15)", border: "1px solid oklch(0.55 0.18 80 / 0.3)" }}>
            <Shield size={16} style={{ color: "oklch(0.65 0.18 80)" }} />
          </div>
          <div>
            <div className="text-white text-sm font-bold">AutoRepHero Admin</div>
            <div className="text-amber-400/60 text-xs">Chuck's Command Center</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/owner")}
            className="text-white/40 hover:text-white/70 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "oklch(0.62 0.2 240 / 0.1)", border: "1px solid oklch(0.62 0.2 240 / 0.2)" }}>
            MY ACCOUNT
          </button>
          <button onClick={() => logout.mutate()}
            className="text-white/40 hover:text-white/70 p-2 rounded-lg transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: "TOTAL CLIENTS", value: stats.total, color: "oklch(0.7 0.22 240)" },
            { label: "ACTIVE CORE", value: stats.core, color: "oklch(0.65 0.18 150)" },
            { label: "TRIAL EXPIRED", value: stats.expired, color: "oklch(0.55 0.2 25)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/30 text-[0.55rem] font-bold tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "oklch(0.14 0.015 240)" }}>
          {(["businesses", "leads", "stats"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={tabClass(t)} style={tabStyle(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Businesses tab */}
        {activeTab === "businesses" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search businesses..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/60"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {bizQuery.isLoading && (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
            )}

            {filteredBiz.map(biz => (
              <BusinessRow key={biz.id} biz={biz} onRefresh={() => bizQuery.refetch()} />
            ))}

            {!bizQuery.isLoading && filteredBiz.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">
                {search ? "No businesses match your search." : "No businesses yet. Add your first client."}
              </div>
            )}
          </div>
        )}

        {/* Leads tab */}
        {activeTab === "leads" && (
          <div className="space-y-2">
            {leadsQuery.isLoading && (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
            )}
            {leads.map(lead => (
              <div key={lead.id} className="rounded-xl p-4"
                style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white text-sm font-bold">{lead.name || "Anonymous"}</div>
                    <div className="text-white/30 text-xs mt-0.5">{lead.businessName}</div>
                  </div>
                  <div className="text-white/20 text-[0.6rem]">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`}
                      className="flex items-center gap-1 text-xs text-blue-400/70 hover:text-blue-400 transition-colors">
                      <Mail size={11} /> {lead.email}
                    </a>
                  )}
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`}
                      className="flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors">
                      <Phone size={11} /> {lead.phone}
                    </a>
                  )}
                </div>
                {lead.source && (
                  <div className="text-white/20 text-[0.6rem] mt-1 uppercase tracking-widest">{lead.source}</div>
                )}
              </div>
            ))}
            {!leadsQuery.isLoading && leads.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">No leads yet.</div>
            )}
          </div>
        )}

        {/* Stats tab */}
        {activeTab === "stats" && (
          <div className="space-y-3">
            <div className="rounded-xl p-5"
              style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
              <p className="text-white/40 text-xs font-bold tracking-widest mb-4 uppercase">Plan Distribution</p>
              {[
                { label: "Trial", count: stats.trial, color: "oklch(0.65 0.18 80)" },
                { label: "RRDS Kit", count: stats.kit, color: "oklch(0.62 0.2 240)" },
                { label: "Core Plan", count: stats.core, color: "oklch(0.65 0.18 150)" },
                { label: "Expired", count: stats.expired, color: "oklch(0.55 0.2 25)" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 mb-3">
                  <div className="text-white/60 text-xs w-20">{s.label}</div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "oklch(0.18 0.02 240)" }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{
                        width: stats.total ? `${(s.count / stats.total) * 100}%` : "0%",
                        background: s.color,
                      }} />
                  </div>
                  <div className="text-white/60 text-xs w-6 text-right">{s.count}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-5"
              style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
              <p className="text-white/40 text-xs font-bold tracking-widest mb-4 uppercase">Revenue Estimate</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Kit revenue ({stats.kit} × $149)</span>
                  <span className="text-white font-bold">${(stats.kit * 149).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Core MRR ({stats.core} × $47)</span>
                  <span className="text-white font-bold">${(stats.core * 47).toLocaleString()}/mo</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                  <span className="text-white/50">Total leads captured</span>
                  <span className="text-white font-bold">{stats.leads}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateBusinessModal onClose={() => setShowCreate(false)} onSuccess={() => bizQuery.refetch()} />
      )}
    </div>
  );
}
