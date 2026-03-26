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

// ─── AI Review Helper ─────────────────────────────────────────
const QUICK_TAGS = [
  "Fast response", "Fair pricing", "Professional", "Friendly",
  "Clean work", "On time", "Above & beyond", "Highly recommend",
  "Honest", "Knowledgeable", "Great communication", "Thorough",
];

const TAG_PHRASES: Record<string, string[]> = {
  "fast response": ["they responded quickly", "the response time was impressive", "they got back to me right away"],
  "fair pricing": ["the pricing was very fair", "no surprises on the bill", "the price was honest and reasonable"],
  "professional": ["completely professional", "professional from start to finish", "very professional throughout"],
  "friendly": ["super friendly", "the team was really friendly", "friendly and welcoming"],
  "clean work": ["left everything spotless", "the work area was cleaner than when they started", "very clean and tidy work"],
  "on time": ["showed up right on time", "punctual and reliable", "arrived exactly when they said they would"],
  "above & beyond": ["went above and beyond", "did more than I expected", "truly went the extra mile"],
  "highly recommend": ["I would highly recommend them", "already recommending them to everyone I know", "can't recommend them enough"],
  "honest": ["completely honest and upfront", "refreshingly honest", "no games, just honest work"],
  "knowledgeable": ["clearly very knowledgeable", "really knew their stuff", "you could tell they're experts"],
  "great communication": ["communication was excellent", "kept me informed every step of the way", "always easy to reach and responsive"],
  "thorough": ["incredibly thorough", "didn't cut any corners", "very thorough and detail-oriented"],
};

function buildDemoReviews(config: BusinessConfig, tags: string[]): string[] {
  const { businessName } = config;
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);
  
  const phrases = shuffle(tags.map(t => {
    const key = t.toLowerCase();
    return pick(TAG_PHRASES[key] || [`really ${key}`]);
  }));
  
  const p1 = phrases[0] || "completely professional";
  const p2 = phrases[1] || "honest and reliable";
  const p3 = phrases[2] || "did quality work";

  const openers = [
    `Had an amazing experience with ${businessName}.`,
    `Really impressed with ${businessName}.`,
    `Can't say enough good things about ${businessName}.`,
    `${businessName} knocked it out of the park.`,
    `So glad I chose ${businessName}.`,
    `Hands down the best experience I've had — ${businessName} delivered.`,
    `Five stars for ${businessName}, no question.`,
    `Just had ${businessName} out and I'm blown away.`,
    `${businessName} exceeded all my expectations.`,
    `I've finally found a company I can trust — ${businessName}.`,
  ];
  const middles = [
    `They were ${p1} and ${p2} the entire time.`,
    `From start to finish — ${p1}, ${p2}, and ${p3}.`,
    `What stood out most was that ${p1}. On top of that, ${p2}.`,
    `${p1.charAt(0).toUpperCase() + p1.slice(1)}, ${p2}, and ${p3} — that's rare to find all in one place.`,
    `The whole experience was great — ${p1} and ${p2}. Can't ask for more than that.`,
    `Two things really stood out: ${p1} and ${p2}.`,
    `From the first call to the finished job, ${p1}. Also, ${p2}.`,
    `Everything about it was solid — ${p1}, ${p2}, and the results speak for themselves.`,
  ];
  const closers = [
    "I would absolutely recommend them to anyone.",
    "Already told my neighbors about them.",
    "Will definitely be using them again.",
    "Couldn't be happier with the results.",
    "They've earned a customer for life.",
    "If you're looking for quality, look no further.",
    "Trust me, give them a call — you won't regret it.",
    "This is how every company should operate.",
    "They've set the bar for what good service looks like.",
    "Worth every penny.",
  ];

  const reviews: string[] = [];
  const usedOpeners = new Set<number>();
  const usedMiddles = new Set<number>();
  const usedClosers = new Set<number>();
  
  for (let i = 0; i < 3; i++) {
    let oi: number, mi: number, ci: number;
    do { oi = Math.floor(Math.random() * openers.length); } while (usedOpeners.has(oi));
    do { mi = Math.floor(Math.random() * middles.length); } while (usedMiddles.has(mi));
    do { ci = Math.floor(Math.random() * closers.length); } while (usedClosers.has(ci));
    usedOpeners.add(oi); usedMiddles.add(mi); usedClosers.add(ci);
    reviews.push(`${openers[oi]} ${middles[mi]} ${closers[ci]}`);
  }
  return reviews;
}

function AIPromptSheet({
  config, platform, onClose, onGoReview,
}: {
  config: BusinessConfig; platform: ReviewPlatform; onClose: () => void; onGoReview: () => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editText, setEditText] = useState("");
  const [step, setStep] = useState<"tags" | "suggestions" | "edit">("tags");

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const reviews = buildDemoReviews(config, selectedTags.length > 0 ? selectedTags : ["great service", "professional"]);

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
          {step === "tags" && (
            <div className="px-5 pb-4">
              <p className="text-xs text-white/75 mb-3">Select what applies to your experience:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: selectedTags.includes(tag) ? "oklch(0.55 0.15 250)" : "oklch(0.18 0.02 255)",
                      color: selectedTags.includes(tag) ? "#fff" : "rgba(255,255,255,0.75)",
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
                <span>GENERATE REVIEW SUGGESTIONS</span>{selectedTags.length > 0 && <span className="block text-xs opacity-75 mt-0.5">({selectedTags.length} selected)</span>}
              </button>
            </div>
          )}

          {step === "suggestions" && (
            <div className="px-5 pb-4">
              <p className="text-sm text-white font-medium sticky top-0 z-10 py-2 mb-2" style={{ background: "oklch(0.13 0.025 255)" }}>Select the wording that resonates with you. Then you can edit to make it your own:</p>
              <div className="space-y-2 mb-4">
                {reviews.map((review, i) => (
                  <button key={i} onClick={() => selectReview(review)}
                    className="w-full text-left p-4 rounded-xl border transition-all hover:border-blue-400/40"
                    style={{ background: "oklch(0.16 0.025 255)", borderColor: "oklch(0.25 0.04 255)" }}>
                    <div className="text-amber-400 text-xs mb-1.5">{"⭐".repeat(5)}</div>
                    <span className="text-sm leading-relaxed text-white/90">{review}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("tags")}
                className="text-xs text-white/60 hover:text-white/80 transition-all w-full text-center py-2">
                ← Back to tags
              </button>
            </div>
          )}

          {step === "edit" && (
            <div className="px-5 pb-4">
              <p className="text-xl text-white font-bold mb-2">✨ Make it your own!</p>
              <p className="text-sm text-amber-300/90 font-medium mb-1">Is there anything you can add?</p>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">Please personalize your review — add any detail, name, or what made your experience a blessing to you. <span className="text-amber-400 font-semibold">Thank you so much! 🙏</span></p>
              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={5}
                className="w-full p-4 rounded-xl text-sm leading-relaxed text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                style={{ background: "oklch(0.16 0.025 255)", border: "1px solid oklch(0.25 0.04 255)" }} />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setStep("suggestions")}
                  className="flex-1 py-3 rounded-xl text-sm text-white/70 border border-white/20 hover:border-white/20 transition-all">
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
