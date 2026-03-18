/* ============================================================
   AUTOREPHERO REVIEW HUB — Customer-Facing Landing Screen
   Design: Dark Command Center / Field Operations UI
   Opens on NFC tap, QR scan, or direct link.
   Features: Smart routing, AI prompts, platform selector, QR share
   ============================================================ */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Star, ChevronRight, Sparkles, X, Copy, ExternalLink, Shield, LayoutDashboard, Share2 } from "lucide-react";
import {
  getConfig,
  getSmartSortedPlatforms,
  getTopPriorityPlatform,
  generateAIPrompts,
  getProgressPercent,
  getPriorityLabel,
  type ReviewPlatform,
  type BusinessConfig,
} from "@/lib/reviewData";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/review-hub-hero-HydsAvaa5w8Lzt5scKGKwB.webp";

// ─── Sub-components ───────────────────────────────────────────

function PlatformIcon({ platform, size = 36 }: { platform: ReviewPlatform; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: platform.color,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.44,
        fontWeight: 800,
        color: "#fff",
        fontFamily: "'Space Grotesk', sans-serif",
        flexShrink: 0,
        boxShadow: `0 4px 14px ${platform.color}44`,
      }}
    >
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
    dim: "bg-white/5 text-white/50 border border-white/10",
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
      <span className="text-white/30 text-[0.62rem]">
        {platform.reviewCount}/{platform.targetCount}
      </span>
    </div>
  );
}

// ─── AI Prompt Sheet ──────────────────────────────────────────
function AIPromptSheet({
  config,
  platform,
  onClose,
  onGoReview,
}: {
  config: BusinessConfig;
  platform: ReviewPlatform;
  onClose: () => void;
  onGoReview: () => void;
}) {
  const prompts = generateAIPrompts(config, platform.shortName);
  const [selected, setSelected] = useState<number | null>(null);

  function copyPrompt(text: string, idx: number) {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success("Copied! Now add one personal detail — the service, a name, or result — to make it yours. 🙌", { duration: 4000 });
    setSelected(idx);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-slide-up rounded-t-2xl overflow-hidden"
        style={{ background: "oklch(0.13 0.025 255)", border: "1px solid oklch(0.25 0.04 255)" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-400" />
            <span className="text-sm font-bold text-white tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AI REVIEW STARTERS
            </span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 mb-3">
          <p className="text-xs text-white/60 mb-1.5" style={{ lineHeight: 1.6 }}>
            ✨ Use a starter below, then <strong style={{ color: "oklch(0.78 0.15 80)" }}>add a few of your own words</strong> to make it personal.
          </p>
          <p className="text-[0.65rem] text-white/35" style={{ lineHeight: 1.5 }}>
            Mention the service you received, a name, or a specific result. Personal reviews help more than generic ones — and they're what Google values most.
          </p>
        </div>

        {/* Prompts */}
        <div className="px-5 space-y-2 max-h-56 overflow-y-auto pb-2">
          {prompts.map((prompt: string, i: number) => (
            <button
              key={i}
              onClick={() => copyPrompt(prompt, i)}
              className="w-full text-left p-3 rounded-lg border transition-all"
              style={{
                background: selected === i ? "oklch(0.75 0.15 80 / 0.1)" : "oklch(0.16 0.025 255)",
                borderColor: selected === i ? "oklch(0.75 0.15 80 / 0.4)" : "oklch(0.25 0.04 255)",
              }}
            >
              <div className="flex items-start gap-2">
                <Copy size={12} className={`mt-0.5 flex-shrink-0 ${selected === i ? "text-amber-400" : "text-white/50"}`} />
                <span className="text-xs leading-relaxed text-white/75">{prompt}</span>
              </div>
              <div className="text-[0.6rem] mt-1.5 text-right" style={{ color: selected === i ? "oklch(0.78 0.15 80)" : "oklch(0.45 0.02 240)" }}>
                {selected === i ? "✅ Copied — make it yours!" : "Tap to copy + make it yours"}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 py-4 mt-1">
          <button
            onClick={onGoReview}
            className="btn-electric w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
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
  function copyLink() {
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link copied to clipboard!");
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
          <span className="text-sm font-bold text-white tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            SHARE THIS HUB
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="px-5 text-xs text-white/40 mb-4">
          Show this QR code or share the link. Works on any phone — no NFC card required.
        </p>
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-xl" style={{ background: "#ffffff" }}>
            <QRCodeSVG value={url} size={180} bgColor="#ffffff" fgColor="#0a0f1e" level="M" />
          </div>
        </div>
        <div className="px-5 pb-6 space-y-2">
          <button onClick={copyLink}
            className="w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
            style={{ background: "oklch(0.16 0.025 255)", borderColor: "oklch(0.25 0.04 255)", fontFamily: "'Space Grotesk', sans-serif" }}>
            <Copy size={14} />
            COPY LINK
          </button>
          {navigator.share && (
            <button
              onClick={() => navigator.share({ title: "Leave Us a Review", url }).catch(() => {})}
              className="btn-electric w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Share2 size={14} />
              SHARE VIA PHONE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ReviewLanding() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState<BusinessConfig>(getConfig());
  const [selectedPlatform, setSelectedPlatform] = useState<ReviewPlatform | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
    setTimeout(() => setMounted(true), 50);
  }, []);

  const sortedPlatforms = getSmartSortedPlatforms(config.platforms);
  const topPlatform = getTopPriorityPlatform(config.platforms);

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
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            opacity: 0.18,
          }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, oklch(0.09 0.02 255 / 0.5) 0%, oklch(0.09 0.02 255) 100%)" }} />

        <div className="relative z-10 px-5 pt-12 pb-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg"
              style={{ background: "oklch(0.62 0.2 240 / 0.12)", border: "1px solid oklch(0.62 0.2 240 / 0.25)" }}>
              <Shield size={24} className="text-electric" style={{ color: "oklch(0.7 0.22 240)" }} />
              <span className="text-[1rem] font-bold tracking-widest"
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
              <button onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-white/30 hover:text-white/60 transition-colors"
                style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <LayoutDashboard size={10} />
                <span className="text-[0.58rem] font-bold tracking-widest"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>OWNER</span>
              </button>
            </div>
          </div>

          {/* Business name */}
          <h1 className="text-white mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.05, letterSpacing: "0.01em" }}>
            {config.businessName}
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
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            RECOMMENDED FOR YOU
          </div>
          <button
            onClick={() => handlePlatformSelect(topPlatform)}
            className={`platform-card priority w-full p-4 flex items-center gap-4 ${mounted ? "animate-fade-in" : "opacity-0"}`}
          >
            <PlatformIcon platform={topPlatform} size={48} />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-white font-bold text-base"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {topPlatform.name}
                </span>
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
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ALL REVIEW PLATFORMS
        </div>
        <div className="space-y-2">
          {config.platforms.sort((a, b) => a.order - b.order).map((platform: ReviewPlatform, i: number) => (
            platform.enabled ? (
              <button
                key={platform.id}
                onClick={() => handlePlatformSelect(platform)}
                className={`platform-card w-full p-3.5 flex items-center gap-3 ${mounted ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <PlatformIcon platform={platform} size={38} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/90 font-semibold text-sm"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {platform.name}
                    </span>
                    <PriorityBadge platform={platform} />
                  </div>
                  <ProgressBar platform={platform} />
                </div>
                <ChevronRight size={14} className="text-white/20 flex-shrink-0" />
              </button>
            ) : (
              <div
                key={platform.id}
                className={`platform-card w-full p-3.5 flex items-center gap-3 ${mounted ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: `${i * 60}ms`, opacity: 0.35, filter: "grayscale(1)", cursor: "not-allowed" }}
              >
                <PlatformIcon platform={platform} size={38} />
                <div className="flex-1 text-left">
                  <span className="text-white/50 font-semibold text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {platform.name}
                  </span>
                  <div className="text-[0.6rem] mt-1" style={{ color: "oklch(0.55 0.15 80)" }}>
                    🔒 Upgrade to unlock
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="px-5 pb-8 mt-auto">
        <div className="cmd-card p-4">
          <p className="text-white/50 text-[0.75rem] font-bold tracking-widest mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            HOW IT WORKS
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <div className="flex items-start gap-2">
              <span className="text-electric font-bold" style={{ color: "oklch(0.7 0.22 240)" }}>1</span>
              <span>Choose a platform above</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-electric font-bold" style={{ color: "oklch(0.7 0.22 240)" }}>2</span>
              <span>Copy an AI starter</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-electric font-bold" style={{ color: "oklch(0.7 0.22 240)" }}>3</span>
              <span>Post your review</span>
            </div>
          </div>
        </div>
        <p className="text-center text-white/50 text-[0.75rem] mt-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Powered by <a href="https://autorephero.com" target="_blank" rel="noopener" style={{ color: "oklch(0.65 0.12 240)", textDecoration: "none" }}>AutoRepHero</a> · <a href="https://autorephero.com/privacy" target="_blank" rel="noopener" style={{ color: "oklch(0.55 0.08 240)", textDecoration: "none" }}>Privacy</a> · <a href="https://autorephero.com/terms" target="_blank" rel="noopener" style={{ color: "oklch(0.55 0.08 240)", textDecoration: "none" }}>Terms</a>
        </p>
      </div>

      {/* ── Sheets ── */}
      {showAI && selectedPlatform && (
        <AIPromptSheet
          config={config}
          platform={selectedPlatform}
          onClose={() => setShowAI(false)}
          onGoReview={() => handleGoReview(selectedPlatform)}
        />
      )}
      {showQR && (
        <QRSheet
          url={config.hubUrl || window.location.href}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
