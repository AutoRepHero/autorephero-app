/* ============================================================
   AutoRepHero Review Hub — Review Platform Data & Types
   ============================================================ */

export interface ReviewPlatform {
  id: string;
  name: string;
  shortName: string;
  icon: string; // emoji or SVG path
  color: string; // brand color for display
  priority: "gold" | "blue" | "dim";
  priorityLabel: string;
  url: string;
  reviewCount?: number;
  targetCount?: number;
}

export interface BusinessConfig {
  businessName: string;
  businessType: string;
  keywords: string[];
  ownerName: string;
  platforms: ReviewPlatform[];
  tagline?: string;
}

// Demo business configuration — in production this would be loaded from a URL param or API
export const DEMO_BUSINESS: BusinessConfig = {
  businessName: "AutoRepHero",
  businessType: "Digital Marketing Agency",
  keywords: ["responsive", "professional", "results-driven", "local SEO", "reputation management", "trustworthy"],
  ownerName: "Chuck",
  tagline: "Protecting your reputation. Building your legacy.",
  platforms: [
    {
      id: "google",
      name: "Google Business",
      shortName: "Google",
      icon: "G",
      color: "#4285F4",
      priority: "gold",
      priorityLabel: "TOP PRIORITY",
      url: "https://g.page/r/YOUR_PLACE_ID/review",
      reviewCount: 12,
      targetCount: 50,
    },
    {
      id: "facebook",
      name: "Facebook",
      shortName: "Facebook",
      icon: "f",
      color: "#1877F2",
      priority: "blue",
      priorityLabel: "NEEDED",
      url: "https://www.facebook.com/YOUR_PAGE/reviews",
      reviewCount: 8,
      targetCount: 25,
    },
    {
      id: "yelp",
      name: "Yelp",
      shortName: "Yelp",
      icon: "Y",
      color: "#FF1A1A",
      priority: "blue",
      priorityLabel: "NEEDED",
      url: "https://www.yelp.com/biz/YOUR_BUSINESS",
      reviewCount: 3,
      targetCount: 20,
    },
    {
      id: "bbb",
      name: "Better Business Bureau",
      shortName: "BBB",
      icon: "B",
      color: "#003087",
      priority: "dim",
      priorityLabel: "OPTIONAL",
      url: "https://www.bbb.org/us/YOUR_BUSINESS",
      reviewCount: 2,
      targetCount: 10,
    },
    {
      id: "trustpilot",
      name: "Trustpilot",
      shortName: "Trustpilot",
      icon: "T",
      color: "#00B67A",
      priority: "dim",
      priorityLabel: "OPTIONAL",
      url: "https://www.trustpilot.com/review/YOUR_BUSINESS",
      reviewCount: 0,
      targetCount: 10,
    },
  ],
};

// AI prompt templates by business type
export const AI_PROMPT_TEMPLATES: Record<string, string[]> = {
  default: [
    "I've been working with {business} for a while now, and what stands out most is...",
    "If you're looking for {keyword1} and {keyword2}, {business} delivers because...",
    "What I appreciate most about {business} is how they...",
    "I was impressed by the level of {keyword1} I received. Specifically...",
    "For anyone considering {business}, here's what you need to know...",
  ],
  "Digital Marketing Agency": [
    "Since working with {business}, my online presence has improved because...",
    "The results we've seen from their {keyword1} work have been...",
    "What sets {business} apart from other agencies is their approach to...",
    "I hired {business} to help with {keyword1} and the outcome was...",
    "If you want a team that is {keyword1} and {keyword2}, {business} is...",
  ],
};

export function getAIPrompts(business: BusinessConfig): string[] {
  const templates =
    AI_PROMPT_TEMPLATES[business.businessType] || AI_PROMPT_TEMPLATES["default"];
  const kw = business.keywords;
  return templates.map((t) =>
    t
      .replace(/{business}/g, business.businessName)
      .replace(/{keyword1}/g, kw[0] || "professional")
      .replace(/{keyword2}/g, kw[1] || "results-driven")
  );
}

// Smart routing: returns the platform to send the customer to based on priority weighting
export function getSmartRoutedPlatform(platforms: ReviewPlatform[]): ReviewPlatform {
  const goldPlatforms = platforms.filter((p) => p.priority === "gold");
  const bluePlatforms = platforms.filter((p) => p.priority === "blue");

  if (goldPlatforms.length > 0) {
    // Among gold platforms, pick the one furthest from its target
    return goldPlatforms.reduce((prev, curr) => {
      const prevGap = (prev.targetCount || 0) - (prev.reviewCount || 0);
      const currGap = (curr.targetCount || 0) - (curr.reviewCount || 0);
      return currGap > prevGap ? curr : prev;
    });
  }

  if (bluePlatforms.length > 0) {
    return bluePlatforms.reduce((prev, curr) => {
      const prevGap = (prev.targetCount || 0) - (prev.reviewCount || 0);
      const currGap = (curr.targetCount || 0) - (curr.reviewCount || 0);
      return currGap > prevGap ? curr : prev;
    });
  }

  return platforms[0];
}
