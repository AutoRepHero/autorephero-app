/* ============================================================
   AutoRepHero Review Hub — ReviewLanding Page
   Design: Dark Command Center / Field Operations UI
   This is the customer-facing screen that opens when NFC is tapped.
   Shows: business name, smart-routed top platform, all platforms,
   AI prompt generator, and "Leave Review" CTA.
   ============================================================ */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Star, Zap, ChevronRight, Sparkles, X, Copy, ExternalLink, Shield, LayoutDashboard } from "lucide-react";
import { DEMO_BUSINESS, getAIPrompts, getSmartRoutedPlatform, type ReviewPlatform } from "@/lib/reviewData";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/hero-bg-3UGwCSuaHY6ZDXSGEgP4e9.webp";
const NFC_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/nfc-tap-illustration-axhBGJnkJn6knPhWNm9Cs3.webp";

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

function PriorityBadge({ label, priority }: { label: string; priority: string }) {
  const colors = {
    gold: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    dim: "bg-white/5 text-white/30 border border-white/10",
  };
  return (
    <span
      className={`text-[0.6rem] font-semibold tracking-widest px-2 py-0.5 rounded-sm ${colors[priority as keyof typeof colors] || colors.dim}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {label}
    </span>
  );
}

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function AIPromptSheet({
  business,
  platform,
  onClose,
  onGoReview,
}: {
  business: typeof DEMO_BUSINESS;
  platform: ReviewPlatform;
  onClose: () => void;
  onGoReview: () => void;
}) {
  const prompts = getAIPrompts(business);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  function copyPrompt(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success("Copied to clipboard — paste it in your review!");
    setSelectedPrompt(text);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="relative slide-up rounded-t-2xl overflow-hidden"
        style={{ background: "oklch(0.16 0.015 240)", border: "1px solid oklch(1 0 0 / 0.10)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
            >
              AI REVIEW STARTERS
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 p-1">
            <X size={18} />
          </button>
        </div>

        <p className="px-5 text-xs text-white/40 mb-3" style={{ fontFamily: "var(--font-body)" }}>
          Tap a starter to copy it, then paste it into your {platform.shortName} review.
        </p>

        <div className="px-5 space-y-2 max-h-64 overflow-y-auto pb-2">
          {prompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => copyPrompt(prompt)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedPrompt === prompt
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-white/8 bg-white/4 hover:bg-white/8"
              }`}
            >
              <div className="flex items-start gap-2">
                <Copy
                  size={13}
                  className={`mt-0.5 flex-shrink-0 ${selectedPrompt === prompt ? "text-amber-400" : "text-white/30"}`}
                />
                <span className="mono-output text-xs leading-relaxed">{prompt}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 py-4 mt-1">
          <button
            onClick={onGoReview}
            className="btn-glow w-full py-3.5 rounded-lg text-white font-bold flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.06em" }}
          >
            <ExternalLink size={16} />
            OPEN {platform.shortName.toUpperCase()} REVIEW
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewLanding() {
  const [, navigate] = useLocation();
  const business = DEMO_BUSINESS;
  const smartPlatform = getSmartRoutedPlatform(business.platforms);
  const [selectedPlatform, setSelectedPlatform] = useState<ReviewPlatform | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handlePlatformSelect(platform: ReviewPlatform) {
    setSelectedPlatform(platform);
    setShowAI(true);
  }

  function handleGoReview(platform: ReviewPlatform) {
    setShowAI(false);
    // In production: open the review URL
    window.open(platform.url, "_blank");
    setTimeout(() => navigate("/success"), 500);
  }

  function handleSmartRoute() {
    handlePlatformSelect(smartPlatform);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.12 0.015 240)", maxWidth: 480, margin: "0 auto" }}
    >
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, oklch(0.10 0.02 240) 0%, oklch(0.14 0.015 240) 100%)`,
          borderBottom: "1px solid oklch(1 0 0 / 0.07)",
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />

        <div className="relative z-10 px-5 pt-10 pb-6">
          {/* Brand */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm"
              style={{ background: "oklch(0.62 0.22 250 / 0.15)", border: "1px solid oklch(0.62 0.22 250 / 0.25)" }}
            >
              <Shield size={11} className="text-blue-400" />
              <span
                className="text-blue-400 text-[0.6rem] font-semibold tracking-widest"
                style={{ fontFamily: "var(--font-display)" }}
              >
                AUTOREPHERO
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-white/30 hover:text-white/60 transition-colors"
              style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}
            >
              <LayoutDashboard size={11} />
              <span className="text-[0.6rem] font-semibold tracking-widest" style={{ fontFamily: "var(--font-display)" }}>OWNER LOGIN</span>
            </button>
          </div>

          {/* Business name */}
          <h1
            className="text-white mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.4rem",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "0.02em",
            }}
          >
            {business.businessName}
          </h1>
          <p
            className="text-white/40 text-sm mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {business.tagline}
          </p>

          {/* Star row */}
          <div className="flex items-center gap-2">
            <StarRow count={5} />
            <span className="text-amber-400/70 text-xs" style={{ fontFamily: "var(--font-body)" }}>
              Share your experience
            </span>
          </div>
        </div>
      </div>

      {/* Smart Route CTA */}
      <div className="px-5 pt-5 pb-3">
        <div className="section-label mb-3">RECOMMENDED FOR YOU</div>
        <button
          onClick={handleSmartRoute}
          className={`w-full review-card priority-gold priority-pulse p-4 flex items-center gap-4 ${mounted ? "fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0ms" }}
        >
          <PlatformIcon id={smartPlatform.id} size={44} />
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-white font-semibold text-base"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.03em" }}
              >
                {smartPlatform.name}
              </span>
              <PriorityBadge label={smartPlatform.priorityLabel} priority={smartPlatform.priority} />
            </div>
            <div className="flex items-center gap-2">
              <StarRow count={5} />
              <span className="text-white/40 text-xs">
                {smartPlatform.reviewCount} reviews
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap size={16} className="text-amber-400" />
            <ChevronRight size={16} className="text-white/30" />
          </div>
        </button>
      </div>

      {/* All Platforms */}
      <div className="px-5 pb-4">
        <div className="section-label mb-3">ALL REVIEW PLATFORMS</div>
        <div className="space-y-2">
          {business.platforms.map((platform, i) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform)}
              className={`w-full review-card priority-${platform.priority} p-3.5 flex items-center gap-3 ${mounted ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
            >
              <PlatformIcon id={platform.id} size={36} />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-white/90 font-medium text-sm"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                  >
                    {platform.name}
                  </span>
                  <PriorityBadge label={platform.priorityLabel} priority={platform.priority} />
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/8">
                    <div
                      className="h-1 rounded-full transition-all"
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
              <ChevronRight size={15} className="text-white/20 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* NFC illustration + footer */}
      <div className="px-5 pb-8 mt-auto">
        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            background: "oklch(0.16 0.015 240)",
            border: "1px solid oklch(1 0 0 / 0.07)",
          }}
        >
          <div className="flex items-center gap-4 p-4">
            <img
              src={NFC_IMG}
              alt="NFC tap"
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <p
                className="text-white/80 text-sm font-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
              >
                HOW IT WORKS
              </p>
              <p className="text-white/40 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                Tap the card → choose a platform → get AI writing help → leave your review. Done in 60 seconds.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/20 text-[0.65rem] mt-4" style={{ fontFamily: "var(--font-body)" }}>
          Powered by AutoRepHero · autorephero.com
        </p>
      </div>

      {/* AI Prompt Sheet */}
      {showAI && selectedPlatform && (
        <AIPromptSheet
          business={business}
          platform={selectedPlatform}
          onClose={() => setShowAI(false)}
          onGoReview={() => handleGoReview(selectedPlatform)}
        />
      )}
    </div>
  );
}
