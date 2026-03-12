# AutoRepHero Review Hub — Design Brainstorm

## Context
A mobile-first PWA for small business owners and their employees. The primary use case is: a business owner or employee taps an NFC card on a customer's phone, which opens this app. The customer then chooses a review platform and optionally gets AI-generated prompts to help write their review. The design must feel trustworthy, fast, and professional — not "app-store generic."

---

<response>
<idea>
**Design Movement:** Industrial Precision / Tactical Utility

**Core Principles:**
1. Every element earns its place — no decorative noise
2. High-contrast, command-and-control hierarchy
3. Mobile-first, thumb-zone optimized layout
4. Masculine, authoritative, faith-grounded brand voice

**Color Philosophy:**
Deep charcoal (#0F1117) background with a bold amber/gold (#F59E0B) primary accent. The gold communicates authority and value — not luxury, but earned excellence. Secondary accent: steel blue (#3B82F6) for interactive states. White (#FFFFFF) for primary text, slate (#94A3B8) for secondary.

**Layout Paradigm:**
Asymmetric card stack — review platform cards are stacked vertically with a left-border accent stripe indicating priority. The header is a bold, left-aligned brand bar. No centered hero sections. The screen is a command center, not a landing page.

**Signature Elements:**
1. Left-border priority stripe on each review card (amber = top priority)
2. Bold uppercase section labels with a thin rule separator
3. "SHARE NOW" CTA button — full-width, high-contrast, no ambiguity

**Interaction Philosophy:**
Tap = immediate action. No hover states that don't translate to mobile. Every interaction has a tactile feel — buttons depress, cards have a subtle press animation. The AI prompt modal slides up from the bottom (sheet pattern).

**Animation:**
Cards entrance: staggered slide-in from left (50ms delay each). Button press: scale(0.97) with 80ms spring. Sheet modal: slide-up with spring easing. No looping animations.

**Typography System:**
- Display/Headers: "Barlow Condensed" Bold — military, compact, authoritative
- Body: "Inter" Regular — clean, readable
- Labels: "Barlow Condensed" Semibold Uppercase
</idea>
<probability>0.07</probability>
</response>

<response>
<idea>
**Design Movement:** Clean Brutalism / Digital Signage

**Core Principles:**
1. Oversized type as the primary design element
2. Hard edges, no rounded corners on primary containers
3. Black and white foundation with one electric accent
4. Designed to be read at arm's length in a noisy environment

**Color Philosophy:**
Pure white (#FFFFFF) background. Pure black (#000000) for type and borders. One electric accent: AutoRepHero red (#DC2626). This creates a "receipt / signage" feel — clinical, trustworthy, impossible to misread.

**Layout Paradigm:**
Grid-based with explicit borders. Each review platform is a large bordered tile. The layout looks like a professional form or ballot — structured, serious, clear.

**Signature Elements:**
1. Thick black border frames around each platform tile
2. Oversized star rating display (decorative, not interactive)
3. Bold numeric priority indicator on each card

**Interaction Philosophy:**
Clicking a platform tile fills it with the accent color — a clear "selected" state. The AI prompt appears inline below the selected card, not in a modal.

**Animation:**
Tile selection: background fill with 150ms ease. No other animations — the design is about clarity, not delight.

**Typography System:**
- All text: "Space Grotesk" — geometric, modern, slightly quirky
- Heavy use of font-weight contrast (900 vs 400)
</idea>
<probability>0.06</probability>
</response>

<response>
<idea>
**Design Movement:** Dark Command Center / Field Operations UI

**Core Principles:**
1. Dark background to reduce eye strain in varied lighting conditions
2. Glowing accent colors for critical actions
3. Status-driven UI — each platform card shows its "health" (review count, priority level)
4. Designed for speed: one tap to share, one tap to get AI help

**Color Philosophy:**
Near-black background (oklch(0.12 0.01 240)) — a very dark navy, not pure black. Primary accent: electric blue (oklch(0.65 0.2 250)) for interactive elements. Success green (oklch(0.65 0.15 145)) for confirmation states. Gold (oklch(0.78 0.15 80)) for priority indicators. This palette reads as "professional tech tool" not "consumer app."

**Layout Paradigm:**
Full-bleed dark screen. Top: compact brand header with business name. Middle: scrollable list of review platform cards, each with a glowing left border indicating priority. Bottom: persistent "SHARE WITH CUSTOMER" CTA bar — always visible, always accessible.

**Signature Elements:**
1. Glowing left-border on cards (color = priority level: gold > blue > gray)
2. Persistent bottom action bar — never scroll to find the CTA
3. AI prompt section uses a "terminal-style" card with monospace font for the generated text

**Interaction Philosophy:**
The app is a tool, not an experience. Every interaction is purposeful. The "Share" action is the primary affordance — everything else supports it. The AI prompt is a power-user feature, accessible but not intrusive.

**Animation:**
Page load: cards fade in with 40ms stagger. Priority card: subtle pulse glow on the top-priority platform. Sheet: slide-up with damped spring. Button: scale + glow on press.

**Typography System:**
- Brand/Headers: "Barlow Condensed" Bold — compact, strong
- Body/Cards: "DM Sans" — modern, highly legible on dark backgrounds
- AI Prompt Output: "JetBrains Mono" — code-like, distinct from UI copy
</idea>
<probability>0.09</probability>
</response>

---

## Selected Approach: Dark Command Center / Field Operations UI

This approach is chosen because:
1. It works in all lighting conditions (dark bg = less glare in bright environments)
2. The "tool, not experience" philosophy matches the use case perfectly
3. The glowing priority system creates an immediate visual hierarchy that guides the business owner
4. It differentiates AutoRepHero from every generic white-background review tool on the market
5. It matches Chuck's brand voice: masculine, authoritative, tactical
