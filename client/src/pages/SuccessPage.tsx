/* ============================================================
   AutoRepHero Review Hub — SuccessPage
   Design: Dark Command Center / Field Operations UI
   Shown after customer taps "Leave Review" — confirms action
   and thanks the customer.
   ============================================================ */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Star, ArrowLeft, CheckCircle2 } from "lucide-react";

const SUCCESS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425645252/UzRYYiSF5sdvnoBygjnEgK/review-success-GJWBiH8UmMyVXMh5xNrnC7.webp";

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
      style={{ background: "oklch(0.12 0.015 240)", maxWidth: 480, margin: "0 auto" }}
    >
      <div
        className={`flex flex-col items-center text-center transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Success image */}
        <img
          src={SUCCESS_IMG}
          alt="5 stars"
          className="w-48 h-48 object-contain mb-6"
        />

        {/* Check icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: "oklch(0.65 0.15 145 / 0.15)", border: "1px solid oklch(0.65 0.15 145 / 0.30)" }}
        >
          <CheckCircle2 size={28} className="text-green-400" />
        </div>

        <h1
          className="text-white mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.2rem",
            fontWeight: 800,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          THANK YOU!
        </h1>

        <p
          className="text-white/50 text-sm leading-relaxed mb-2"
          style={{ fontFamily: "var(--font-body)", maxWidth: 280 }}
        >
          Your review means everything to us. It helps other people find the help they need.
        </p>

        {/* Stars */}
        <div className="flex gap-1 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={22}
              className="fill-amber-400 text-amber-400"
              style={{
                filter: "drop-shadow(0 0 6px oklch(0.78 0.15 80 / 0.6))",
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        <p
          className="text-white/25 text-xs mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Powered by AutoRepHero · autorephero.com
        </p>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <ArrowLeft size={15} />
          Back to review options
        </button>
      </div>
    </div>
  );
}
