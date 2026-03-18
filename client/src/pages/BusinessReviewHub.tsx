/* ============================================================
   AUTOREPHERO — Multi-Tenant Business Review Hub
   Design: Dark Command Center / Field Operations UI
   Loads business config from database by slug.
   Preserves all existing ReviewLanding UI and logic.
   ============================================================ */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Star, ChevronRight, Sparkles, X, Copy, ExternalLink, Shield, LayoutDashboard, Share2, Loader2, Lock } from "lucide-react";
import {
  getSmartSortedPlatforms,
  getTopPriorityPlatform,
  generateAIPrompts,
  getProgressPercent,
  getPriorityLabel,
  type ReviewPlatform,
  type BusinessConfig,
} from "@/lib/reviewData";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/review-hub-hero-HydsAvaa5w8Lzt5scKGKwB.webp";

// ─── Convert DB platform to ReviewPlatform type ───────────────
function dbPlatformToReviewPlatform(p: any): ReviewPlatform {
  return {
    id: p.platformId,
    name: p.name,
    shortName: p.shortName || p.name,
    icon: p.icon || p.name[0],
    color: p.color || "#555",
    url: p.url || "",
    reviewCount: p.reviewCount,
    targetCount: p.targetCount,
    enabled: p.enabled,
    order: p.sortOrder,
  };
}

// ─── Sub-components (same as ReviewLanding) ───────────────────
function PlatformIcon({ platform, size = 36 }: { platform: ReviewPlatform; size?: number }) {
  return (
    <div style={{
      width: size, height: size, background: platform.color, borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.44, fontWeight: 800, color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0,
      boxShadow: `0 4px 14px ${platform.color}44`,
    }}>
      {platform.icon}
    </div>
  );
}

function StarRow({ count = 5, size = 12 }: { count?: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={size} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function PriorityBadge({ platform }: { platform: ReviewPlatform }) {
  const { label, tier } = getPriorityLabel(platform);
  const styles = {
    gold: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    blue: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    dim: "bg-white/5 text-white/25 border border-white/10",
  };
  return (
    <span className={`text-[0.58rem] font-bold tracking-widest px-2 py-0.5 rounded-sm ${styles[tier]}`}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {label}
    </span>
  );
}

function ProgressBar({ platform }: { platform: ReviewPlatform }) {
  const pct = getProgressPercent(platform.reviewCount, platform.targetCount);
  const { tier } = getPriorityLabel(platform);
  const fillColor = tier === "gold"
    ? "linear-gradient(90deg, oklch(0.65 0.12 80), oklch(0.8 0.16 80))"
    : tier === "blue"
    ? "linear-gradient(90deg, oklch(0.52 0.18 240), oklch(0.7 0.22 240))"
    : "oklch(0.35 0.04 255)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: "oklch(0.2 0.02 255)" }}>
        <div className="h-1 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: fillColor }} />
      </div>
      <span className="text-white/30 text-[0.62rem]">{platform.reviewCount}/{platform.targetCount}</span>
    </div>
  );
}

// ─── AI Prompt Sheet ──────────────────────────────────────────
function AIPromptSheet({ config, platform, onClose, onGoReview }: {
  config: BusinessConfig; platform: ReviewPlatform; onClose: () => void; onGoReview: () => void;
}) {
  const prompts = generateAIPrompts(config, platform.shortName);
  const [selected, setSelected] = useState<number | null>(null);

  function copyPrompt(text: string, idx: number) {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success("Copied! Paste it into your review.", { duration: 2500 });
    setSelected(idx);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-slide-up rounded-t-2xl overflow-hidden"
        style={{ background: "oklch(0.13 0.025 255)", border: "1px solid oklch(0.25 0.04 255)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-400" />
            <span className="text-sm font-bold text-white tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI REVIEW STARTERS</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="px-5 text-xs text-white/40 mb-3">
          Tap a starter to copy it, then paste into your {platform.shortName} review.
        </p>
        <div className="px-5 space-y-2 max-h-56 overflow-y-auto pb-2">
          {prompts.map((prompt: string, i: number) => (
            <button key={i} onClick={() => copyPrompt(prompt, i)}
              className="w-full text-left p-3 rounded-lg border transition-all"
              style={{
                background: selected === i ? "oklch(0.75 0.15 80 / 0.1)" : "oklch(0.16 0.025 255)",
                borderColor: selected === i ? "oklch(0.75 0.15 80 / 0.4)" : "oklch(0.25 0.04 255)",
              }}>
              <div className="flex items-start gap-2">
                <Copy size={12} className={`mt-0.5 flex-shrink-0 ${selected === i ? "text-amber-400" : "text-white/25"}`} />
                <span className="text-xs leading-relaxed text-white/75">{prompt}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5 py-4 mt-1">
          <button onClick={onGoReview}
            className="btn-electric w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <ExternalLink size={15} />
            OPEN {platform.shortName.toUpperCase()} REVIEW
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Share Sheet ───────────────────────────────────────────
function QRSheet({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-slide-up rounded-t-2xl overflow-hidden"
        style={{ background: "oklch(0.13 0.025 255)", border: "1px solid oklch(0.25 0.04 255)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SHARE THIS HUB</span>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="px-5 text-xs text-white/40 mb-4">
          Show this QR code or share the link. Works on any phone.
        </p>
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-xl" style={{ background: "#ffffff" }}>
            <QRCodeSVG value={url} size={180} bgColor="#ffffff" fgColor="#0a0f1e" level="M" />
          </div>
        </div>
        <div className="px-5 pb-6 space-y-2">
          <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}
            className="w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
            style={{ background: "oklch(0.16 0.025 255)", borderColor: "oklch(0.25 0.04 255)", fontFamily: "'Space Grotesk', sans-serif" }}>
            <Copy size={14} /> COPY LINK
          </button>
          {navigator.share && (
            <button onClick={() => navigator.share({ title: "Leave Us a Review", url }).catch(() => {})}
              className="btn-electric w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Share2 size={14} /> SHARE VIA PHONE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PIN Gate (for staff access) ─────────────────────────────
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
      </div>
      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-4 h-4 rounded-full transition-all"
            style={{
              background: i < pin.length
                ? error ? "oklch(0.55 0.2 25)" : "oklch(0.7 0.22 240)"
                : "oklch(0.25 0.03 255)",
              transform: i < pin.length ? "scale(1.2)" : "scale(1)",
            }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {digits.map((d, i) => (
          <button key={i}
            onClick={() => d === "⌫" ? setPin(p => p.slice(0,-1)) : d && handleDigit(d)}
            disabled={!d && d !== "0"}
            className="h-14 rounded-2xl text-xl font-bold transition-all active:scale-95"
            style={{
              background: d ? "oklch(0.18 0.02 255)" : "transparent",
              color: d === "⌫" ? "oklch(0.5 0.05 255)" : "white",
              border: d ? "1px solid oklch(0.25 0.03 255)" : "none",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function BusinessReviewHub() {
  const [, navigate] = useLocation();
  const params = useParams<{ slug?: string }>();
  const slug = params.slug || "";

  const [selectedPlatform, setSelectedPlatform] = useState<ReviewPlatform | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  const bizQuery = trpc.business.getPublic.useQuery({ slug }, { enabled: !!slug });

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  if (!slug || bizQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.09 0.02 255)" }}>
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (bizQuery.error || !bizQuery.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ background: "oklch(0.09 0.02 255)", fontFamily: "'Space Grotesk', sans-serif" }}>
        <Shield size={48} className="text-white/20 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Hub Not Found</h2>
        <p className="text-white/40 text-sm">This review hub doesn't exist or has been removed.</p>
      </div>
    );
  }

  const biz = bizQuery.data;
  const hubUrl = `${window.location.origin}/review/${biz.slug}`;

  // Convert DB platforms to ReviewPlatform type
  const allPlatforms = biz.platforms.map(dbPlatformToReviewPlatform);
  const enabledPlatforms = allPlatforms.filter(p => p.enabled && p.url);

  // Build a BusinessConfig for AI prompts
  const config: BusinessConfig = {
    businessName: biz.name,
    businessType: biz.businessType || "Business",
    keywords: biz.keywords || [],
    ownerName: "",
    ownerPin: biz.ownerPin,
    tagline: biz.tagline || "Protecting your reputation. Building your legacy.",
    platforms: enabledPlatforms,
    hubUrl,
  };

  const sortedPlatforms = getSmartSortedPlatforms(enabledPlatforms);
  const topPlatform = getTopPriorityPlatform(enabledPlatforms);

  // Check if this is a staff/slug route (not /review/:slug)
  const isStaffRoute = !window.location.pathname.startsWith("/review/");

  // Staff route shows PIN gate first
  if (isStaffRoute && !pinUnlocked) {
    return (
      <div className="min-h-screen flex flex-col"
        style={{ background: "oklch(0.09 0.02 255)", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex items-center gap-2 px-5 pt-6 pb-2">
          <Shield size={14} style={{ color: "oklch(0.7 0.22 240)" }} />
          <span className="text-white/40 text-xs font-bold tracking-widest">{biz.name.toUpperCase()}</span>
        </div>
        <PINGate correctPin={biz.ownerPin} onSuccess={() => setPinUnlocked(true)} />
      </div>
    );
  }

  function handlePlatformSelect(platform: ReviewPlatform) {
    setSelectedPlatform(platform);
    setShowAI(true);
  }

  function handleGoReview(platform: ReviewPlatform) {
    setShowAI(false);
    window.open(platform.url, "_blank");
    setTimeout(() => navigate("/success"), 600);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ maxWidth: 480, margin: "0 auto" }}>

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden"
        style={{ borderBottom: "1px solid oklch(0.22 0.03 255)" }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.18 }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, oklch(0.09 0.02 255 / 0.5) 0%, oklch(0.09 0.02 255) 100%)" }} />

        <div className="relative z-10 px-5 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded"
              style={{ background: "oklch(0.62 0.2 240 / 0.12)", border: "1px solid oklch(0.62 0.2 240 / 0.25)" }}>
              <Shield size={10} style={{ color: "oklch(0.7 0.22 240)" }} />
              <span className="text-[0.58rem] font-bold tracking-widest"
                style={{ color: "oklch(0.7 0.22 240)", fontFamily: "'Space Grotesk', sans-serif" }}>
                AUTOREPHERO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowQR(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-white/30 hover:text-white/60 transition-colors"
                style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <Share2 size={10} />
                <span className="text-[0.58rem] font-bold tracking-widest"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SHARE</span>
              </button>
              <button onClick={() => navigate("/owner")}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-white/30 hover:text-white/60 transition-colors"
                style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <LayoutDashboard size={10} />
                <span className="text-[0.58rem] font-bold tracking-widest"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OWNER</span>
              </button>
            </div>
          </div>

          <h1 className="text-white mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.05, letterSpacing: "0.01em" }}>
            {biz.name}
          </h1>
          <p className="text-white/40 text-sm mb-4">{config.tagline}</p>
          <div className="flex items-center gap-2">
            <StarRow count={5} />
            <span className="text-amber-400/60 text-xs">Share your experience</span>
          </div>
        </div>
      </div>

      {/* ── Smart Route CTA ── */}
      {topPlatform && (
        <div className="px-5 pt-5 pb-3">
          <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>RECOMMENDED FOR YOU</div>
          <button onClick={() => handlePlatformSelect(topPlatform)}
            className={`platform-card priority w-full p-4 flex items-center gap-4 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
            <PlatformIcon platform={topPlatform} size={48} />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-white font-bold text-base"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{topPlatform.name}</span>
                <PriorityBadge platform={topPlatform} />
              </div>
              <ProgressBar platform={topPlatform} />
            </div>
            <ChevronRight size={18} className="text-amber-400 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* ── All Platforms ── */}
      <div className="px-5 pb-4">
        <div className="text-[0.6rem] font-bold tracking-widest text-white/30 mb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ALL REVIEW PLATFORMS</div>
        {sortedPlatforms.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            No review platforms configured yet.
          </div>
        )}
        <div className="space-y-2">
          {sortedPlatforms.map((platform: ReviewPlatform, i: number) => (
            <button key={platform.id} onClick={() => handlePlatformSelect(platform)}
              className={`platform-card w-full p-3.5 flex items-center gap-3 ${mounted ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: `${i * 60}ms` }}>
              <PlatformIcon platform={platform} size={38} />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/90 font-semibold text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{platform.name}</span>
                  <PriorityBadge platform={platform} />
                </div>
                <ProgressBar platform={platform} />
              </div>
              <ChevronRight size={16} className="text-white/25 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto px-5 pb-8 pt-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Shield size={10} style={{ color: "oklch(0.7 0.22 240)" }} />
          <span className="text-[0.6rem] font-bold tracking-widest text-white/20"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>POWERED BY AUTOREPHERO</span>
        </div>
        <div className="flex justify-center gap-4">
          <a href="https://autorephero.com/privacy" className="text-white/20 text-[0.6rem] hover:text-white/40 transition-colors">Privacy</a>
          <a href="https://autorephero.com/terms" className="text-white/20 text-[0.6rem] hover:text-white/40 transition-colors">Terms</a>
        </div>
      </div>

      {/* ── AI Sheet ── */}
      {showAI && selectedPlatform && (
        <AIPromptSheet
          config={config}
          platform={selectedPlatform}
          onClose={() => setShowAI(false)}
          onGoReview={() => handleGoReview(selectedPlatform)}
        />
      )}

      {/* ── QR Sheet ── */}
      {showQR && <QRSheet url={hubUrl} onClose={() => setShowQR(false)} />}
    </div>
  );
}
