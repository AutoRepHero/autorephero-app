/* ============================================================
   AUTOREPHERO.COM — Marketing Landing Page v3
   Design: Dark Command Center / Field Operations UI
   Phone: (509) 818-0787
   Logo: ARHSheild.png (CDN)
   Prompt 1 Changes:
   - New hero: "Get More Reviews Without Asking Twice" + 3 CTAs
   - 4-tier pricing: Free Trial / RRDS Kit $149 / Core $49mo / Automation Pro $197mo
   - Citations add-on below pricing
   - 3 testimonials (placeholder, replace with real)
   - Lead modal with 5 fields (Name, Business, Phone, Email, Website)
   - Mobile nav hamburger fix
   - Roadmap accordion moved below FAQ
   - Removed "your foot in the door" phrase
   ============================================================ */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Star, Zap, BarChart3, MessageSquare, Globe,
  ChevronDown, Menu, X, Phone, Mail,
  CheckCircle2, ArrowRight, Smartphone, QrCode, Wifi,
  Bot, Search, Share2, CreditCard, Quote
} from "lucide-react";

// ─── Assets ───────────────────────────────────────────────────
const ARH_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/ARHSheild_2d3ca6e5.png";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/aro-hero-bg-V7J9EVwURHxdGi3n9AhhTg.webp";
const NFC_CARD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/aro-nfc-card-MrAeQjbgLKk6dXWwdwJ78b.webp";
const PHONE = "(509) 818-0787";
const EMAIL = "info@autorephero.com";

// ─── Lead Capture Modal ───────────────────────────────────────
function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", business: "", phone: "", email: "", website: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://formspree.io/f/xvgaqlkb", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          business: form.business,
          phone: form.phone,
          email: form.email,
          website: form.website || "Not provided",
          _replyto: form.email,
          _subject: `New AutoRepHero Lead — ${form.business}`,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please call us directly at (509) 818-0787.");
      }
    } catch {
      alert("Network error. Please call us directly at (509) 818-0787.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "oklch(0.05 0.01 240 / 0.88)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "oklch(0.12 0.02 240)",
          border: "1px solid oklch(0.62 0.2 240 / 0.4)",
          borderRadius: 18,
          padding: "2.25rem",
          width: "100%", maxWidth: 440,
          boxShadow: "0 0 60px oklch(0.62 0.2 240 / 0.2)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", cursor: "pointer",
          color: "oklch(0.4 0.015 255)",
        }}><X size={18} /></button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <img src={ARH_LOGO} alt="AutoRepHero" style={{ width: 56, margin: "0 auto 1rem" }} />
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.4rem", fontWeight: 800,
              color: "oklch(0.95 0.005 255)", marginBottom: "0.75rem",
            }}>You're in!</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem", color: "oklch(0.52 0.015 255)", lineHeight: 1.6,
            }}>
              We'll reach out within 24 hours to get you set up. Get ready to deploy your reputation weapon.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
              <img src={ARH_LOGO} alt="AutoRepHero" style={{ width: 36 }} />
              <div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem", fontWeight: 800,
                  color: "oklch(0.95 0.005 255)", lineHeight: 1.2,
                }}>Start Free — 14 Day Trial</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", color: "oklch(0.45 0.015 255)",
                }}>We'll reach out within 24 hours to get you set up.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[
                { name: "name", label: "FULL NAME", placeholder: "First & Last Name", type: "text", required: true },
                { name: "business", label: "BUSINESS NAME", placeholder: "Joe's Auto Shop", type: "text", required: true },
                { name: "phone", label: "PHONE NUMBER", placeholder: "(509) 555-0100", type: "tel", required: true },
                { name: "email", label: "EMAIL ADDRESS", placeholder: "you@yourbusiness.com", type: "email", required: true },
                { name: "website", label: "WEBSITE (OPTIONAL)", placeholder: "yourwebsite.com", type: "text", required: false },
              ].map(field => (
                <div key={field.name}>
                  <label style={{
                    display: "block",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                    color: "oklch(0.5 0.015 255)", marginBottom: "0.35rem",
                  }}>{field.label}</label>
                  <input
                    required={field.required}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "0.7rem 0.9rem",
                      background: "oklch(0.09 0.015 240)",
                      border: "1px solid oklch(0.25 0.03 255 / 0.6)",
                      borderRadius: 9,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.88rem",
                      color: "oklch(0.88 0.005 255)",
                      outline: "none",
                    }}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "0.5rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.07em",
                  padding: "0.85rem", borderRadius: 10,
                  background: loading ? "oklch(0.45 0.12 240)" : "oklch(0.62 0.2 240)",
                  border: "none", color: "white", cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 0 24px oklch(0.62 0.2 240 / 0.3)",
                  transition: "all 0.2s",
                }}>
                {loading ? "SENDING..." : "GET STARTED →"}
              </button>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.7rem", color: "oklch(0.38 0.015 255)",
                textAlign: "center",
              }}>No spam. No contracts. We protect your inbox like we protect your reputation.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
function Nav({ onGetStarted }: { onGetStarted: () => void }) {
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
      position: "sticky", top: 0, zIndex: 100,
      background: "oklch(0.09 0.015 240 / 0.95)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid oklch(0.22 0.03 255 / 0.5)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>
        {/* Desktop + Mobile top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}
            onClick={() => navigate("/landing")}>
            <img src={ARH_LOGO} alt="AutoRepHero" style={{ width: 34, height: 34, objectFit: "contain" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: "1.05rem",
              color: "oklch(0.95 0.005 255)",
              letterSpacing: "0.01em",
            }}>
              AutoRep<span style={{ color: "oklch(0.7 0.22 240)" }}>Hero</span>
            </span>
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
            {links.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em",
                  color: "oklch(0.5 0.015 255)", transition: "color 0.2s",
                  padding: "0.25rem 0",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.85 0.005 255)")}
                onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.5 0.015 255)")}>
                {l.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Desktop CTAs — hidden on mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
            <a href={`tel:+15098180787`} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.72rem", fontWeight: 600,
              color: "oklch(0.55 0.015 255)", textDecoration: "none",
            }}>
              <Phone size={12} /> {PHONE}
            </a>
            <button onClick={() => navigate("/review")} style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em",
              padding: "0.45rem 1rem", borderRadius: 8,
              background: "transparent",
              border: "1px solid oklch(0.62 0.2 240 / 0.4)",
              color: "oklch(0.7 0.22 240)", cursor: "pointer",
            }}>DEMO</button>
            <button onClick={onGetStarted} style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em",
              padding: "0.45rem 1.1rem", borderRadius: 8,
              background: "oklch(0.62 0.2 240)",
              border: "none", color: "white", cursor: "pointer",
            }}>START FREE</button>
          </div>

          {/* Mobile right side: phone + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="flex md:hidden">
            <a href="tel:+15098180787" style={{
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.72rem", fontWeight: 700,
              color: "oklch(0.7 0.22 240)", textDecoration: "none",
              padding: "0.35rem 0.7rem", borderRadius: 7,
              background: "oklch(0.62 0.2 240 / 0.1)",
              border: "1px solid oklch(0.62 0.2 240 / 0.25)",
            }}>
              <Phone size={12} /> Call
            </a>
            <button onClick={() => setOpen(!open)}
              style={{ background: "none", border: "none", color: "oklch(0.7 0.005 255)", cursor: "pointer", padding: "0.25rem" }}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div style={{
            borderTop: "1px solid oklch(0.22 0.03 255 / 0.5)",
            padding: "1rem 0 1.5rem",
          }} className="md:hidden">
            {links.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)} style={{
                display: "block", width: "100%", textAlign: "left",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em",
                color: "oklch(0.6 0.015 255)", padding: "0.7rem 0",
                borderBottom: "1px solid oklch(0.18 0.02 255 / 0.3)",
              }}>{l.label.toUpperCase()}</button>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: "1.25rem" }}>
              <button onClick={() => { setOpen(false); navigate("/review"); }} style={{
                flex: 1, fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.05em",
                padding: "0.7rem", borderRadius: 8,
                background: "transparent", border: "1px solid oklch(0.62 0.2 240 / 0.4)",
                color: "oklch(0.7 0.22 240)", cursor: "pointer",
              }}>LIVE DEMO</button>
              <button onClick={() => { setOpen(false); onGetStarted(); }} style={{
                flex: 1, fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.05em",
                padding: "0.7rem", borderRadius: 8,
                background: "oklch(0.62 0.2 240)", border: "none", color: "white", cursor: "pointer",
              }}>START FREE</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  const [, navigate] = useLocation();

  function scrollTo(href: string) {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section style={{ position: "relative", overflow: "hidden", minHeight: "90vh", display: "flex", alignItems: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover", backgroundPosition: "center right", opacity: 0.45,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, oklch(0.08 0.015 240) 40%, oklch(0.08 0.015 240 / 0.5) 70%, transparent 100%)",
      }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem 5rem", width: "100%" }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.35rem 0.9rem", borderRadius: 100,
            background: "oklch(0.62 0.2 240 / 0.12)",
            border: "1px solid oklch(0.62 0.2 240 / 0.3)",
            marginBottom: "1.5rem",
          }}>
            <img src={ARH_LOGO} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.7 0.22 240)",
            }}>REPUTATION MANAGEMENT · LOCAL SEO · AI AUTOMATION</span>
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "oklch(0.97 0.005 255)",
            marginBottom: "1.25rem",
          }}>
            Get More Reviews<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Without Asking</span><br />
            <span style={{ color: "oklch(0.78 0.15 80)" }}>Twice.</span>
          </h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(1rem, 2vw, 1.12rem)",
            color: "oklch(0.62 0.015 255)", lineHeight: 1.65,
            marginBottom: "2.25rem", maxWidth: 540,
          }}>
            AutoRepHero's Rapid Review Deployment System puts a review machine on your counter, in your pocket, and in your customers' hands — starting free.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: "1.25rem" }}>
            <button onClick={onGetStarted} style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.06em",
              padding: "0.9rem 2rem", borderRadius: 10,
              background: "oklch(0.62 0.2 240)", border: "none", color: "white", cursor: "pointer",
              boxShadow: "0 0 30px oklch(0.62 0.2 240 / 0.35)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              START FREE — 14 DAY TRIAL <ArrowRight size={15} />
            </button>
            <button onClick={() => scrollTo("#pricing")} style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.06em",
              padding: "0.9rem 1.75rem", borderRadius: 10,
              background: "transparent", border: "1px solid oklch(0.35 0.04 255)",
              color: "oklch(0.7 0.015 255)", cursor: "pointer",
            }}>GET THE DEPLOYMENT KIT</button>
          </div>

          <button onClick={() => navigate("/review")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.88rem", fontWeight: 600,
            color: "oklch(0.7 0.22 240)",
            display: "flex", alignItems: "center", gap: 6,
            padding: 0, marginBottom: "2rem",
          }}>
            Try the Live Demo <ArrowRight size={14} />
          </button>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2rem" }}>
            {["No contracts. Cancel anytime.", "NFC + QR + SMS included", "Works on any phone"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={13} style={{ color: "oklch(0.7 0.18 145)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "oklch(0.5 0.015 255)" }}>{t}</span>
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
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem",
      }}>
        {stats.map(({ value, label }) => (
          <div key={value} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "2.6rem", fontWeight: 800,
              color: "oklch(0.78 0.15 80)", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "0.5rem",
            }}>{value}</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0.015 255)", lineHeight: 1.5 }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Review Hub Feature ───────────────────────────────────────
function ReviewHubFeature({ onGetStarted }: { onGetStarted: () => void }) {
  const [, navigate] = useLocation();

  const features = [
    { icon: <Wifi size={16} />, title: "NFC Tap-to-Review", desc: "Customer taps your branded card. Review Hub opens instantly. No app download. No friction." },
    { icon: <QrCode size={16} />, title: "QR Code Fallback", desc: "Print QR codes for receipts, counter cards, or window stickers. Same app, same experience." },
    { icon: <Smartphone size={16} />, title: "Employee Phone Shortcut", desc: "Every employee has the app on their home screen. Hand the phone to the customer. Done in 60 seconds." },
    { icon: <BarChart3 size={16} />, title: "Smart Platform Routing", desc: "Automatically surfaces the platform that needs reviews most — balancing your reputation across Google, Yelp, Facebook, and BBB." },
    { icon: <MessageSquare size={16} />, title: "AI Review Prompts", desc: "Five AI-generated sentence starters tailored to your business. Customers copy one, write their review, submit. Authentic. Specific. Fast." },
    { icon: <Star size={16} />, title: "Owner Dashboard", desc: "PIN-protected dashboard to manage platform priority, track progress toward review goals, and generate QR codes on demand." },
  ];

  return (
    <section id="features" style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "4rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0.3rem 0.85rem", borderRadius: 100,
            background: "oklch(0.78 0.15 80 / 0.1)",
            border: "1px solid oklch(0.78 0.15 80 / 0.25)", marginBottom: "1rem",
          }}>
            <Star size={11} style={{ color: "oklch(0.78 0.15 80)" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.78 0.15 80)",
            }}>THE POINT-OF-SERVICE REVIEW CAPTURE WEAPON</span>
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)", marginBottom: "1rem",
          }}>
            One Tap. Five Stars.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Every Time.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem", color: "oklch(0.5 0.015 255)", maxWidth: 540, lineHeight: 1.65,
          }}>
            The Review Hub opens instantly on any phone — NFC tap, QR scan, or direct link. No App Store. No friction. No excuses.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "3rem", alignItems: "center",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{
                padding: "1.25rem",
                background: "oklch(0.12 0.02 240)",
                border: "1px solid oklch(0.2 0.03 255 / 0.5)",
                borderRadius: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "oklch(0.62 0.2 240 / 0.12)",
                  border: "1px solid oklch(0.62 0.2 240 / 0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "oklch(0.7 0.22 240)", marginBottom: "0.75rem",
                }}>{icon}</div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.85rem", fontWeight: 700,
                  color: "oklch(0.88 0.005 255)", marginBottom: "0.35rem",
                }}>{title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", color: "oklch(0.45 0.015 255)", lineHeight: 1.55,
                }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
            <img src={NFC_CARD} alt="AutoRepHero NFC Card"
              style={{ width: "100%", maxWidth: 420, borderRadius: 16, boxShadow: "0 24px 80px oklch(0.62 0.2 240 / 0.2)" }} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => navigate("/review")} style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.7rem 1.5rem", borderRadius: 10,
                background: "oklch(0.78 0.15 80 / 0.12)",
                border: "1px solid oklch(0.78 0.15 80 / 0.35)",
                color: "oklch(0.78 0.15 80)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Zap size={14} /> TRY LIVE DEMO
              </button>
              <button onClick={onGetStarted} style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.7rem 1.5rem", borderRadius: 10,
                background: "oklch(0.62 0.2 240)",
                border: "none", color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <ArrowRight size={14} /> START FREE
              </button>
            </div>
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
      n: "01", title: "Deploy Your Hub",
      desc: "We set up your Review Hub — branded to your business, loaded with your review platform links.",
      detail: "Takes less than 24 hours. We handle the setup. You hand us your Google, Yelp, and Facebook links.",
    },
    {
      n: "02", title: "Arm Your Team",
      desc: "Your NFC card, QR code, and employee phone shortcut are ready. Every touchpoint is a review opportunity.",
      detail: "Counter card, window sticker, receipt insert, employee home screen shortcut — all pointing to the same hub.",
    },
    {
      n: "03", title: "Watch Reviews Grow",
      desc: "Customers tap, scan, or click. The AI prompt sheet removes the blank-page problem. Reviews start flowing.",
      detail: "Smart routing balances reviews across platforms. You track progress in the owner dashboard.",
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
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)", marginBottom: "0.75rem",
          }}>
            Deployed in 24 Hours.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>Running in 48.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {steps.map(({ n, title, desc, detail }) => (
            <div key={n} style={{
              padding: "2rem",
              background: "oklch(0.12 0.02 240)",
              border: "1px solid oklch(0.2 0.03 255 / 0.5)",
              borderRadius: 16, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -10, right: 16,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "5rem", fontWeight: 900,
                color: "oklch(0.62 0.2 240 / 0.06)", lineHeight: 1, userSelect: "none",
              }}>{n}</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                color: "oklch(0.7 0.22 240)", marginBottom: "0.75rem",
              }}>STEP {n}</div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.25rem", fontWeight: 800,
                color: "oklch(0.92 0.005 255)", marginBottom: "0.75rem",
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

// ─── Testimonials ─────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote: "We went from 12 Google reviews to 47 in two months. The NFC cards sit right on our front counter — customers tap and review before they even leave.",
      author: "Local Service Business Owner",
      note: "Example testimonial — replace with real client quote",
    },
    {
      quote: "I tried asking for reviews manually for years. This thing does it automatically. Best money I spend every month.",
      author: "Small Business Owner",
      note: "Example testimonial — replace with real client quote",
    },
    {
      quote: "The deployment kit was a game changer. Having a physical card to hand someone makes all the difference.",
      author: "Contractor",
      note: "Example testimonial — replace with real client quote",
    },
  ];

  return (
    <section style={{
      padding: "6rem 1.5rem",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "oklch(0.95 0.005 255)",
          }}>
            Real Results.<br />
            <span style={{ color: "oklch(0.78 0.15 80)" }}>Real Businesses.</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}>
          {testimonials.map(({ quote, author, note }) => (
            <div key={author} style={{
              padding: "2rem",
              background: "oklch(0.12 0.02 240)",
              border: "1px solid oklch(0.2 0.03 255 / 0.5)",
              borderRadius: 16, position: "relative",
            }}>
              <Quote size={20} style={{ color: "oklch(0.62 0.2 240 / 0.4)", marginBottom: "1rem" }} />
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem", color: "oklch(0.72 0.01 255)",
                lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic",
              }}>"{quote}"</p>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)", paddingTop: "1rem",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "oklch(0.62 0.2 240 / 0.15)",
                  border: "1px solid oklch(0.62 0.2 240 / 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Star size={14} style={{ color: "oklch(0.78 0.15 80)" }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.82rem", fontWeight: 700,
                    color: "oklch(0.75 0.005 255)",
                  }}>— {author}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.65rem", color: "oklch(0.35 0.015 255)", fontStyle: "italic",
                  }}>{note}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────
function Pricing({ onGetStarted }: { onGetStarted: () => void }) {
  const plans = [
    {
      name: "RRDS FREE TRIAL",
      subtitle: "Try Before You Pay",
      price: "FREE",
      period: "14 days",
      desc: "See results before you spend a dime. Full Review Hub, smart routing, and AI prompts — live for your business in 24 hours.",
      features: [
        "Review Hub page for your business",
        "Smart review routing (3 platforms)",
        "AI-powered review starters for customers",
        "Shareable link (text, email, QR)",
        "See results before you pay a dime",
      ],
      trial: true,
      cta: "START FREE TRIAL",
      highlight: false,
      available: true,
      badge: null,
    },
    {
      name: "RAPID REVIEW DEPLOYMENT KIT™",
      subtitle: "Physical Deployment",
      price: "$149",
      period: "one-time",
      desc: "Everything in the Free Trial plus branded NFC cards, counter placard, and full setup. The physical weapon in your hands.",
      features: [
        "Everything in Free Trial",
        "Branded NFC tap-to-review cards (2x)",
        "Counter placard with QR code",
        "Full setup + programming included",
        "Custom branding for your business",
        "Quick-start guide",
      ],
      trial: false,
      cta: "ORDER YOUR KIT",
      highlight: true,
      available: true,
      badge: "MOST POPULAR",
    },
    {
      name: "CORE PLAN",
      subtitle: "Monthly Subscription",
      price: "$49",
      period: "/mo",
      desc: "The full Review Hub platform with analytics, reporting, and priority support. Permanent infrastructure for your reputation.",
      features: [
        "Everything in the Kit",
        "Review Hub with up to 5 platforms",
        "Review analytics dashboard",
        "Monthly review performance reports",
        "Priority support",
        "Ongoing platform updates",
      ],
      trial: false,
      cta: "SUBSCRIBE — $49/MO",
      highlight: false,
      available: false,
      badge: "COMING SOON",
    },
    {
      name: "AUTOMATION PRO",
      subtitle: "Full Automation Stack",
      price: "$197",
      period: "/mo",
      desc: "Automated SMS + email review requests, AI responses, and smart follow-up sequences. The system runs while you work.",
      features: [
        "Everything in Core",
        "Unlimited review platforms",
        "Automated SMS + email review requests",
        "AI-powered review responses",
        "Smart send timing (after job completion)",
        "Customer follow-up sequences",
        "SMS/email usage allowance included",
      ],
      trial: false,
      cta: "GO AUTOMATIC — $197/MO",
      highlight: false,
      available: false,
      badge: "COMING SOON",
      note: "Includes monthly message allowance. Overage billed per message.",
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
            color: "oklch(0.95 0.005 255)", marginBottom: "0.75rem",
          }}>
            Straightforward Pricing.<br />
            <span style={{ color: "oklch(0.7 0.22 240)" }}>No Surprises.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem", color: "oklch(0.5 0.015 255)",
            maxWidth: 480, margin: "0 auto", lineHeight: 1.65,
          }}>
            Start free. Deploy fast. Scale when you're ready. No contracts. No credit card for the trial.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem", alignItems: "start",
        }}>
          {plans.map(({ name, subtitle, price, period, desc, features, trial, cta, highlight, available, badge, note }: any) => (
            <div key={name} style={{
              padding: "2rem",
              background: highlight ? "oklch(0.14 0.025 240)" : "oklch(0.12 0.02 240)",
              border: `1px solid ${highlight ? "oklch(0.62 0.2 240 / 0.5)" : "oklch(0.2 0.03 255 / 0.5)"}`,
              borderRadius: 16, position: "relative",
              boxShadow: highlight ? "0 0 50px oklch(0.62 0.2 240 / 0.12)" : "none",
              opacity: available ? 1 : 0.85,
            }}>
              {badge && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                  padding: "0.3rem 1rem", borderRadius: 100,
                  background: highlight ? "oklch(0.62 0.2 240)" : "oklch(0.78 0.15 80 / 0.15)",
                  border: highlight ? "none" : "1px solid oklch(0.78 0.15 80 / 0.4)",
                  color: highlight ? "white" : "oklch(0.78 0.15 80)",
                  whiteSpace: "nowrap",
                }}>{badge}</div>
              )}

              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                color: highlight ? "oklch(0.7 0.22 240)" : "oklch(0.45 0.015 255)",
                marginBottom: "0.25rem",
              }}>{name}</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem", color: "oklch(0.38 0.015 255)",
                marginBottom: "0.75rem",
              }}>{subtitle}</div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "0.5rem" }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: price === "FREE" ? "2.2rem" : "2.8rem",
                  fontWeight: 800, color: "oklch(0.95 0.005 255)", lineHeight: 1,
                }}>{price}</span>
                {period && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "oklch(0.45 0.015 255)" }}>{period}</span>}
              </div>

              {trial && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "0.2rem 0.65rem", borderRadius: 100,
                  background: "oklch(0.7 0.18 145 / 0.1)",
                  border: "1px solid oklch(0.7 0.18 145 / 0.3)",
                  marginBottom: "0.75rem",
                }}>
                  <CheckCircle2 size={10} style={{ color: "oklch(0.7 0.18 145)" }} />
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
                    color: "oklch(0.7 0.18 145)",
                  }}>NO CREDIT CARD REQUIRED</span>
                </div>
              )}

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem", color: "oklch(0.48 0.015 255)",
                lineHeight: 1.55, marginBottom: "1.5rem",
              }}>{desc}</p>

              <button onClick={onGetStarted} style={{
                width: "100%",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em",
                padding: "0.8rem", borderRadius: 10,
                background: available ? (highlight ? "oklch(0.62 0.2 240)" : "oklch(0.55 0.18 240)") : "transparent",
                border: available ? "none" : "1px solid oklch(0.3 0.04 255)",
                color: available ? "white" : "oklch(0.55 0.015 255)",
                cursor: "pointer", marginBottom: "1.5rem",
                boxShadow: available ? "0 0 20px oklch(0.62 0.2 240 / 0.25)" : "none",
              }}>{cta}</button>

              {note && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.7rem", color: "oklch(0.38 0.015 255)",
                  lineHeight: 1.5, marginBottom: "1rem", fontStyle: "italic",
                }}>{note}</p>
              )}

              <div style={{ borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)", paddingTop: "1.25rem" }}>
                {features.map((f: string) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "0.6rem" }}>
                    <CheckCircle2 size={13} style={{ color: "oklch(0.7 0.18 145)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.8rem", color: "oklch(0.52 0.015 255)", lineHeight: 1.4,
                    }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Citations Add-on */}
        <div style={{
          marginTop: "2rem",
          padding: "1.5rem 2rem",
          background: "oklch(0.12 0.02 240)",
          border: "1px solid oklch(0.78 0.15 80 / 0.25)",
          borderRadius: 14,
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "oklch(0.78 0.15 80 / 0.1)",
              border: "1px solid oklch(0.78 0.15 80 / 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Globe size={18} style={{ color: "oklch(0.78 0.15 80)" }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.9rem", fontWeight: 800,
                color: "oklch(0.88 0.005 255)",
              }}>Citations & Listings Management — <span style={{ color: "oklch(0.78 0.15 80)" }}>$59/mo add-on</span></div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem", color: "oklch(0.45 0.015 255)",
              }}>Get your business listed accurately across 60+ directories. Available with any paid plan.</div>
            </div>
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
            padding: "0.3rem 0.9rem", borderRadius: 100,
            background: "oklch(0.78 0.15 80 / 0.1)",
            border: "1px solid oklch(0.78 0.15 80 / 0.3)",
            color: "oklch(0.78 0.15 80)",
            whiteSpace: "nowrap",
          }}>COMING SOON</div>
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
      a: "When a customer selects a platform, a sheet slides up with 5 sentence starters tailored to your business type and keywords. The customer picks one, finishes the thought in their own words, and submits. It reduces blank-page paralysis and produces more specific, authentic reviews.",
    },
    {
      q: "Can I use this without an NFC card?",
      a: "Absolutely. The app works via QR code (print it on anything), a direct link (text it to customers), or as a home screen shortcut on an employee's phone. The NFC card is the premium experience but is never required.",
    },
    {
      q: "What is the difference between Core and Automation Pro?",
      a: "Core gives you the full Review Hub platform with analytics and reporting. Automation Pro adds the SMS and email automation layer — timed review request sequences that run automatically after a customer visit, plus AI-powered review responses. Both are coming soon — join the waitlist to be first.",
    },
    {
      q: "Is there a contract or long-term commitment?",
      a: "No contracts. Month-to-month subscription. Cancel anytime. We earn your business every month.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
            fontWeight: 800, lineHeight: 1.1, color: "oklch(0.95 0.005 255)",
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
              borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
            }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: "100%", textAlign: "left",
                padding: "1.25rem 1.5rem",
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
              }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.92rem", fontWeight: 700,
                  color: open === i ? "oklch(0.88 0.005 255)" : "oklch(0.72 0.005 255)",
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
                    fontSize: "0.88rem", color: "oklch(0.52 0.015 255)", lineHeight: 1.7,
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

// ─── Expansion Modules (Roadmap Accordion — BELOW FAQ) ────────
function ExpansionModules() {
  const [open, setOpen] = useState(false);

  const modules = [
    { icon: <Bot size={15} />, title: "AI Review Response Engine", desc: "Auto-generate on-brand responses to every review — positive and negative. Posted automatically." },
    { icon: <Search size={15} />, title: "Citation Builder", desc: "Push your business info to 60+ citation sites. Keep NAP consistent. Dominate local search." },
    { icon: <Share2 size={15} />, title: "Social Posting Dashboard", desc: "Schedule and post content across Facebook, Instagram, and LinkedIn from one dashboard." },
    { icon: <Globe size={15} />, title: "Google Business Profile Optimizer", desc: "Connect GBP and post updates, photos, and offers directly from AutoRepHero." },
    { icon: <BarChart3 size={15} />, title: "Reputation Analytics", desc: "Track review velocity, sentiment trends, and competitor comparisons in one dashboard." },
    { icon: <MessageSquare size={15} />, title: "AI Chat Widget", desc: "Opt-in chat widget for client websites — captures leads and triggers automated review follow-up." },
  ];

  return (
    <section style={{
      padding: "4rem 1.5rem",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%", textAlign: "left",
            background: "oklch(0.12 0.02 240)",
            border: `1px solid ${open ? "oklch(0.62 0.2 240 / 0.4)" : "oklch(0.2 0.03 255 / 0.5)"}`,
            borderRadius: 14, padding: "1.5rem 1.75rem",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
          }}>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "oklch(0.7 0.22 240)", marginBottom: "0.3rem",
            }}>PLATFORM ROADMAP</div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1rem", fontWeight: 700,
              color: "oklch(0.85 0.005 255)",
            }}>What's Coming Next</span>
          </div>
          <div style={{
            flexShrink: 0, transition: "transform 0.25s",
            transform: open ? "rotate(180deg)" : "none",
            color: open ? "oklch(0.7 0.22 240)" : "oklch(0.4 0.015 255)",
          }}>
            <ChevronDown size={18} />
          </div>
        </button>

        {open && (
          <div style={{
            marginTop: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
          }}>
            {modules.map(({ icon, title, desc }) => (
              <div key={title} style={{
                padding: "1.25rem",
                background: "oklch(0.11 0.018 240)",
                border: "1px solid oklch(0.18 0.025 255 / 0.5)",
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: "oklch(0.62 0.2 240 / 0.1)",
                    border: "1px solid oklch(0.62 0.2 240 / 0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "oklch(0.62 0.2 240 / 0.7)",
                  }}>{icon}</div>
                  <h4 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.82rem", fontWeight: 700,
                    color: "oklch(0.75 0.005 255)",
                  }}>{title}</h4>
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem", color: "oklch(0.42 0.015 255)", lineHeight: 1.55,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────
function FinalCTA({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section style={{
      padding: "6rem 1.5rem",
      background: "oklch(0.1 0.018 240)",
      borderTop: "1px solid oklch(0.2 0.03 255 / 0.4)",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <img src={ARH_LOGO} alt="AutoRepHero" style={{ width: 64, margin: "0 auto 1.5rem" }} />
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 800, lineHeight: 1.05,
          color: "oklch(0.95 0.005 255)", marginBottom: "1rem",
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
          Every day without a review system is a day your competitors are pulling ahead. Start free today. 14 days. No credit card. No contracts.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button onClick={onGetStarted} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.07em",
            padding: "0.9rem 2.25rem", borderRadius: 10,
            background: "oklch(0.62 0.2 240)", border: "none", color: "white", cursor: "pointer",
            boxShadow: "0 0 35px oklch(0.62 0.2 240 / 0.35)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            START FREE — 14 DAY TRIAL <ArrowRight size={15} />
          </button>
          <a href={`tel:+15098180787`} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.07em",
            padding: "0.9rem 2rem", borderRadius: 10,
            background: "transparent", border: "1px solid oklch(0.3 0.04 255)",
            color: "oklch(0.65 0.015 255)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
          }}>
            <Phone size={14} /> {PHONE}
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: "2.5rem 1.5rem", borderTop: "1px solid oklch(0.18 0.025 255 / 0.5)" }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={ARH_LOGO} alt="AutoRepHero" style={{ width: 22, height: 22, objectFit: "contain" }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.8rem", fontWeight: 700, color: "oklch(0.4 0.015 255)",
          }}>AutoRepHero</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "oklch(0.32 0.015 255)" }}>
            · Spokane, WA · chuckZonline LLC
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href={`tel:+15098180787`} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem", color: "oklch(0.38 0.015 255)", textDecoration: "none",
          }}>
            <Phone size={12} /> {PHONE}
          </a>
          <a href={`mailto:${EMAIL}`} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem", color: "oklch(0.38 0.015 255)", textDecoration: "none",
          }}>
            <Mail size={12} /> {EMAIL}
          </a>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "oklch(0.28 0.015 255)" }}>
            © 2026 AutoRepHero. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.09 0.015 240)" }}>
      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Nav onGetStarted={() => setModalOpen(true)} />
      <Hero onGetStarted={() => setModalOpen(true)} />
      <StatsBar />
      <ReviewHubFeature onGetStarted={() => setModalOpen(true)} />
      <HowItWorks />
      <Testimonials />
      <Pricing onGetStarted={() => setModalOpen(true)} />
      <FAQ />
      <ExpansionModules />
      <FinalCTA onGetStarted={() => setModalOpen(true)} />
      <Footer />
    </div>
  );
}
