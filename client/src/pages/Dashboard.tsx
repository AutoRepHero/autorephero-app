/* ============================================================
   AUTOREPHERO REVIEW HUB — Owner Dashboard
   Design: Dark Command Center / Field Operations UI
   Features: PIN auth, platform management, analytics, settings,
   QR code, NFC setup guide, pricing tiers
   ============================================================ */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Star, Settings, BarChart3, ArrowLeft,
  ChevronUp, ChevronDown, Eye, Copy, Shield,
  Lock, QrCode, ExternalLink, ToggleLeft, ToggleRight,
  Zap, Check
} from "lucide-react";
import {
  getConfig,
  saveConfig,
  getProgressPercent,
  getSmartSortedPlatforms,
  type ReviewPlatform,
  type BusinessConfig,
} from "@/lib/reviewData";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

// ─── Sub-components ───────────────────────────────────────────

function PlatformIcon({ platform, size = 32 }: { platform: ReviewPlatform; size?: number }) {
  return (
    <div style={{
      width: size, height: size, background: platform.color,
      borderRadius: 7, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.44, fontWeight: 800,
      color: "#fff", fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0,
    }}>
      {platform.icon}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="flex-1 cmd-card p-3">
      <div className="text-2xl font-bold mb-0.5"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: color || "oklch(0.95 0.005 255)" }}>
        {value}
      </div>
      <div className="text-[0.58rem] font-bold tracking-widest text-white/30"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
      {sub && <div className="text-white/25 text-[0.65rem] mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── PIN Gate ─────────────────────────────────────────────────
function PINGate({ correctPin, onSuccess }: { correctPin: string; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleDigit(d: string) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === correctPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 700);
      }
    }
  }

  function handleBack() {
    setPin(pin.slice(0, -1));
    setError(false);
  }

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.62 0.2 240 / 0.15)", border: "1px solid oklch(0.62 0.2 240 / 0.3)" }}>
          <Lock size={28} style={{ color: "oklch(0.7 0.22 240)" }} />
        </div>
        <h2 className="text-white text-xl font-bold mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Owner Access</h2>
        <p className="text-white/40 text-sm">Enter your 4-digit PIN</p>
        <p className="text-white/20 text-xs mt-1">(Demo PIN: 1234)</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-4 h-4 rounded-full transition-all"
            style={{
              background: i < pin.length
                ? (error ? "oklch(0.6 0.22 25)" : "oklch(0.7 0.22 240)")
                : "oklch(0.22 0.03 255)",
              boxShadow: i < pin.length && !error
                ? "0 0 12px oklch(0.7 0.22 240 / 0.5)" : "none",
            }} />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {digits.map((d, i) => (
          <button key={i}
            onClick={() => d === "⌫" ? handleBack() : d ? handleDigit(d) : undefined}
            disabled={!d}
            className="h-14 rounded-xl text-xl font-semibold transition-all"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: d ? "oklch(0.16 0.03 255)" : "transparent",
              border: d ? "1px solid oklch(0.25 0.04 255)" : "none",
              color: d === "⌫" ? "oklch(0.55 0.02 255)" : "oklch(0.9 0.005 255)",
              opacity: !d ? 0 : 1,
            }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Platforms Tab ────────────────────────────────────────────
function PlatformsTab({ config, onSave }: { config: BusinessConfig; onSave: (c: BusinessConfig) => void }) {
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>(
    [...config.platforms].sort((a, b) => a.order - b.order)
  );
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  function move(id: string, dir: "up" | "down") {
    const idx = platforms.findIndex(p => p.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === platforms.length - 1) return;
    const next = [...platforms];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    next.forEach((p, i) => { p.order = i + 1; });
    setPlatforms(next);
    onSave({ ...config, platforms: next });
    toast.success("Priority updated");
  }

  function toggleEnabled(id: string) {
    const next = platforms.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    setPlatforms(next);
    onSave({ ...config, platforms: next });
  }

  function startEditUrl(platform: ReviewPlatform) {
    setEditingUrl(platform.id);
    setUrlDraft(platform.url);
  }

  function saveUrl(id: string) {
    const next = platforms.map(p => p.id === id ? { ...p, url: urlDraft } : p);
    setPlatforms(next);
    onSave({ ...config, platforms: next });
    setEditingUrl(null);
    toast.success("Review URL saved");
  }

  const totalReviews = platforms.reduce((s, p) => s + p.reviewCount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-white/35 text-xs">Top platform gets the most traffic from smart routing.</p>
        <span className="text-white/25 text-xs">{totalReviews} total</span>
      </div>

      {platforms.map((platform: ReviewPlatform, i: number) => (
        <div key={platform.id} className="cmd-card p-3.5"
          style={{ opacity: platform.enabled ? 1 : 0.5 }}>
          <div className="flex items-center gap-3">
            <PlatformIcon platform={platform} size={36} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/90 text-sm font-semibold truncate"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {platform.name}
                </span>
                {i === 0 && platform.enabled && (
                  <span className="text-[0.55rem] font-bold tracking-widest px-1.5 py-0.5 rounded-sm"
                    style={{ background: "oklch(0.75 0.15 80 / 0.15)", color: "oklch(0.8 0.15 80)",
                      border: "1px solid oklch(0.75 0.15 80 / 0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    TOP
                  </span>
                )}
              </div>
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full" style={{ background: "oklch(0.2 0.02 255)" }}>
                  <div className="h-1 rounded-full transition-all"
                    style={{
                      width: `${getProgressPercent(platform.reviewCount, platform.targetCount)}%`,
                      background: i === 0 ? "oklch(0.75 0.15 80)" : "oklch(0.62 0.2 240)",
                    }} />
                </div>
                <span className="text-white/30 text-[0.62rem]">
                  {platform.reviewCount}/{platform.targetCount}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => toggleEnabled(platform.id)}
                className="p-1 transition-colors"
                style={{ color: platform.enabled ? "oklch(0.62 0.2 240)" : "oklch(0.35 0.04 255)" }}>
                {platform.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(platform.id, "up")}
                  className="p-1 rounded text-white/25 hover:text-white/60 hover:bg-white/8 transition-colors">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => move(platform.id, "down")}
                  className="p-1 rounded text-white/25 hover:text-white/60 hover:bg-white/8 transition-colors">
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* URL editor */}
          {editingUrl === platform.id ? (
            <div className="mt-3 flex gap-2">
              <input
                className="cmd-input text-xs flex-1"
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://..."
                autoFocus
              />
              <button onClick={() => saveUrl(platform.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "oklch(0.62 0.2 240)", color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
                <Check size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => startEditUrl(platform)}
              className="mt-2 flex items-center gap-1.5 text-[0.65rem] text-white/25 hover:text-white/50 transition-colors">
              <ExternalLink size={10} />
              <span className="truncate max-w-[200px]">{platform.url}</span>
            </button>
          )}
        </div>
      ))}

      <button
        className="w-full py-3 rounded-xl text-white/35 text-sm border border-dashed hover:border-white/25 hover:text-white/55 transition-all"
        style={{ borderColor: "oklch(0.25 0.04 255)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em" }}
        onClick={() => toast.info("Add platform — available in Pro tier")}>
        + ADD PLATFORM
      </button>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────
function AnalyticsTab({ config }: { config: BusinessConfig }) {
  const sorted = getSmartSortedPlatforms(config.platforms);
  const totalReviews = config.platforms.reduce((s: number, p: ReviewPlatform) => s + p.reviewCount, 0);
  const totalTarget = config.platforms.reduce((s: number, p: ReviewPlatform) => s + p.targetCount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalReviews / totalTarget) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <StatCard label="TOTAL REVIEWS" value={totalReviews} sub="across all platforms" color="oklch(0.78 0.15 80)" />
        <StatCard label="GOAL PROGRESS" value={`${overallPct}%`} sub={`of ${totalTarget} target`} color="oklch(0.7 0.22 240)" />
      </div>

      <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        PLATFORM BREAKDOWN
      </div>
      {sorted.map((platform: ReviewPlatform) => {
        const pct = getProgressPercent(platform.reviewCount, platform.targetCount);
        return (
          <div key={platform.id} className="flex items-center gap-3 py-2">
            <PlatformIcon platform={platform} size={28} />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-white/65 text-xs">{platform.shortName}</span>
                <span className="text-white/35 text-xs">{platform.reviewCount} reviews</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "oklch(0.18 0.025 255)" }}>
                <div className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${platform.color}88, ${platform.color})`,
                  }} />
              </div>
            </div>
            <span className="text-white/30 text-[0.65rem] w-8 text-right">{pct}%</span>
          </div>
        );
      })}

      {/* Pro upsell */}
      <div className="cmd-card p-4 mt-2"
        style={{ borderColor: "oklch(0.62 0.2 240 / 0.25)", background: "oklch(0.62 0.2 240 / 0.06)" }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={13} style={{ color: "oklch(0.7 0.22 240)" }} />
          <span className="text-xs font-bold tracking-wider"
            style={{ color: "oklch(0.7 0.22 240)", fontFamily: "'Space Grotesk', sans-serif" }}>
            PRO ANALYTICS
          </span>
        </div>
        <p className="text-white/35 text-xs">
          Upgrade to Pro for tap counts, conversion rates, and SMS/email follow-up performance tracking.
        </p>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────
function SettingsTab({ config, onSave }: { config: BusinessConfig; onSave: (c: BusinessConfig) => void }) {
  const [showQR, setShowQR] = useState(false);
  const shareUrl = config.hubUrl || window.location.origin;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    toast.success("Link copied — load it on your NFC card.");
  }

  const tiers = [
    { tier: "STARTER", price: "$49/mo", features: "Review Hub PWA · NFC/QR routing · AI prompts · 5 platforms", active: true },
    { tier: "GROWTH", price: "$99/mo", features: "Everything in Starter + SMS/Email automation · Review dashboard", active: false },
    { tier: "PRO", price: "$199/mo", features: "Everything in Growth + GBP posting · Social poster · Video creator", active: false },
    { tier: "AGENCY", price: "$299/mo", features: "Full platform · White-label · Unlimited clients · Citations", active: false },
  ];

  return (
    <div className="space-y-5">
      {/* Hub URL */}
      <div>
        <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          YOUR REVIEW HUB LINK
        </div>
        <div className="cmd-card p-3 flex items-center gap-2">
          <span className="text-xs flex-1 truncate" style={{ color: "oklch(0.6 0.02 255)" }}>{shareUrl}</span>
          <button onClick={copyLink} className="text-white/35 hover:text-white/70 transition-colors p-1">
            <Copy size={14} />
          </button>
        </div>
        <p className="text-white/25 text-xs mt-1.5 px-1">
          Program this URL onto your NFC card or print as a QR code.
        </p>
      </div>

      {/* QR Code */}
      <div>
        <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          QR CODE
        </div>
        {showQR ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-xl" style={{ background: "#ffffff" }}>
              <QRCodeSVG value={shareUrl} size={160} bgColor="#ffffff" fgColor="#0a0f1e" level="M" />
            </div>
            <p className="text-white/30 text-xs text-center">
              Print this on counter cards, receipts, or window stickers.
            </p>
          </div>
        ) : (
          <button onClick={() => setShowQR(true)}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
            style={{ background: "oklch(0.16 0.03 255)", border: "1px solid oklch(0.25 0.04 255)",
              color: "oklch(0.7 0.22 240)", fontFamily: "'Space Grotesk', sans-serif" }}>
            <QrCode size={15} />
            GENERATE QR CODE
          </button>
        )}
      </div>

      {/* NFC Setup */}
      <div>
        <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          NFC CARD SETUP
        </div>
        <div className="space-y-2.5">
          {[
            { n: "01", t: "Buy NTAG213 NFC cards on Amazon (~$10 for 20 cards)" },
            { n: "02", t: "Download 'NFC Tools' app (free on iOS and Android)" },
            { n: "03", t: "Open NFC Tools → Write → URL → paste your Hub link above" },
            { n: "04", t: "Tap the card on a phone — your Review Hub opens instantly" },
          ].map(({ n, t }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ color: "oklch(0.7 0.22 240)", fontFamily: "'Space Grotesk', sans-serif" }}>{n}</span>
              <p className="text-white/45 text-xs leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing tiers */}
      <div>
        <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          AUTOREPHERO PLANS
        </div>
        <div className="space-y-2">
          {tiers.map(({ tier, price, features, active }) => (
            <div key={tier} className="cmd-card p-3 flex items-center gap-3"
              style={active ? { borderColor: "oklch(0.62 0.2 240 / 0.4)", background: "oklch(0.62 0.2 240 / 0.07)" } : {}}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif",
                      color: active ? "oklch(0.7 0.22 240)" : "oklch(0.75 0.005 255)" }}>
                    {tier}
                  </span>
                  <span className="font-semibold text-xs"
                    style={{ color: active ? "oklch(0.78 0.15 80)" : "oklch(0.5 0.015 255)",
                      fontFamily: "'Space Grotesk', sans-serif" }}>
                    {price}
                  </span>
                  {active && (
                    <span className="text-[0.55rem] px-1.5 py-0.5 rounded-sm font-bold tracking-wider"
                      style={{ background: "oklch(0.62 0.2 240 / 0.2)", color: "oklch(0.7 0.22 240)",
                        border: "1px solid oklch(0.62 0.2 240 / 0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs">{features}</p>
              </div>
              {!active && (
                <button
                  onClick={() => toast.info("Contact AutoRepHero to upgrade — autorephero.com")}
                  className="text-xs border px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                  style={{ color: "oklch(0.7 0.22 240)", borderColor: "oklch(0.62 0.2 240 / 0.3)",
                    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em" }}>
                  UPGRADE
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brand footer */}
      <div className="cmd-card p-4"
        style={{ borderColor: "oklch(0.75 0.15 80 / 0.25)", background: "oklch(0.75 0.15 80 / 0.06)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={13} className="text-gold" style={{ color: "oklch(0.75 0.15 80)" }} />
          <span className="text-xs font-bold tracking-wider"
            style={{ color: "oklch(0.75 0.15 80)", fontFamily: "'Space Grotesk', sans-serif" }}>
            BUILT BY AUTOREPHERO
          </span>
        </div>
        <p className="text-white/35 text-xs">
          Full reputation management, local SEO, and AI-powered review systems for local businesses. autorephero.com
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
type Tab = "platforms" | "analytics" | "settings";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState<BusinessConfig>(getConfig());
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("platforms");

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  function handleSave(updated: BusinessConfig) {
    setConfig(updated);
    saveConfig(updated);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "platforms", label: "PLATFORMS", icon: <Star size={13} /> },
    { id: "analytics", label: "ANALYTICS", icon: <BarChart3 size={13} /> },
    { id: "settings", label: "SETTINGS", icon: <Settings size={13} /> },
  ];

  const totalReviews = config.platforms.reduce((s: number, p: ReviewPlatform) => s + p.reviewCount, 0);
  const topPlatform = getSmartSortedPlatforms(config.platforms)[0];

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div className="px-5 pt-10 pb-4" style={{ borderBottom: "1px solid oklch(0.22 0.03 255)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")}
              className="text-white/35 hover:text-white/65 transition-colors p-1 -ml-1">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-1.5">
              <Shield size={13} style={{ color: "oklch(0.7 0.22 240)" }} />
              <span className="text-[0.62rem] font-bold tracking-widest"
                style={{ color: "oklch(0.7 0.22 240)", fontFamily: "'Space Grotesk', sans-serif" }}>
                AUTOREPHERO
              </span>
            </div>
          </div>
        </div>
        <PINGate correctPin={config.ownerPin} onSuccess={() => setAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4" style={{ borderBottom: "1px solid oklch(0.22 0.03 255)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")}
            className="text-white/35 hover:text-white/65 transition-colors p-1 -ml-1">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <Shield size={13} style={{ color: "oklch(0.7 0.22 240)" }} />
            <span className="text-[0.62rem] font-bold tracking-widest"
              style={{ color: "oklch(0.7 0.22 240)", fontFamily: "'Space Grotesk', sans-serif" }}>
              AUTOREPHERO
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.85rem", fontWeight: 800, letterSpacing: "0.01em", lineHeight: 1.1 }}>
              REVIEW HUB
            </h1>
            <p className="text-white/35 text-sm mt-0.5">{config.businessName}</p>
          </div>
          <button onClick={() => navigate("/")}
            className="p-2 rounded-lg text-white/35 hover:text-white/65 hover:bg-white/8 transition-all mt-1"
            title="Preview customer view">
            <Eye size={16} />
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-4">
          <StatCard label="PLATFORMS" value={config.platforms.filter(p => p.enabled).length}
            color="oklch(0.78 0.15 80)" />
          <StatCard label="TOTAL REVIEWS" value={totalReviews} color="oklch(0.7 0.22 240)" />
          <StatCard label="TOP PRIORITY" value={topPlatform?.shortName || "—"}
            color="oklch(0.95 0.005 255)" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex px-5 pt-2 gap-1" style={{ borderBottom: "1px solid oklch(0.22 0.03 255)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-all"
            style={{
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.06em",
              color: activeTab === tab.id ? "oklch(0.7 0.22 240)" : "oklch(0.45 0.02 255)",
              borderBottom: activeTab === tab.id ? "2px solid oklch(0.62 0.2 240)" : "2px solid transparent",
            }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {activeTab === "platforms" && <PlatformsTab config={config} onSave={handleSave} />}
        {activeTab === "analytics" && <AnalyticsTab config={config} />}
        {activeTab === "settings" && <SettingsTab config={config} onSave={handleSave} />}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid oklch(0.22 0.03 255)" }}>
        <button onClick={() => navigate("/")}
          className="btn-electric w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Zap size={15} />
          PREVIEW CUSTOMER VIEW
        </button>
      </div>
    </div>
  );
}
