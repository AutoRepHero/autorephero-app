/* ============================================================
   AUTOREPHERO REVIEW HUB — Core Data, Types & Business Config
   Design: Dark Command Center — Navy/Electric Blue/Gold
   ============================================================ */

export interface ReviewPlatform {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  url: string;
  reviewCount: number;
  targetCount: number;
  enabled: boolean;
  order: number; // manual sort order in dashboard
}

export interface BusinessConfig {
  businessName: string;
  businessType: string;
  keywords: string[];
  ownerName: string;
  ownerPin: string;
  tagline: string;
  platforms: ReviewPlatform[];
  hubUrl: string; // the public URL of this hub (for QR code)
}

// ─── Default Demo Config ──────────────────────────────────────
export const DEFAULT_CONFIG: BusinessConfig = {
  businessName: "AutoRepHero",
  businessType: "Digital Marketing Agency",
  keywords: ["responsive", "professional", "results-driven", "local SEO", "reputation management", "trustworthy"],
  ownerName: "Chuck",
  ownerPin: "1234",
  tagline: "Protecting your reputation. Building your legacy.",
  hubUrl: "https://app.autorephero.com",
  platforms: [
    {
      id: "google",
      name: "Google Business",
      shortName: "Google",
      icon: "G",
      color: "#4285F4",
      url: "https://g.page/r/YOUR_PLACE_ID/review",
      reviewCount: 12,
      targetCount: 50,
      enabled: true,
      order: 1,
    },
    {
      id: "facebook",
      name: "Facebook",
      shortName: "Facebook",
      icon: "f",
      color: "#1877F2",
      url: "https://www.facebook.com/YOUR_PAGE/reviews",
      reviewCount: 8,
      targetCount: 25,
      enabled: true,
      order: 2,
    },
    {
      id: "yelp",
      name: "Yelp",
      shortName: "Yelp",
      icon: "Y",
      color: "#FF1A1A",
      url: "https://www.yelp.com/biz/YOUR_BUSINESS",
      reviewCount: 3,
      targetCount: 20,
      enabled: true,
      order: 3,
    },
    {
      id: "bbb",
      name: "Better Business Bureau",
      shortName: "BBB",
      icon: "B",
      color: "#003087",
      url: "https://www.bbb.org/us/YOUR_BUSINESS",
      reviewCount: 2,
      targetCount: 10,
      enabled: true,
      order: 4,
    },
    {
      id: "trustpilot",
      name: "Trustpilot",
      shortName: "Trustpilot",
      icon: "T",
      color: "#00B67A",
      url: "https://www.trustpilot.com/review/YOUR_BUSINESS",
      reviewCount: 0,
      targetCount: 10,
      enabled: false,
      order: 5,
    },
  ],
};

// ─── LocalStorage Persistence ─────────────────────────────────
const STORAGE_KEY = "arh_config_v2";

export function getConfig(): BusinessConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as BusinessConfig;
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

export function saveConfig(config: BusinessConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function resetConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Smart Platform Routing ───────────────────────────────────
// Sorts enabled platforms by gap-to-target ratio (highest gap = top priority)
export function getSmartSortedPlatforms(platforms: ReviewPlatform[]): ReviewPlatform[] {
  const enabled = platforms.filter((p) => p.enabled);
  return [...enabled].sort((a, b) => {
    const gapA = a.targetCount > 0 ? (a.targetCount - a.reviewCount) / a.targetCount : 0;
    const gapB = b.targetCount > 0 ? (b.targetCount - b.reviewCount) / b.targetCount : 0;
    if (Math.abs(gapB - gapA) > 0.05) return gapB - gapA;
    return a.order - b.order;
  });
}

export function getTopPriorityPlatform(platforms: ReviewPlatform[]): ReviewPlatform | null {
  const sorted = getSmartSortedPlatforms(platforms);
  return sorted[0] || null;
}

// ─── Progress Helpers ─────────────────────────────────────────
export function getProgressPercent(current: number, target: number): number {
  if (target === 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
}

export function getPriorityLabel(platform: ReviewPlatform): { label: string; tier: "gold" | "blue" | "dim" } {
  const pct = getProgressPercent(platform.reviewCount, platform.targetCount);
  if (pct < 40) return { label: "TOP PRIORITY", tier: "gold" };
  if (pct < 75) return { label: "NEEDED", tier: "blue" };
  return { label: "STRONG", tier: "dim" };
}

// ─── AI Prompt Generator ─────────────────────────────────────
export function generateAIPrompts(config: BusinessConfig, platformName: string): string[] {
  const { businessName, businessType, keywords } = config;
  const kw = keywords;
  const k1 = kw[0] || "professional service";
  const k2 = kw[1] || "quality";
  const k3 = kw[2] || "results";
  const k4 = kw[3] || "expertise";

  const prompts = [
    `I've been working with ${businessName} and what stands out most is their ${k1}. If you need ${k2} you can count on, this is the team.`,
    `${businessName} delivered real ${k3} for my business. Their ${k4} in ${businessType.toLowerCase()} is the real deal — not just promises.`,
    `What sets ${businessName} apart is how ${k2} and ${k1} they are. I've worked with others — nobody compares.`,
    `I hired ${businessName} for ${k1} and the ${k3} were beyond what I expected. Worth every dollar.`,
    `If you want a team that is ${k1} and ${k2}, ${businessName} is who you call. Straight-forward, no fluff, just ${k3}.`,
  ];

  return prompts;
}
