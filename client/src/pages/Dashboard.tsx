/* ============================================================
   AutoRepHero Review Hub — Dashboard Page
   Design: Dark Command Center / Field Operations UI
   Business owner view: manage platforms, set priorities,
   view review counts, access settings, and get the NFC/QR link.
   ============================================================ */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Star, Settings, Link2, BarChart3, Zap, ArrowLeft,
  ChevronUp, ChevronDown, Eye, Copy, QrCode, Bell, Shield
} from "lucide-react";
import { DEMO_BUSINESS, type ReviewPlatform } from "@/lib/reviewData";
import { toast } from "sonner";

const PLATFORM_COLORS: Record<string, string> = {
  google: "#4285F4",
  facebook: "#1877F2",
  yelp: "#FF1A1A",
  bbb: "#003087",
  trustpilot: "#00B67A",
};

const PLATFORM_LOGOS: Record<string, string> = {
  google: "G",
  facebook: "f",
  yelp: "★",
  bbb: "B",
  trustpilot: "✓",
};

function PlatformIcon({ id, size = 32 }: { id: string; size?: number }) {
  const color = PLATFORM_COLORS[id] || "#888";
  const letter = PLATFORM_LOGOS[id] || "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "var(--font-display)",
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

type Tab = "platforms" | "analytics" | "settings";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div
      className="flex-1 rounded-lg p-3"
      style={{ background: "oklch(0.16 0.015 240)", border: "1px solid oklch(1 0 0 / 0.07)" }}
    >
      <div
        className="text-2xl font-bold mb-0.5"
        style={{ fontFamily: "var(--font-display)", color: color || "oklch(0.95 0.005 240)" }}
      >
        {value}
      </div>
      <div className="section-label">{label}</div>
      {sub && <div className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{sub}</div>}
    </div>
  );
}

function PlatformsTab({ platforms }: { platforms: ReviewPlatform[] }) {
  const [items, setItems] = useState(platforms);

  function movePriority(id: string, dir: "up" | "down") {
    const idx = items.findIndex((p) => p.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === items.length - 1) return;
    const newItems = [...items];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    // Update priority labels
    newItems.forEach((item, i) => {
      if (i === 0) item.priority = "gold";
      else if (i <= 2) item.priority = "blue";
      else item.priority = "dim";
    });
    setItems(newItems);
    toast.success("Priority updated");
  }

  const totalReviews = items.reduce((s, p) => s + (p.reviewCount || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>
          Drag to reorder. Top platform gets the most traffic.
        </p>
        <span className="text-white/30 text-xs">{totalReviews} total reviews</span>
      </div>

      {items.map((platform, i) => (
        <div
          key={platform.id}
          className={`review-card priority-${platform.priority} p-3.5 flex items-center gap-3`}
        >
          <PlatformIcon id={platform.id} size={36} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-white/90 text-sm font-semibold"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
              >
                {platform.name}
              </span>
              {i === 0 && (
                <span className="text-[0.6rem] font-semibold tracking-widest px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  style={{ fontFamily: "var(--font-display)" }}>
                  TOP
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/8">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${Math.min(100, ((platform.reviewCount || 0) / (platform.targetCount || 1)) * 100)}%`,
                    background:
                      platform.priority === "gold"
                        ? "oklch(0.78 0.15 80)"
                        : platform.priority === "blue"
                        ? "oklch(0.62 0.22 250)"
                        : "oklch(1 0 0 / 0.2)",
                  }}
                />
              </div>
              <span className="text-white/30 text-[0.65rem]">
                {platform.reviewCount}/{platform.targetCount}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => movePriority(platform.id, "up")}
              className="p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => movePriority(platform.id, "down")}
              className="p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      ))}

      <button
        className="w-full py-3 rounded-lg text-white/40 text-sm border border-dashed border-white/15 hover:border-white/30 hover:text-white/60 transition-all"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
        onClick={() => toast.info("Add platform — coming in Pro tier")}
      >
        + ADD PLATFORM
      </button>
    </div>
  );
}

function AnalyticsTab() {
  const business = DEMO_BUSINESS;
  const totalReviews = business.platforms.reduce((s, p) => s + (p.reviewCount || 0), 0);
  const totalTarget = business.platforms.reduce((s, p) => s + (p.targetCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex gap-3">
        <StatCard label="TOTAL REVIEWS" value={totalReviews} sub="across all platforms" color="oklch(0.78 0.15 80)" />
        <StatCard label="GOAL PROGRESS" value={`${Math.round((totalReviews / totalTarget) * 100)}%`} sub={`of ${totalTarget} target`} color="oklch(0.62 0.22 250)" />
      </div>

      {/* Platform breakdown */}
      <div className="section-label mb-2">PLATFORM BREAKDOWN</div>
      {business.platforms.map((platform) => {
        const pct = Math.round(((platform.reviewCount || 0) / (platform.targetCount || 1)) * 100);
        return (
          <div key={platform.id} className="flex items-center gap-3 py-2">
            <PlatformIcon id={platform.id} size={28} />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                  {platform.shortName}
                </span>
                <span className="text-white/40 text-xs">{platform.reviewCount} reviews</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/8">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background:
                      platform.priority === "gold"
                        ? "oklch(0.78 0.15 80)"
                        : platform.priority === "blue"
                        ? "oklch(0.62 0.22 250)"
                        : "oklch(1 0 0 / 0.2)",
                  }}
                />
              </div>
            </div>
            <span className="text-white/30 text-[0.65rem] w-8 text-right">{pct}%</span>
          </div>
        );
      })}

      {/* Upgrade notice */}
      <div
        className="rounded-lg p-4 mt-2"
        style={{ background: "oklch(0.62 0.22 250 / 0.08)", border: "1px solid oklch(0.62 0.22 250 / 0.20)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={14} className="text-blue-400" />
          <span className="text-blue-400 text-xs font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
            PRO ANALYTICS
          </span>
        </div>
        <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>
          Upgrade to Pro to see tap counts, conversion rates, and SMS/email follow-up performance.
        </p>
      </div>
    </div>
  );
}

function SettingsTab({ shareUrl }: { shareUrl: string }) {
  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    toast.success("Link copied! Load it on your NFC card.");
  }

  return (
    <div className="space-y-4">
      {/* Share link */}
      <div>
        <div className="section-label mb-2">YOUR REVIEW HUB LINK</div>
        <div
          className="rounded-lg p-3 flex items-center gap-2"
          style={{ background: "oklch(0.16 0.015 240)", border: "1px solid oklch(1 0 0 / 0.07)" }}
        >
          <Link2 size={14} className="text-blue-400 flex-shrink-0" />
          <span className="mono-output text-xs flex-1 truncate text-white/60">{shareUrl}</span>
          <button onClick={copyLink} className="text-white/40 hover:text-white/80 transition-colors p-1">
            <Copy size={14} />
          </button>
        </div>
        <p className="text-white/30 text-xs mt-1.5 px-1" style={{ fontFamily: "var(--font-body)" }}>
          Program this URL onto your NFC card or print it as a QR code.
        </p>
      </div>

      {/* NFC setup instructions */}
      <div>
        <div className="section-label mb-2">NFC CARD SETUP</div>
        <div className="space-y-2">
          {[
            { step: "01", text: "Buy any NFC NTAG213 card or sticker (Amazon, ~$0.50 each)" },
            { step: "02", text: "Use the NFC Tools app (free) to write your Hub URL to the card" },
            { step: "03", text: "Tap the card on a customer's phone — it opens your Review Hub instantly" },
            { step: "04", text: "Customer chooses a platform, gets AI help, leaves a review" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="text-blue-400 font-bold text-sm flex-shrink-0 mt-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step}
              </span>
              <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature tiers */}
      <div>
        <div className="section-label mb-2">UPGRADE OPTIONS</div>
        <div className="space-y-2">
          {[
            { tier: "FREE", price: "$0", features: "1 platform · NFC/QR routing · PWA", active: true },
            { tier: "PRO", price: "$49/mo", features: "5 platforms · Smart routing · AI prompts · Analytics", active: false },
            { tier: "AGENCY", price: "$99/mo", features: "Unlimited · SMS/Email automation · White-label · Dashboard", active: false },
          ].map(({ tier, price, features, active }) => (
            <div
              key={tier}
              className="rounded-lg p-3 flex items-center gap-3"
              style={{
                background: active ? "oklch(0.62 0.22 250 / 0.10)" : "oklch(0.16 0.015 240)",
                border: `1px solid ${active ? "oklch(0.62 0.22 250 / 0.30)" : "oklch(1 0 0 / 0.07)"}`,
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-bold text-sm"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: active ? "oklch(0.62 0.22 250)" : "oklch(0.75 0.005 240)",
                    }}
                  >
                    {tier}
                  </span>
                  <span
                    className="font-semibold text-xs"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: active ? "oklch(0.78 0.15 80)" : "oklch(0.55 0.015 240)",
                    }}
                  >
                    {price}
                  </span>
                  {active && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-body)" }}>{features}</p>
              </div>
              {!active && (
                <button
                  onClick={() => toast.info("Contact AutoRepHero to upgrade")}
                  className="text-xs text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded hover:bg-blue-500/10 transition-colors flex-shrink-0"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
                >
                  UPGRADE
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="rounded-lg p-4"
        style={{ background: "oklch(0.78 0.15 80 / 0.08)", border: "1px solid oklch(0.78 0.15 80 / 0.20)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield size={13} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
            BUILT BY AUTOREPHERO
          </span>
        </div>
        <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>
          Full reputation management, local SEO, and AI-powered review systems. Visit autorephero.com to get the full suite.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("platforms");
  const business = DEMO_BUSINESS;
  const shareUrl = "https://app.autorephero.com/your-business";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "platforms", label: "PLATFORMS", icon: <Star size={14} /> },
    { id: "analytics", label: "ANALYTICS", icon: <BarChart3 size={14} /> },
    { id: "settings", label: "SETTINGS", icon: <Settings size={14} /> },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.12 0.015 240)", maxWidth: 480, margin: "0 auto" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-10 pb-4"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.07)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="text-white/40 hover:text-white/70 transition-colors p-1 -ml-1"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-400" />
            <span
              className="text-blue-400 text-[0.65rem] font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AUTOREPHERO
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.9rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
              }}
            >
              REVIEW HUB
            </h1>
            <p className="text-white/40 text-sm mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
              {business.businessName}
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
              title="Preview customer view"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => toast.info("QR code generation — Pro feature")}
              className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
              title="Generate QR code"
            >
              <QrCode size={16} />
            </button>
            <button
              onClick={() => toast.info("Notifications — coming soon")}
              className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
              title="Notifications"
            >
              <Bell size={16} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-4">
          <StatCard
            label="PLATFORMS"
            value={business.platforms.length}
            color="oklch(0.78 0.15 80)"
          />
          <StatCard
            label="TOTAL REVIEWS"
            value={business.platforms.reduce((s, p) => s + (p.reviewCount || 0), 0)}
            color="oklch(0.62 0.22 250)"
          />
          <StatCard
            label="TOP PRIORITY"
            value={business.platforms.find((p) => p.priority === "gold")?.shortName || "—"}
            color="oklch(0.95 0.005 240)"
          />
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex px-5 pt-3 gap-1"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.07)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-white/30 hover:text-white/60"
            }`}
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {activeTab === "platforms" && <PlatformsTab platforms={business.platforms} />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "settings" && <SettingsTab shareUrl={shareUrl} />}
      </div>

      {/* Bottom CTA */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid oklch(1 0 0 / 0.07)", background: "oklch(0.14 0.015 240)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="btn-glow w-full py-3.5 rounded-lg text-white font-bold flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "0.06em" }}
        >
          <Zap size={16} />
          PREVIEW CUSTOMER VIEW
        </button>
      </div>
    </div>
  );
}
