import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Shield } from "lucide-react";

const PRODUCT_LABELS: Record<string, string> = {
  boots_on_the_ground: "Boots on the Ground — Starter Plan",
  nfc_starter_pack: "NFC Starter Pack",
  asset_starter_pack: "Asset Starter Pack",
};

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const [productName, setProductName] = useState("Your Order");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product") ?? "";
    if (PRODUCT_LABELS[product]) {
      setProductName(PRODUCT_LABELS[product]);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(0.10 0.015 240)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Space Grotesk', sans-serif",
        textAlign: "center",
      }}
    >
      {/* Shield logo */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Shield size={56} color="oklch(0.75 0.18 240)" strokeWidth={1.5} />
      </div>

      {/* Success icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "oklch(0.35 0.12 150 / 0.2)",
          border: "2px solid oklch(0.55 0.18 150)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <CheckCircle size={40} color="oklch(0.72 0.18 150)" />
      </div>

      <h1
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          fontWeight: 800,
          color: "oklch(0.97 0.005 240)",
          marginBottom: "0.75rem",
          letterSpacing: "-0.02em",
        }}
      >
        Order Confirmed
      </h1>

      <p
        style={{
          fontSize: "1.1rem",
          color: "oklch(0.72 0.18 240)",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        {productName}
      </p>

      <p
        style={{
          fontSize: "0.95rem",
          color: "oklch(0.65 0.01 240)",
          maxWidth: 480,
          lineHeight: 1.6,
          marginBottom: "2.5rem",
        }}
      >
        Payment received. Chuck will be in touch within one business day to get
        you deployed. Check your email for your receipt.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/review")}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            padding: "0.85rem 1.75rem",
            borderRadius: 8,
            background: "oklch(0.62 0.2 240)",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          OPEN REVIEW HUB <ArrowRight size={15} />
        </button>

        <button
          onClick={() => navigate("/landing")}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            padding: "0.85rem 1.75rem",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid oklch(1 0 0 / 0.15)",
            color: "oklch(0.75 0.01 240)",
            cursor: "pointer",
          }}
        >
          BACK TO HOME
        </button>
      </div>

      <p
        style={{
          marginTop: "3rem",
          fontSize: "0.8rem",
          color: "oklch(0.45 0.01 240)",
        }}
      >
        Questions? Call (509) 818-0787 or email chuck@autorephero.com
      </p>
    </div>
  );
}
