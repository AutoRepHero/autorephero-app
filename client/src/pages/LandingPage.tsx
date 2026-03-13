/* ============================================================
   AUTOREPHERO.COM — Marketing Landing Page
   Design: Dark Command Center / Field Operations UI
   Replaces: get.autorephero.com (GHL)
   Sections:
   - Nav (sticky)
   - Hero (headline + CTA + hero image)
   - Social proof stats bar
   - Problem/Solution (The Gap)
   - Review Hub feature (NFC card product)
   - How It Works (3 steps)
   - Full Platform Services
   - Pricing tiers
   - FAQ
   - CTA footer
   ============================================================ */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Star, Shield, Zap, BarChart3, MessageSquare, Globe,
  ChevronDown, ChevronRight, Menu, X, Phone, Mail,
  CheckCircle2, ArrowRight, Smartphone, QrCode, Wifi
} from "lucide-react";

// ─── Asset URLs ───────────────────────────────────────────────
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/aro-hero-bg-V7J9EVwURHxdGi3n9AhhTg.webp";
const NFC_CARD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/aro-nfc-card-MrAeQjbgLKk6dXWwdwJ78b.webp";
const DASHBOARD_PREVIEW = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/aro-dashboard-preview-ci7KjNaaLMLe7Gbe8KQfCG.webp";

// ─── Nav ──────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  function scrollTo(href: string) {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "oklch(0.09 0.015 240 / 0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid oklch(0.22 0.03 255 / 0.5)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => navigate("/")}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "oklch(0.62 0.2 240 / 0.15)",
              border: "1px solid oklch(0.62 0.2 240 / 0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={17} style={{ color: "oklch(0.7 0.22 240)" }} />
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: "1.05rem",
              color: "oklch(0.95 0.005 255)",
              letterSpacing: "0.01em",
            }}>
              AutoRep<span style={{ color: "oklch(0.7 0.22 240)" }}>Hero</span>
            </span>
          </div>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}
            className="hidden md:flex">
            {links.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em",
                  color: "oklch(0.55 0.015 255)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.85 0.005 255)")}
                onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.55 0.015 255)")}>
                {l.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hidden md:flex">
            <button
              onClick={() => navigate("/review")}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em",
                padding: "0.5rem 1.1rem", borderRadius: 8,
                background: "transparent",
                border: "1px solid oklch(0.62 0.2 240 / 0.4)",
                color: "oklch(0.7 0.22 240)", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.62 0.2 240 / 0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              DEMO APP
            </button>
            <button
              onClick={() => scrollTo("#pricing")}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em",
                padding: "0.5rem 1.3rem", borderRadius: 8,
                background: "oklch(0.62 0.2 240)",
                border: "none", color: "white", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.68 0.22 240)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "oklch(0.62 0.2 240)"; }}>
              GET STARTED
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden"
            style={{ background: "none", border: "none", color: "oklch(0.7 0.005 255)", cursor: "pointer" }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            borderTop: "1px solid oklch(0.22 0.03 255 / 0.5)",
            padding: "1rem 0 1.5rem",
          }}>
            {links.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em",
                  color: "oklch(0.65 0.015 255)",
                  padding: "0.65rem 0",
                }}>
                {l.label.toUpperCase()}
              </button>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
              <button onClick={() => { setOpen(false); navigate("/review"); }}
                style={{
                  flex: 1, fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em",
                  padding: "0.65rem", borderRadius: 8,
                  background: "transparent",
                  border: "1px solid oklch(0.62 0.2 240 / 0.4)",
                  color: "oklch(0.7 0.22 240)", cursor: "pointer",
                }}>
                DEMO APP
              </button>
              <button onClick={() => { setOpen(false); scrollTo("#pricing"); }}
                style={{
                  flex: 1, fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em",
                  padding: "0.65rem", borderRadius: 8,
                  background: "oklch(0.62 0.2 240)",
                  border: "none", color: "white", cursor: "pointer",
                }}>
                GET STARTED
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────
function Hero() {
  function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section style={{
      position: "relative", overflow: "hidden",
      minHeight: "90vh",
      display: "flex", alignItems: "center",
    }}>
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover", backgroundPosition: "center right",
        opacity: 0.55,
      }} />
      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, oklch(0.08 0.015 240) 40%, oklch(0.08 0.015 240 / 0.5) 70%, transparent 100%)",
      }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem 5rem", width: "100%" }}>
        <div style={{ maxWidth: 620 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.35rem 0.9rem", borderRadius: 100,
            background: "oklch(0.62 0.2 240 / 0.12)",
            border: "1px solid oklch(0.62 0.2 240 / 0.3)",
            marginBottom: "1.5rem",
          }}>
            <Shield size={11} style={{ color: "oklch(0.7 0.22 240)" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.7 0.22 240)",
            }}>REPUTATION MANAGEMENT · LOCAL SEO · AI AUTOMATION</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "oklch(0.97 0.005 255)",
            marginBottom: "1.25rem",
          }}>
            Protect Your<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Reputation.</span><br />
            <span style={{ color: "oklch(0.78 0.15 80)" }}>Own Your Market.</span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "oklch(0.62 0.015 255)",
            lineHeight: 1.65,
            marginBottom: "2.25rem",
            maxWidth: 520,
          }}>
            AutoRepHero arms local businesses with the tools to collect more reviews, rank higher on Google, and convert reputation into revenue — without chasing customers or paying for ads.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => scrollTo("#pricing")}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.85rem 2rem", borderRadius: 10,
                background: "oklch(0.62 0.2 240)",
                border: "none", color: "white", cursor: "pointer",
                boxShadow: "0 0 30px oklch(0.62 0.2 240 / 0.35)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}>
              GET STARTED FREE <ArrowRight size={15} />
            </button>
            <button
              onClick={() => scrollTo("#how-it-works")}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.85rem 1.75rem", borderRadius: 10,
                background: "transparent",
                border: "1px solid oklch(0.35 0.04 255)",
                color: "oklch(0.7 0.015 255)", cursor: "pointer",
                transition: "all 0.2s",
              }}>
              SEE HOW IT WORKS
            </button>
          </div>

          {/* Trust signals */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2rem", marginTop: "2.5rem" }}>
            {[
              "No contracts. Cancel anytime.",
              "NFC + QR + SMS included",
              "Works on any phone",
            ].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={13} style={{ color: "oklch(0.7 0.18 145)", flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem", color: "oklch(0.5 0.015 255)",
                }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "92%", label: "of consumers read reviews before choosing a local business" },
    { value: "54%", label: "more revenue for businesses with 40+ reviews vs. competitors" },
    { value: "84%", label: "of people trust online reviews as much as a personal recommendation" },
    { value: "72%", label: "of customers won't act until they read a positive review" },
  ];

  return (
    <section style={{
      background: "oklch(0.11 0.02 240)",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.5)",
      borderBottom: "1px solid oklch(0.2 0.03 255 / 0.5)",
      padding: "2.5rem 1.5rem",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "2rem",
      }}>
        {stats.map(({ value, label }) => (
          <div key={value} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "2.6rem", fontWeight: 800,
              color: "oklch(0.78 0.15 80)",
              letterSpacing: "-0.02em", lineHeight: 1,
              marginBottom: "0.5rem",
            }}>{value}</div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem", color: "oklch(0.45 0.015 255)",
              lineHeight: 1.5,
            }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Review Hub Feature ───────────────────────────────────────
function ReviewHubFeature() {
  const [, navigate] = useLocation();

  const features = [
    { icon: <Wifi size={16} />, title: "NFC Tap-to-Review", desc: "Customer taps your branded card. Review Hub opens instantly. No app download required." },
    { icon: <QrCode size={16} />, title: "QR Code Fallback", desc: "Print QR codes for receipts, counter cards, or window stickers. Same app, same experience." },
    { icon: <Smartphone size={16} />, title: "Employee Phone Shortcut", desc: "Every employee has the app on their home screen. Hand the phone to the customer. Done in 60 seconds." },
    { icon: <BarChart3 size={16} />, title: "Smart Platform Routing", desc: "The app automatically surfaces the platform that needs reviews most — balancing your reputation across Google, Yelp, Facebook, and BBB." },
    { icon: <MessageSquare size={16} />, title: "AI Review Prompts", desc: "Customers see 5 AI-generated sentence starters tailored to your business. They copy one, write their review, and you get authentic, specific feedback." },
    { icon: <Shield size={16} />, title: "Owner Dashboard", desc: "PIN-protected dashboard to manage platform priority, track progress toward review goals, and generate QR codes on demand." },
  ];

  return (
    <section id="features" style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ marginBottom: "4rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.3rem 0.85rem", borderRadius: 100,
            background: "oklch(0.78 0.15 80 / 0.1)",
            border: "1px solid oklch(0.78 0.15 80 / 0.25)",
            marginBottom: "1rem",
          }}>
            <Star size={11} style={{ color: "oklch(0.78 0.15 80)" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.78 0.15 80)",
            }}>REVIEW HUB — THE FLAGSHIP PRODUCT</span>
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)",
            marginBottom: "1rem",
          }}>
            One Tap. Five Stars.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Every Time.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem", color: "oklch(0.5 0.015 255)",
            maxWidth: 540, lineHeight: 1.65,
          }}>
            The Review Hub is a mobile-first web app your customers access via NFC card tap, QR code scan, or a direct link. No app store. No friction. Just reviews.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "3rem",
          alignItems: "center",
        }}>
          {/* Feature list */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{
                padding: "1.25rem",
                background: "oklch(0.12 0.02 240)",
                border: "1px solid oklch(0.2 0.03 255 / 0.5)",
                borderRadius: 12,
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "oklch(0.62 0.2 240 / 0.12)",
                  border: "1px solid oklch(0.62 0.2 240 / 0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "oklch(0.7 0.22 240)", marginBottom: "0.75rem",
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.85rem", fontWeight: 700,
                  color: "oklch(0.88 0.005 255)",
                  marginBottom: "0.35rem",
                }}>{title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", color: "oklch(0.45 0.015 255)",
                  lineHeight: 1.55,
                }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Product images */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
            <img src={NFC_CARD} alt="AutoRepHero NFC Card"
              style={{ width: "100%", maxWidth: 420, borderRadius: 16, boxShadow: "0 24px 80px oklch(0.62 0.2 240 / 0.2)" }} />
            <button
              onClick={() => navigate("/review")}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.75rem 1.75rem", borderRadius: 10,
                background: "oklch(0.78 0.15 80 / 0.12)",
                border: "1px solid oklch(0.78 0.15 80 / 0.35)",
                color: "oklch(0.78 0.15 80)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s",
              }}>
              <Zap size={14} />
              TRY THE LIVE DEMO
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "We Set You Up",
      desc: "We configure your Review Hub with your platforms, review goals, and business keywords. You get a branded NFC card and QR code ready to deploy.",
      detail: "Setup takes less than 24 hours. No technical knowledge required on your end.",
    },
    {
      n: "02",
      title: "Customer Taps or Scans",
      desc: "Your customer taps the NFC card or scans the QR code. The Review Hub opens on their phone — no app download, no login, no friction.",
      detail: "Works on iPhone 7+ and any Android with NFC. QR fallback works on every smartphone.",
    },
    {
      n: "03",
      title: "Reviews Flow In",
      desc: "Smart routing sends customers to the platform that needs reviews most. AI prompts help them write something specific and authentic in under 60 seconds.",
      detail: "You watch your review count climb across Google, Yelp, Facebook, and BBB simultaneously.",
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: "6rem 1.5rem",
      background: "oklch(0.1 0.018 240)",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.3rem 0.85rem", borderRadius: 100,
            background: "oklch(0.62 0.2 240 / 0.1)",
            border: "1px solid oklch(0.62 0.2 240 / 0.25)",
            marginBottom: "1rem",
          }}>
            <Zap size={11} style={{ color: "oklch(0.7 0.22 240)" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.7 0.22 240)",
            }}>THREE STEPS. ZERO COMPLEXITY.</span>
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)",
          }}>
            Simple Enough to Use.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Powerful Enough to Scale.</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}>
          {steps.map(({ n, title, desc, detail }) => (
            <div key={n} style={{
              padding: "2rem",
              background: "oklch(0.12 0.02 240)",
              border: "1px solid oklch(0.2 0.03 255 / 0.5)",
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Step number watermark */}
              <div style={{
                position: "absolute", top: -10, right: 16,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "5rem", fontWeight: 900,
                color: "oklch(0.62 0.2 240 / 0.06)",
                lineHeight: 1, userSelect: "none",
              }}>{n}</div>

              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                color: "oklch(0.7 0.22 240)", marginBottom: "0.75rem",
              }}>STEP {n}</div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.25rem", fontWeight: 800,
                color: "oklch(0.92 0.005 255)",
                marginBottom: "0.75rem",
              }}>{title}</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem", color: "oklch(0.55 0.015 255)",
                lineHeight: 1.65, marginBottom: "1rem",
              }}>{desc}</p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.78rem", color: "oklch(0.42 0.015 255)",
                lineHeight: 1.55,
                borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
                paddingTop: "0.85rem",
              }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────
function Services() {
  const services = [
    {
      icon: <Star size={20} />,
      title: "Review Hub",
      tag: "LIVE NOW",
      tagColor: "oklch(0.7 0.18 145)",
      tagBg: "oklch(0.7 0.18 145 / 0.1)",
      desc: "NFC + QR review collection with smart platform routing, AI prompts, and owner dashboard.",
    },
    {
      icon: <MessageSquare size={20} />,
      title: "SMS & Email Automation",
      tag: "COMING SOON",
      tagColor: "oklch(0.7 0.22 240)",
      tagBg: "oklch(0.62 0.2 240 / 0.1)",
      desc: "Timed review request sequences via Twilio SMS and SendGrid email. Set it and let it run.",
    },
    {
      icon: <Globe size={20} />,
      title: "Google Business Profile",
      tag: "ROADMAP",
      tagColor: "oklch(0.78 0.15 80)",
      tagBg: "oklch(0.78 0.15 80 / 0.1)",
      desc: "Connect your GBP and post updates, photos, and offers directly from your AutoRepHero dashboard.",
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Reputation Analytics",
      tag: "ROADMAP",
      tagColor: "oklch(0.78 0.15 80)",
      tagBg: "oklch(0.78 0.15 80 / 0.1)",
      desc: "Track review velocity, response rates, sentiment trends, and competitor comparisons in one dashboard.",
    },
    {
      icon: <Zap size={20} />,
      title: "AI Review Responses",
      tag: "COMING SOON",
      tagColor: "oklch(0.7 0.22 240)",
      tagBg: "oklch(0.62 0.2 240 / 0.1)",
      desc: "AI-generated responses to every review — personalized, on-brand, and posted automatically.",
    },
    {
      icon: <Shield size={20} />,
      title: "Citation Builder",
      tag: "ROADMAP",
      tagColor: "oklch(0.78 0.15 80)",
      tagBg: "oklch(0.78 0.15 80 / 0.1)",
      desc: "Push your business info to 50+ citation sites. Keep NAP consistent. Dominate local search.",
    },
  ];

  return (
    <section style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "3.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.3rem 0.85rem", borderRadius: 100,
            background: "oklch(0.62 0.2 240 / 0.1)",
            border: "1px solid oklch(0.62 0.2 240 / 0.25)",
            marginBottom: "1rem",
          }}>
            <Shield size={11} style={{ color: "oklch(0.7 0.22 240)" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.7 0.22 240)",
            }}>THE FULL PLATFORM</span>
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)",
            marginBottom: "0.75rem",
          }}>
            Everything You Need<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>to Own Your Market.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem", color: "oklch(0.5 0.015 255)",
            maxWidth: 500, lineHeight: 1.65,
          }}>
            AutoRepHero is building the complete local business reputation stack. Start with the Review Hub today. More tools ship every quarter.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}>
          {services.map(({ icon, title, tag, tagColor, tagBg, desc }) => (
            <div key={title} style={{
              padding: "1.75rem",
              background: "oklch(0.12 0.02 240)",
              border: "1px solid oklch(0.2 0.03 255 / 0.5)",
              borderRadius: 14,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "oklch(0.62 0.2 240 / 0.1)",
                  border: "1px solid oklch(0.62 0.2 240 / 0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "oklch(0.7 0.22 240)",
                }}>
                  {icon}
                </div>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "0.25rem 0.6rem", borderRadius: 100,
                  background: tagBg,
                  color: tagColor,
                  border: `1px solid ${tagColor}44`,
                }}>{tag}</span>
              </div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1rem", fontWeight: 700,
                color: "oklch(0.9 0.005 255)",
                marginBottom: "0.5rem",
              }}>{title}</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", color: "oklch(0.48 0.015 255)",
                lineHeight: 1.6,
              }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "STARTER",
      price: "$49",
      period: "/mo",
      desc: "The foot-in-the-door. Everything you need to start collecting reviews today.",
      features: [
        "Review Hub PWA (NFC + QR + link)",
        "Smart platform routing",
        "AI review prompt generator",
        "Up to 5 review platforms",
        "Owner dashboard + analytics",
        "QR code generator",
        "NFC card setup guide",
        "14-day free trial",
      ],
      cta: "START FREE TRIAL",
      highlight: false,
    },
    {
      name: "GROWTH",
      price: "$99",
      period: "/mo",
      desc: "Add automation. Let the system work while you run your business.",
      features: [
        "Everything in Starter",
        "SMS review request automation",
        "Email follow-up sequences",
        "Unlimited review platforms",
        "AI review response drafts",
        "Review velocity tracking",
        "Priority support",
        "14-day free trial",
      ],
      cta: "START FREE TRIAL",
      highlight: true,
    },
    {
      name: "PRO",
      price: "$199",
      period: "/mo",
      desc: "The full stack. Reputation, visibility, and content — all in one dashboard.",
      features: [
        "Everything in Growth",
        "Google Business Profile connect",
        "Social posting dashboard",
        "Video content creator",
        "Reputation analytics",
        "White-label option available",
        "Dedicated onboarding call",
        "14-day free trial",
      ],
      cta: "START FREE TRIAL",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" style={{
      padding: "6rem 1.5rem",
      background: "oklch(0.1 0.018 240)",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)",
            marginBottom: "0.75rem",
          }}>
            Straightforward Pricing.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>No Surprises.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem", color: "oklch(0.5 0.015 255)",
            maxWidth: 460, margin: "0 auto", lineHeight: 1.65,
          }}>
            Start free for 14 days. No credit card required. Cancel anytime. No contracts.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}>
          {plans.map(({ name, price, period, desc, features, cta, highlight }) => (
            <div key={name} style={{
              padding: "2rem",
              background: highlight ? "oklch(0.14 0.025 240)" : "oklch(0.12 0.02 240)",
              border: `1px solid ${highlight ? "oklch(0.62 0.2 240 / 0.5)" : "oklch(0.2 0.03 255 / 0.5)"}`,
              borderRadius: 16,
              position: "relative",
              boxShadow: highlight ? "0 0 50px oklch(0.62 0.2 240 / 0.12)" : "none",
            }}>
              {highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                  padding: "0.3rem 1rem", borderRadius: 100,
                  background: "oklch(0.62 0.2 240)",
                  color: "white",
                }}>MOST POPULAR</div>
              )}

              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                color: highlight ? "oklch(0.7 0.22 240)" : "oklch(0.5 0.015 255)",
                marginBottom: "0.5rem",
              }}>{name}</div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "0.5rem" }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "2.8rem", fontWeight: 800,
                  color: "oklch(0.95 0.005 255)", lineHeight: 1,
                }}>{price}</span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.9rem", color: "oklch(0.45 0.015 255)",
                }}>{period}</span>
              </div>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", color: "oklch(0.48 0.015 255)",
                lineHeight: 1.55, marginBottom: "1.5rem",
              }}>{desc}</p>

              <button style={{
                width: "100%",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.8rem", borderRadius: 10,
                background: highlight ? "oklch(0.62 0.2 240)" : "transparent",
                border: highlight ? "none" : "1px solid oklch(0.3 0.04 255)",
                color: highlight ? "white" : "oklch(0.65 0.015 255)",
                cursor: "pointer", marginBottom: "1.5rem",
                boxShadow: highlight ? "0 0 20px oklch(0.62 0.2 240 / 0.3)" : "none",
                transition: "all 0.2s",
              }}>{cta}</button>

              <div style={{ borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)", paddingTop: "1.25rem" }}>
                {features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "0.6rem" }}>
                    <CheckCircle2 size={13} style={{ color: "oklch(0.7 0.18 145)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.8rem", color: "oklch(0.52 0.015 255)",
                      lineHeight: 1.4,
                    }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Agency note */}
        <div style={{
          marginTop: "2rem", padding: "1.5rem 2rem",
          background: "oklch(0.12 0.02 240)",
          border: "1px solid oklch(0.78 0.15 80 / 0.25)",
          borderRadius: 14,
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
        }}>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.78 0.15 80)", marginBottom: "0.35rem",
            }}>AGENCY WHITE-LABEL — $299/MO</div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", color: "oklch(0.5 0.015 255)",
            }}>Full platform under your brand. Unlimited clients. Resell at any price.</p>
          </div>
          <button style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em",
            padding: "0.65rem 1.5rem", borderRadius: 9,
            background: "oklch(0.78 0.15 80 / 0.12)",
            border: "1px solid oklch(0.78 0.15 80 / 0.35)",
            color: "oklch(0.78 0.15 80)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            CONTACT FOR AGENCY PRICING <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "Do customers need to download an app?",
      a: "No. The Review Hub is a Progressive Web App — it opens instantly in the browser when a customer taps the NFC card or scans the QR code. No App Store, no download, no login required.",
    },
    {
      q: "What phones does the NFC card work with?",
      a: "iPhone 7 and newer (iOS 13+) and virtually all Android phones made in the last 6 years support NFC. For older phones or any device, the QR code fallback works on every smartphone with a camera.",
    },
    {
      q: "How does smart routing work?",
      a: "The Review Hub tracks how many reviews you have on each platform versus your target. It automatically surfaces the platform with the biggest gap — so your reviews grow evenly across Google, Yelp, Facebook, and BBB instead of piling up on one platform.",
    },
    {
      q: "What are AI review prompts?",
      a: "When a customer selects a platform, a sheet slides up with 5 sentence starters tailored to your business type and keywords. For example: 'The team at [business] fixed my [problem] in under an hour...' The customer picks one, finishes the thought in their own words, and submits. It reduces blank-page paralysis and produces more specific, authentic reviews.",
    },
    {
      q: "Can I use this without an NFC card?",
      a: "Absolutely. The app works via QR code (print it on anything), a direct link (text it to customers), or as a home screen shortcut on an employee's phone. The NFC card is the premium experience but is never required.",
    },
    {
      q: "Is there a contract or long-term commitment?",
      a: "No contracts. Month-to-month subscription. Cancel anytime. We earn your business every month.",
    },
    {
      q: "How quickly will I see results?",
      a: "Most clients see their first reviews within the first week of deployment. Meaningful volume — enough to move your Google ranking — typically builds within 30–60 days depending on your customer traffic.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)",
          }}>
            Questions Answered.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Straight.</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map(({ q, a }, i) => (
            <div key={i} style={{
              background: "oklch(0.12 0.02 240)",
              border: `1px solid ${open === i ? "oklch(0.62 0.2 240 / 0.4)" : "oklch(0.2 0.03 255 / 0.5)"}`,
              borderRadius: 12, overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "1.25rem 1.5rem",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.92rem", fontWeight: 700,
                  color: open === i ? "oklch(0.88 0.005 255)" : "oklch(0.72 0.01 255)",
                  lineHeight: 1.4,
                }}>{q}</span>
                <div style={{
                  flexShrink: 0, transition: "transform 0.2s",
                  transform: open === i ? "rotate(180deg)" : "none",
                  color: open === i ? "oklch(0.7 0.22 240)" : "oklch(0.4 0.015 255)",
                }}>
                  <ChevronDown size={16} />
                </div>
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem" }}>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem", color: "oklch(0.52 0.015 255)",
                    lineHeight: 1.7,
                  }}>{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────
function FinalCTA() {
  function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section style={{
      padding: "6rem 1.5rem",
      background: "oklch(0.1 0.018 240)",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "oklch(0.62 0.2 240 / 0.12)",
          border: "1px solid oklch(0.62 0.2 240 / 0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}>
          <Shield size={24} style={{ color: "oklch(0.7 0.22 240)" }} />
        </div>

        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 800, lineHeight: 1.05,
          color: "oklch(0.95 0.005 255)",
          marginBottom: "1rem",
        }}>
          Your Reputation Is<br />
          <span style={{ color: "oklch(0.78 0.15 80)" }}>Your Most Valuable Asset.</span>
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "1rem", color: "oklch(0.5 0.015 255)",
          lineHeight: 1.65, marginBottom: "2.5rem",
          maxWidth: 480, margin: "0 auto 2.5rem",
        }}>
          Every day without a review system is a day your competitors are pulling ahead. Start free today. No credit card. No contracts. No excuses.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => scrollTo("#pricing")}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.07em",
              padding: "0.9rem 2.25rem", borderRadius: 10,
              background: "oklch(0.62 0.2 240)",
              border: "none", color: "white", cursor: "pointer",
              boxShadow: "0 0 35px oklch(0.62 0.2 240 / 0.35)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
            START FREE — 14 DAYS <ArrowRight size={15} />
          </button>
          <a href="tel:+15093563591"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.07em",
              padding: "0.9rem 2rem", borderRadius: 10,
              background: "transparent",
              border: "1px solid oklch(0.3 0.04 255)",
              color: "oklch(0.65 0.015 255)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              textDecoration: "none",
            }}>
            <Phone size={14} />
            (509) 356-3591
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      padding: "2.5rem 1.5rem",
      borderTop: "1px solid oklch(0.18 0.025 255 / 0.5)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between",
        gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={14} style={{ color: "oklch(0.62 0.2 240 / 0.6)" }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.8rem", fontWeight: 700,
            color: "oklch(0.4 0.015 255)",
          }}>AutoRepHero</span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem", color: "oklch(0.32 0.015 255)",
          }}>· Spokane, WA · chuckZonline LLC</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="mailto:info@autorephero.com"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", color: "oklch(0.38 0.015 255)",
              textDecoration: "none",
            }}>
            <Mail size={12} />
            info@autorephero.com
          </a>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem", color: "oklch(0.28 0.015 255)",
          }}>© 2026 AutoRepHero. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.09 0.015 240)" }}>
      <Nav />
      <Hero />
      <StatsBar />
      <ReviewHubFeature />
      <HowItWorks />
      <Services />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
