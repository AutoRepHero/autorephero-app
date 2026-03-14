/* ============================================================
   AutoRepHero Review Hub — App Router
   Design: Dark Command Center / Field Operations UI

   HOSTNAME-BASED ROUTING:
   - autorephero.com (root domain)  → LandingPage (marketing site)
   - app.autorephero.com            → ReviewLanding (NFC/QR tap destination)
   - localhost / dev                → ReviewLanding (default for dev)

   PATH ROUTES (apply on top of hostname routing):
   - /           → hostname-based default (see above)
   - /landing    → LandingPage (always, any domain)
   - /review     → ReviewLanding (always, any domain)
   - /dashboard  → Dashboard (owner PIN-protected panel)
   - /success    → SuccessPage (post-review confirmation)
   ============================================================ */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import ReviewLanding from "./pages/ReviewLanding";
import Dashboard from "./pages/Dashboard";
import SuccessPage from "./pages/SuccessPage";

// Detect if we're on the root marketing domain (not the app subdomain)
function isMarketingDomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  // autorephero.com and www.autorephero.com → marketing landing page
  // app.autorephero.com, localhost, *.manus.space → Review Hub app
  return (
    hostname === "autorephero.com" ||
    hostname === "www.autorephero.com"
  );
}

// Root route component — serves different content based on hostname
function RootRoute() {
  if (isMarketingDomain()) {
    return <LandingPage />;
  }
  return <ReviewLanding />;
}

function Router() {
  return (
    <Switch>
      {/* Root → hostname-based: autorephero.com = LandingPage, app.autorephero.com = ReviewLanding */}
      <Route path="/" component={RootRoute} />
      {/* Explicit /landing → always shows marketing page (any domain) */}
      <Route path="/landing" component={LandingPage} />
      {/* Explicit /review → always shows Review Hub (any domain) */}
      <Route path="/review" component={ReviewLanding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/success" component={SuccessPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.16 0.015 240)",
                border: "1px solid oklch(1 0 0 / 0.1)",
                color: "oklch(0.95 0.005 240)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
