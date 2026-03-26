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

// ─── AI Review Helper ─────────────────────────────────────────
const QUICK_TAGS = [
  "Fast response", "Fair pricing", "Professional", "Friendly staff",
  "Clean work", "On time", "Above & beyond", "Would recommend",
  "Honest", "Knowledgeable", "Great communication", "Thorough",
];

function buildReviews(config: BusinessConfig, tags: string[]): string[] {
  const { businessName } = config;
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);
  const t = shuffle(tags.map(t => t.toLowerCase()));

  const openers = [
    `Had an amazing experience with ${businessName}.`,
    `Really impressed with ${businessName}.`,
    `Can't say enough good things about ${businessName}.`,
    `${businessName} knocked it out of the park.`,
    `So glad I chose ${businessName}.`,
    `Hands down the best experience I've had — ${businessName} delivered.`,
    `Five stars for ${businessName}, no question.`,
    `Just had ${businessName} out and I'm blown away.`,
  ];

  const middles = [
    `They were ${t[0] || "professional"} and ${t[1] || "reliable"} the entire time.`,
    `From start to finish, everything was ${t[0] || "smooth"} and ${t[1] || "professional"}.`,
    `The team was ${t[0] || "great"} — you could tell they really know what they're doing.`,
    `What stood out most was how ${t[0] || "professional"} they were. ${t[1] ? `Also really appreciated the ${t[1]}.` : ""}`,
    `${t[0] ? t[0].charAt(0).toUpperCase() + t[0].slice(1) : "Great service"}, ${t[1] || "honest pricing"}, and ${t[2] || "quality work"} — that's rare to find all in one place.`,
    `They showed up ${t.includes("on time") ? "right on time" : "when they said they would"}, did ${t[0] || "excellent"} work, and the price was ${t.includes("fair pricing") ? "very fair" : "reasonable"}.`,
    `Communication was great and the results were ${t[0] || "impressive"}.`,
    `They treated us like family — ${t[0] || "honest"} about everything and ${t[1] || "professional"} all the way through.`,
  ];

  const closers = [
    "Would definitely recommend to anyone.",
    "Already told my neighbors about them.",
    "Will absolutely use them again.",
    "Couldn't be happier with the results.",
    "They've earned a customer for life.",
    "If you're looking for quality, look no further.",
    "Trust me, give them a call — you won't regret it.",
    "This is how every company should operate.",
  ];

  const reviews: string[] = [];
  for (let i = 0; i < 3; i++) {
    reviews.push(`${pick(openers)} ${pick(middles)} ${pick(closers)}`);
  }
  return reviews;
}

function AIPromptSheet({ config, platform, onClose, onGoReview }: {
  config: BusinessConfig; platform: ReviewPlatform; onClose: () => void; onGoReview: () => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editText, setEditText] = useState("");
  const [step, setStep] = useState<"tags" | "suggestions" | "edit">("tags");

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const reviews = buildReviews(config, selectedTags.length > 0 ? selectedTags : ["great service", "professional"]);

  function selectReview(text: string) {
    setEditText(text);
    setStep("edit");
  }

  function copyAndGo() {
    navigator.clipboard.writeText(editText).catch(() => {});
    toast.success("Copied! Opening " + platform.shortName + "...", { duration: 2000 });
    setTimeout(() => onGoReview(), 500);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-slide-up rounded-t-2xl overflow-hidden"
        style={{ background: "oklch(0.13 0.025 255)", border: "1px solid oklch(0.25 0.04 255)", maxHeight: "85vh" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-400" />
            <span className="text-sm font-bold text-white tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {step === "tags" ? "WHAT MADE IT GREAT?" : step === "suggestions" ? "SELECT A REVIEW" : "MAKE IT YOUR OWN"}
            </span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "65vh" }}>
          {/* Step 1: Tag Selection */}
          {step === "tags" && (
            <div className="px-5 pb-4">
              <p className="text-xs text-white/40 mb-3">Select what applies to your experience:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: selectedTags.includes(tag) ? "oklch(0.55 0.15 250)" : "oklch(0.18 0.02 255)",
                      color: selectedTags.includes(tag) ? "#fff" : "rgba(255,255,255,0.5)",
                      border: selectedTags.includes(tag) ? "1px solid oklch(0.65 0.15 250)" : "1px solid oklch(0.25 0.04 255)",
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("suggestions")}
                className="btn-electric w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Sparkles size={14} />
                GENERATE REVIEW SUGGESTIONS {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
              </button>
            </div>
          )}

          {/* Step 2: AI Suggestions */}
          {step === "suggestions" && (
            <div className="px-5 pb-4">
              <p className="text-xs text-white/40 mb-3">Select the wording that resonates with you. Then you can edit to make it your own:</p>
              <div className="space-y-2 mb-4">
                {reviews.map((review, i) => (
                  <button key={i} onClick={() => selectReview(review)}
                    className="w-full text-left p-4 rounded-xl border transition-all hover:border-blue-400/40"
                    style={{ background: "oklch(0.16 0.025 255)", borderColor: "oklch(0.25 0.04 255)" }}>
                    <div className="text-amber-400 text-xs mb-1.5">{"⭐".repeat(5)}</div>
                    <span className="text-sm leading-relaxed text-white/80">{review}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("tags")}
                className="text-xs text-white/30 hover:text-white/50 transition-all w-full text-center py-2">
                ← Back to tags
              </button>
            </div>
          )}

          {/* Step 3: Edit & Copy */}
          {step === "edit" && (
            <div className="px-5 pb-4">
              <p className="text-xl text-white font-bold mb-2">✨ Make it your own!</p>
              <p className="text-sm text-amber-300/90 font-medium mb-1">Is there anything you can add?</p>
              <p className="text-sm text-white/60 mb-4 leading-relaxed">Please personalize your review — add any detail, name, or what made your experience a blessing to you. <span className="text-amber-400 font-semibold">Thank you so much! 🙏</span></p>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-xl text-sm leading-relaxed text-white/90 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                style={{ background: "oklch(0.16 0.025 255)", border: "1px solid oklch(0.25 0.04 255)" }}
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setStep("suggestions")}
                  className="flex-1 py-3 rounded-xl text-sm text-white/40 border border-white/10 hover:border-white/20 transition-all">
                  ← Go Back
                </button>
                <button onClick={copyAndGo}
                  className="btn-electric flex-[2] py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Copy size={14} />
                  COPY & GO TO {platform.shortName.toUpperCase()}
                </button>
              </div>
            </div>
          )}
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
