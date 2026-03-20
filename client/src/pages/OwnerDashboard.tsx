/* ============================================================
   AUTOREPHERO — Owner Dashboard (Multi-Tenant)
   Design: Dark Command Center / Field Operations UI
   Features: Business management, platform config, staff, analytics
   ============================================================ */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Shield, Settings, BarChart3, Users, Copy, ExternalLink,
  QrCode, ToggleLeft, ToggleRight, LogOut, Plus, Loader2,
  Lock, AlertTriangle, ChevronDown, ChevronUp, Star, Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const STRIPE_KIT = "https://pay.chuckzonline.com/b/eVq28jfRU3tl57VdBu63K01";
const STRIPE_CORE = "https://pay.chuckzonline.com/b/4gMeV5eNQ5Bt0RF1SM63K02";

// ─── Plan tier badge ──────────────────────────────────────────
function PlanBadge({ tier, expired }: { tier: string; expired: boolean }) {
  if (expired) return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-red-500/15 text-red-400 border border-red-500/30">
      TRIAL EXPIRED
    </span>
  );
  const styles: Record<string, string> = {
    trial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    kit: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    core: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };
  const labels: Record<string, string> = { trial: "FREE TRIAL", kit: "RRDS KIT", core: "CORE PLAN", pro: "PRO" };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm border ${styles[tier] || styles.trial}`}>
      {labels[tier] || tier.toUpperCase()}
    </span>
  );
}

// ─── Platform icon ────────────────────────────────────────────
function PlatformIcon({ icon, color, size = 28 }: { icon: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, background: color, borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.44, fontWeight: 800, color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0,
    }}>
      {icon}
    </div>
  );
}

// ─── Upgrade prompt ───────────────────────────────────────────
function UpgradePrompt({ expired }: { expired: boolean }) {
  return (
    <div className="rounded-xl p-5 mb-6"
      style={{ background: "oklch(0.55 0.18 30 / 0.12)", border: "1px solid oklch(0.55 0.18 30 / 0.3)" }}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-amber-300 font-bold text-sm mb-1">
            {expired ? "Trial Expired — Upgrade to Continue" : "Free Trial Active"}
          </p>
          <p className="text-white/50 text-xs mb-4">
            {expired
              ? "Your 14-day trial has ended. Your review hub link still works for customers, but dashboard access is locked until you upgrade."
              : "You have access to Facebook, Yelp, and BBB. Upgrade to unlock Google and all platforms."}
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={STRIPE_KIT} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
              <Zap size={12} /> RRDS Kit — $149 one-time
            </a>
            <a href={STRIPE_CORE} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}>
              <Star size={12} /> Core Plan — $47/mo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function OwnerDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "platforms" | "staff" | "settings">("overview");
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const [showCreateBiz, setShowCreateBiz] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [showQR, setShowQR] = useState(false);

  const meQuery = trpc.auth.me.useQuery();
  const bizQuery = trpc.business.myBusinesses.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => navigate("/login"),
  });

  const createBiz = trpc.business.create.useMutation({
    onSuccess: (biz) => {
      toast.success(`${biz?.name} created!`);
      setShowCreateBiz(false);
      setNewBizName("");
      bizQuery.refetch();
      if (biz?.id) setSelectedBizId(biz.id);
    },
    onError: (e) => toast.error(e.message),
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!meQuery.isLoading && !meQuery.data) {
      navigate("/login");
    }
  }, [meQuery.isLoading, meQuery.data]);

  // Auto-select first business
  useEffect(() => {
    if (bizQuery.data && bizQuery.data.length > 0 && !selectedBizId) {
      setSelectedBizId(bizQuery.data[0].id);
    }
  }, [bizQuery.data]);

  const selectedBiz = bizQuery.data?.find(b => b.id === selectedBizId);
  const hubUrl = selectedBiz ? `${window.location.origin}/review/${selectedBiz.slug}` : "";

  const platformsQuery = trpc.business.getPlatforms.useQuery(
    { businessId: selectedBizId! },
    { enabled: !!selectedBizId }
  );
  const staffQuery = trpc.business.getStaff.useQuery(
    { businessId: selectedBizId! },
    { enabled: !!selectedBizId }
  );

  const updatePlatform = trpc.business.updatePlatform.useMutation({
    onSuccess: () => platformsQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.10 0.015 240)" }}>
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  const user = meQuery.data;
  const isTrialExpired = selectedBiz?.trialExpired || false;
  const planTier = selectedBiz?.planTier || "trial";

  // Platforms locked on trial/kit: only FB, Yelp, BBB enabled
  const TRIAL_PLATFORMS = ["facebook", "yelp", "bbb"];
  function isPlatformLocked(platformId: string): boolean {
    if (planTier === "core" || planTier === "pro") return false;
    return !TRIAL_PLATFORMS.includes(platformId);
  }

  const tabClass = (t: string) => `px-4 py-2 text-xs font-bold tracking-widest rounded-lg transition-all ${
    activeTab === t
      ? "text-white"
      : "text-white/40 hover:text-white/70"
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
            style={{ background: "oklch(0.62 0.2 240 / 0.15)", border: "1px solid oklch(0.62 0.2 240 / 0.3)" }}>
            <Shield size={16} style={{ color: "oklch(0.7 0.22 240)" }} />
          </div>
          <div>
            <div className="text-white text-sm font-bold">AutoRepHero</div>
            <div className="text-white/30 text-xs">{user?.name || user?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <button onClick={() => navigate("/admin")}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "oklch(0.55 0.18 80 / 0.15)", border: "1px solid oklch(0.55 0.18 80 / 0.3)" }}>
              ADMIN
            </button>
          )}
          <button onClick={() => logout.mutate()}
            className="text-white/40 hover:text-white/70 p-2 rounded-lg transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">

        {/* Business selector */}
        <div className="flex items-center gap-2 mb-4">
          <select
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/60"
            value={selectedBizId || ""}
            onChange={e => setSelectedBizId(Number(e.target.value))}
          >
            {bizQuery.data?.map(b => (
              <option key={b.id} value={b.id} style={{ background: "#1a1a2e" }}>
                {b.name}
              </option>
            ))}
            {!bizQuery.data?.length && <option value="">No businesses yet</option>}
          </select>
          <button onClick={() => setShowCreateBiz(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ background: "oklch(0.62 0.2 240 / 0.15)", border: "1px solid oklch(0.62 0.2 240 / 0.3)", color: "oklch(0.7 0.22 240)" }}>
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Create business form */}
        {showCreateBiz && (
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
            <p className="text-white/60 text-xs font-bold tracking-widest mb-3 uppercase">New Business</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Business name"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/60"
                value={newBizName}
                onChange={e => setNewBizName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && newBizName.trim() && createBiz.mutate({ name: newBizName.trim() })}
              />
              <button
                onClick={() => newBizName.trim() && createBiz.mutate({ name: newBizName.trim() })}
                disabled={createBiz.isPending || !newBizName.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-all"
                style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
                {createBiz.isPending ? <Loader2 size={14} className="animate-spin" /> : "Create"}
              </button>
            </div>
          </div>
        )}

        {selectedBiz && (
          <>
            {/* Plan badge + trial warning */}
            <div className="flex items-center gap-2 mb-4">
              <PlanBadge tier={planTier} expired={isTrialExpired} />
              {(planTier === "trial" || isTrialExpired) && (
                <span className="text-white/30 text-xs">
                  {isTrialExpired ? "Upgrade to restore dashboard access" : "14-day trial · FB, Yelp, BBB only"}
                </span>
              )}
            </div>

            {isTrialExpired && <UpgradePrompt expired={true} />}
            {!isTrialExpired && planTier === "trial" && <UpgradePrompt expired={false} />}

            {/* Hub URL bar */}
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4"
              style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
              <div className="flex-1 text-white/50 text-xs truncate">{hubUrl}</div>
              <button onClick={() => { navigator.clipboard.writeText(hubUrl); toast.success("Hub URL copied"); }}
                className="text-white/40 hover:text-white/70 p-1.5 rounded-md transition-all">
                <Copy size={14} />
              </button>
              <a href={hubUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/40 hover:text-white/70 p-1.5 rounded-md transition-all">
                <ExternalLink size={14} />
              </a>
              <button onClick={() => setShowQR(v => !v)}
                className="text-white/40 hover:text-white/70 p-1.5 rounded-md transition-all">
                <QrCode size={14} />
              </button>
            </div>

            {/* QR code */}
            {showQR && (
              <div className="flex justify-center mb-4 p-4 rounded-xl"
                style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <QRCodeSVG value={hubUrl} size={180} bgColor="transparent" fgColor="#ffffff" />
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl"
              style={{ background: "oklch(0.14 0.015 240)" }}>
              {(["overview", "platforms", "staff", "settings"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={tabClass(t)} style={tabStyle(t)}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "PLATFORMS", value: platformsQuery.data?.filter(p => p.enabled).length || 0 },
                    { label: "STAFF", value: staffQuery.data?.length || 0 },
                    { label: "TOTAL REVIEWS", value: platformsQuery.data?.reduce((s, p) => s + p.reviewCount, 0) || 0 },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                      <div className="text-2xl font-bold text-white">{s.value}</div>
                      <div className="text-white/30 text-[0.6rem] font-bold tracking-widest mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4"
                  style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                  <p className="text-white/40 text-xs font-bold tracking-widest mb-3 uppercase">Quick Actions</p>
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab("platforms")}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all">
                      <Settings size={16} className="text-blue-400" />
                      <span className="text-white/70 text-sm">Configure platforms & review URLs</span>
                    </button>
                    <button onClick={() => setActiveTab("staff")}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all">
                      <Users size={16} className="text-emerald-400" />
                      <span className="text-white/70 text-sm">Manage staff scoreboard</span>
                    </button>
                    <a href={hubUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all">
                      <ExternalLink size={16} className="text-amber-400" />
                      <span className="text-white/70 text-sm">Preview customer review hub</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Platforms tab */}
            {activeTab === "platforms" && (
              <div className="space-y-2">
                {platformsQuery.isLoading && (
                  <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
                )}
                {platformsQuery.data?.map(p => {
                  const locked = isPlatformLocked(p.platformId);
                  return (
                    <div key={p.id} className="rounded-xl p-4"
                      style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)", opacity: locked ? 0.6 : 1 }}>
                      <div className="flex items-center gap-3">
                        <PlatformIcon icon={p.icon || p.name[0]} color={p.color || "#555"} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-bold">{p.shortName || p.name}</span>
                            {locked && (
                              <span className="flex items-center gap-1 text-[0.6rem] text-amber-400/70 font-bold">
                                <Lock size={10} /> UPGRADE
                              </span>
                            )}
                          </div>
                          <div className="text-white/30 text-xs">{p.reviewCount} / {p.targetCount} reviews</div>
                        </div>
                        {!locked && (
                          <button
                            onClick={() => updatePlatform.mutate({ businessId: selectedBizId!, platformId: p.platformId, enabled: !p.enabled })}
                            className="text-white/60 hover:text-white transition-colors">
                            {p.enabled ? <ToggleRight size={24} style={{ color: "oklch(0.7 0.22 240)" }} /> : <ToggleLeft size={24} />}
                          </button>
                        )}
                      </div>
                      {!locked && p.enabled && (
                        <div className="mt-3">
                          <input
                            type="url"
                            placeholder={`Paste your ${p.shortName || p.name} review URL`}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs placeholder-white/20 focus:outline-none focus:border-blue-500/40"
                            defaultValue={p.url || ""}
                            onBlur={e => {
                              if (e.target.value !== (p.url || "")) {
                                updatePlatform.mutate({ businessId: selectedBizId!, platformId: p.platformId, url: e.target.value });
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Staff tab */}
            {activeTab === "staff" && (
              <StaffTab businessId={selectedBizId!} />
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <SettingsTab biz={selectedBiz} onUpdate={() => bizQuery.refetch()} />
            )}
          </>
        )}

        {!bizQuery.isLoading && !selectedBiz && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield size={48} className="text-white/20 mb-4" />
            <p className="text-white/40 text-sm">No businesses yet.</p>
            <p className="text-white/30 text-xs mt-1">Click "Add" to create your first review hub.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Staff tab ────────────────────────────────────────────────
function StaffTab({ businessId }: { businessId: number }) {
  const [newName, setNewName] = useState("");
  const staffQuery = trpc.business.getStaff.useQuery({ businessId });
  const addStaff = trpc.business.recordStaffActivity.useMutation({
    onSuccess: () => { staffQuery.refetch(); setNewName(""); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const updateStaff = trpc.business.recordStaffActivity.useMutation({
    onSuccess: () => staffQuery.refetch(),
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Staff member name"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/60"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && newName.trim() && addStaff.mutate({ businessId, name: newName.trim() })}
        />
        <button
          onClick={() => newName.trim() && addStaff.mutate({ businessId, name: newName.trim() })}
          disabled={addStaff.isPending || !newName.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
          style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
          Add
        </button>
      </div>
      {staffQuery.data?.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3 rounded-xl p-4"
          style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "oklch(0.62 0.2 240 / 0.2)", color: "oklch(0.7 0.22 240)" }}>
            {i + 1}
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-bold">{s.name}</div>
            <div className="text-white/30 text-xs">{s.shares} shares · {s.reviews} reviews</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => updateStaff.mutate({ businessId, name: s.name, shares: 1 })}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-500/30 transition-all">
              +Share
            </button>
            <button onClick={() => updateStaff.mutate({ businessId, name: s.name, reviews: 1 })}
              className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded border border-emerald-500/30 transition-all">
              +Review
            </button>
          </div>
        </div>
      ))}
      {!staffQuery.data?.length && (
        <p className="text-white/30 text-sm text-center py-8">No staff added yet.</p>
      )}
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────
function SettingsTab({ biz, onUpdate }: { biz: any; onUpdate: () => void }) {
  const [form, setForm] = useState({
    name: biz.name || "",
    businessType: biz.businessType || "",
    phone: biz.phone || "",
    email: biz.email || "",
    ownerPin: biz.ownerPin || "1234",
    tagline: biz.tagline || "",
  });

  const update = trpc.business.update.useMutation({
    onSuccess: () => { toast.success("Settings saved"); onUpdate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 rounded-xl p-5"
      style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
      <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Business Settings</p>
      {[
        { key: "name", label: "Business Name", placeholder: "Your Business Name" },
        { key: "businessType", label: "Business Type", placeholder: "Auto Repair, Dental, etc." },
        { key: "phone", label: "Phone", placeholder: "(509) 555-0100" },
        { key: "email", label: "Contact Email", placeholder: "info@yourbusiness.com" },
        { key: "tagline", label: "Tagline", placeholder: "Your reputation, protected." },
        { key: "ownerPin", label: "Owner PIN (4 digits)", placeholder: "1234" },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-white/50 text-xs font-semibold tracking-widest mb-1.5 uppercase">{f.label}</label>
          <input
            type={f.key === "ownerPin" ? "password" : "text"}
            placeholder={f.placeholder}
            maxLength={f.key === "ownerPin" ? 4 : undefined}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/60"
            value={(form as any)[f.key]}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      <button
        onClick={() => update.mutate({ id: biz.id, ...form })}
        disabled={update.isPending}
        className="w-full py-3 rounded-lg text-sm font-bold disabled:opacity-50 transition-all"
        style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
        {update.isPending ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
        Save Settings
      </button>
    </div>
  );
}
