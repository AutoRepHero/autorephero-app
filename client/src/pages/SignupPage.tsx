/* ============================================================
   AUTOREPHERO — Business Owner Signup
   Design: Dark Command Center / Field Operations UI
   ============================================================ */
import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SignupPage() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      toast.success("Account created. Setting up your dashboard...");
      navigate("/owner");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signup.mutate(form);
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all text-sm`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "oklch(0.10 0.015 240)", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.62 0.2 240 / 0.15)", border: "1px solid oklch(0.62 0.2 240 / 0.3)" }}>
          <Shield size={28} style={{ color: "oklch(0.7 0.22 240)" }} />
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight">AutoRepHero</h1>
        <p className="text-white/40 text-sm mt-1">Deploy your reputation system</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "oklch(0.14 0.015 240)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
        <h2 className="text-white text-xl font-bold mb-1">Create your account</h2>
        <p className="text-white/40 text-sm mb-6">Start your 14-day free trial — no card required</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs font-semibold tracking-widest mb-1.5 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="Chuck Norris"
              className={inputClass}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-semibold tracking-widest mb-1.5 uppercase">Email</label>
            <input
              type="email"
              placeholder="you@yourbusiness.com"
              className={inputClass}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-semibold tracking-widest mb-1.5 uppercase">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Minimum 8 characters"
                className={`${inputClass} pr-10`}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8}
                required
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={signup.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-50"
            style={{ background: "oklch(0.62 0.2 240)", color: "#fff" }}>
            {signup.isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {signup.isPending ? "Creating account..." : "Deploy My System"}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign in
          </button>
        </p>
      </div>

      <p className="text-white/20 text-xs mt-6 text-center max-w-xs">
        By signing up you agree to our Terms of Service and Privacy Policy.
        14-day trial includes Facebook, Yelp, and BBB platforms.
      </p>
    </div>
  );
}
