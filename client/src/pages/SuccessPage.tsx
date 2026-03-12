/* ============================================================
   AUTOREPHERO REVIEW HUB — SuccessPage
   Design: Dark Command Center / Field Operations UI
   Shown after customer taps "Leave Review" — confirms action
   and thanks the customer.
   ============================================================ */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Star, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ maxWidth: 480, margin: "0 auto" }}
    >
      <div
        className={`flex flex-col items-center text-center transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Check icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "oklch(0.65 0.15 145 / 0.12)",
            border: "2px solid oklch(0.65 0.15 145 / 0.35)",
            boxShadow: "0 0 40px oklch(0.65 0.15 145 / 0.2)",
          }}
        >
          <CheckCircle2 size={36} style={{ color: "oklch(0.7 0.18 145)" }} />
        </div>

        <h1
          className="text-white mb-2"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "2.4rem",
            fontWeight: 800,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          THANK YOU!
        </h1>

        <p className="text-white/45 text-sm leading-relaxed mb-2" style={{ maxWidth: 280 }}>
          Your review means everything. It helps other people find the help they need.
        </p>

        {/* Stars */}
        <div className="flex gap-1.5 mb-8 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={24}
              className="fill-amber-400 text-amber-400 animate-star-pop"
              style={{
                filter: "drop-shadow(0 0 8px oklch(0.78 0.15 80 / 0.7))",
                animationDelay: `${i * 100}ms`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Brand */}
        <div className="cmd-card px-4 py-3 mb-8 text-center">
          <p className="text-white/25 text-[0.65rem] mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.06em" }}>
            POWERED BY
          </p>
          <p className="text-white/60 text-sm font-semibold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            AutoRepHero
          </p>
          <p className="text-white/25 text-xs">autorephero.com</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/35 hover:text-white/65 transition-colors text-sm"
        >
          <ArrowLeft size={14} />
          Back to review options
        </button>
      </div>
    </div>
  );
}
