/* ============================================================
   AutoRepHero Review Hub — App Router (Multi-Tenant)

   ROUTES:
   /                  → ReviewLanding (default demo hub)
   /review/:slug      → Multi-tenant review hub for a business
   /:slug             → Staff PIN access (same as /review/:slug but PIN-gated)
   /signup            → Business owner signup
   /login             → Business owner login
   /dashboard         → Owner dashboard (auth required)
   /admin             → Chuck's admin panel (admin role required)
   /success           → Post-review confirmation
   /landing           → Marketing landing page (legacy)
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
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminPanel from "./pages/AdminPanel";
import BusinessReviewHub from "./pages/BusinessReviewHub";

function Router() {
  return (
    <Switch>
      {/* Default demo hub */}
      <Route path="/" component={ReviewLanding} />
      {/* Marketing landing page */}
      <Route path="/landing" component={LandingPage} />
      {/* Legacy demo dashboard */}
      <Route path="/dashboard" component={Dashboard} />
      {/* Post-review success */}
      <Route path="/success" component={SuccessPage} />
      {/* Auth */}
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      {/* Owner dashboard */}
      <Route path="/owner" component={OwnerDashboard} />
      {/* Admin panel (Chuck only) */}
      <Route path="/admin" component={AdminPanel} />
      {/* Multi-tenant review hub */}
      <Route path="/review/:slug" component={BusinessReviewHub} />
      {/* Staff PIN access via slug */}
      <Route path="/:slug" component={BusinessReviewHub} />
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
