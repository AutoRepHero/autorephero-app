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
      id: "facebook",
      name: "Facebook",
      shortName: "Facebook",
      icon: "f",
      color: "#1877F2",
      url: "https://www.facebook.com/YOUR_PAGE/reviews",
      reviewCount: 8,
      targetCount: 25,
      enabled: true,
      order: 1,
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
      order: 2,
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
      order: 3,
    },
    {
      id: "google",
      name: "Google Business",
      shortName: "Google",
      icon: "G",
      color: "#4285F4",
      url: "https://g.page/r/YOUR_PLACE_ID/review",
      reviewCount: 12,
      targetCount: 50,
      enabled: false,
      order: 4,
    },
    {
      id: "angi",
      name: "Angi",
      shortName: "Angi",
      icon: "A",
      color: "#FF6153",
      url: "https://www.angi.com/companylist/YOUR_BUSINESS",
      reviewCount: 0,
      targetCount: 15,
      enabled: false,
      order: 5,
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
      order: 6,
    },
    {
      id: "cargurus",
      name: "CarGurus",
      shortName: "CarGurus",
      icon: "🚗",
      color: "#6C2DC7",
      url: "https://www.cargurus.com/dealer/YOUR_DEALER",
      reviewCount: 0,
      targetCount: 15,
      enabled: false,
      order: 7,
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
  const kw = keywords.length > 0 ? keywords : ["great service", "professional", "reliable", "fair price"];
  
  // Helper: random pick from array
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const k = () => pick(kw);
  
  // Sentiment starters — how a real person begins a review
  const openers = [
    "Just had an amazing experience",
    "Really impressed",
    "Can't recommend them enough",
    "So glad I chose",
    "Hands down the best",
    "Very happy with the results",
    "Five stars all day",
    "This is how it should be done",
    "Absolutely worth it",
    "Finally found the right team",
    "Blown away",
    "Exceeded all my expectations",
  ];
  
  // Specific experience connectors
  const middles = [
    `They were ${k()} and ${k()} the entire time.`,
    `From the first phone call to the finished job, everything was ${k()}.`,
    `The team was ${k()} and really knew what they were doing.`,
    `What impressed me most was how ${k()} they were.`,
    `They showed up on time, did ${k()} work, and the price was fair.`,
    `Communication was great and the work was ${k()}.`,
    `I could tell right away these guys are ${k()}.`,
    `They treated me like family — ${k()} and honest about everything.`,
    `The whole process was smooth and ${k()}.`,
    `They explained everything upfront, no surprises, just ${k()} results.`,
  ];
  
  // Closers that prompt the customer to add their own detail
  const closers = [
    "» Now add: what service you got and one specific thing you liked",
    "» Make it yours: mention the person who helped you or the result",
    "» Add your detail: what was the job and what impressed you most",
    "» Personalize: describe your situation and how they solved it",
    "» Your turn: what would you tell a friend about them",
  ];
  
  // Platform-aware tips
  const platformTips: Record<string, string> = {
    Google: "💡 Google tip: mention the city/area — it helps them rank locally",
    Facebook: "💡 Facebook tip: tag the business page so your friends see it too",
    Yelp: "💡 Yelp tip: longer reviews with details tend to stay up and get featured",
    BBB: "💡 BBB tip: mention trust, reliability, or how they handled any concerns",
  };
  
  // Business-type specific scenario starters
  const scenariosByType: Record<string, string[]> = {
    default: [
      `I needed help and ${businessName} delivered.`,
      `Hired ${businessName} and couldn't be happier.`,
      `${businessName} came through when I needed them most.`,
    ],
    plumber: [
      `Had a leak that was getting worse and ${businessName} came out same day.`,
      `Our water heater died on a Sunday — ${businessName} had it replaced by Monday.`,
      `Clogged drain that nobody else could fix. ${businessName} handled it in an hour.`,
    ],
    roofer: [
      `Got hit by the windstorm and ${businessName} had a crew out within 48 hours.`,
      `Needed a full re-roof and ${businessName} made the whole process painless.`,
      `${businessName} found damage we didn't even know about and saved us thousands.`,
    ],
    auto: [
      `My check engine light came on and ${businessName} diagnosed it right away.`,
      `Been taking my car here for years — ${businessName} is the only shop I trust.`,
      `Got a second opinion from ${businessName} and saved $800 compared to the dealer.`,
    ],
    carlot: [
      `Just drove off the lot in my new truck — ${businessName} made it happen.`,
      `No pressure, no games — ${businessName} let me take my time and find the right car.`,
      `${businessName} got me approved when two other dealers turned me down.`,
    ],
    restaurant: [
      `The food at ${businessName} was incredible — we'll definitely be back.`,
      `Tried ${businessName} for the first time last weekend and it's now our favorite spot.`,
      `Great atmosphere, amazing food, and the staff at ${businessName} made us feel welcome.`,
    ],
    salon: [
      `Finally found my go-to stylist at ${businessName} — they nailed exactly what I wanted.`,
      `Best haircut I've had in years. ${businessName} actually listens.`,
      `Left ${businessName} feeling like a million bucks. Already booked my next appointment.`,
    ],
  };
  
  // Detect business type category
  const typeLower = businessType.toLowerCase();
  let typeKey = "default";
  if (typeLower.match(/plumb|pipe|drain|water heater/)) typeKey = "plumber";
  else if (typeLower.match(/roof|gutter|siding/)) typeKey = "roofer";
  else if (typeLower.match(/auto.*repair|mechanic|oil change|brake/)) typeKey = "auto";
  else if (typeLower.match(/car.*deal|car.*lot|auto.*sale|vehicle/)) typeKey = "carlot";
  else if (typeLower.match(/restaurant|food|pizza|burger|cafe|bar|grill/)) typeKey = "restaurant";
  else if (typeLower.match(/salon|hair|spa|barber|beauty|nail/)) typeKey = "salon";
  
  const scenarios = scenariosByType[typeKey] || scenariosByType.default;
  
  // Build 4 INCOMPLETE prompts — they MUST add their own details to be usable
  // These are conversation starters, NOT finished reviews
  const prompts: string[] = [];
  
  // Style 1: "I needed ___ and they ___"
  prompts.push(
    "I needed _______ and " + businessName + " _______. " +
    "\n\n✏️ Fill in what you needed and what they did. Example: \"I needed a leak fixed and they had someone out the same day.\""
  );
  
  // Style 2: Feeling + blank
  prompts.push(
    pick(openers) + " with " + businessName + " because _______. " +
    "The thing that stood out most was _______." +
    "\n\n✏️ What made it great? A person's name, the speed, the price, the result?"
  );
  
  // Style 3: Scenario starter with blanks
  prompts.push(
    pick(scenarios).replace(/\.$/, "") + " — they were _______ and _______." +
    "\n\n✏️ Add two words that describe your experience (fast, honest, thorough, friendly, etc.)"
  );
  
  // Style 4: Recommendation with reason
  prompts.push(
    "I'd recommend " + businessName + " to anyone who needs _______. Here's why: _______." +
    "\n\n✏️ What service? Why them? One sentence is all you need."
  );
  
  // Add platform tip to one random prompt
  const tip = platformTips[platformName] || "";
  if (tip) {
    const tipIdx = Math.floor(Math.random() * prompts.length);
    prompts[tipIdx] += "\n\n" + tip;
  }
  
  return prompts;
}
