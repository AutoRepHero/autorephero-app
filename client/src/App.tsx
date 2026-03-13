/* ============================================================
   AutoRepHero Review Hub — App Router
   Design: Dark Command Center / Field Operations UI
   Routes:
   - /           → Review Hub customer screen (NFC/QR tap destination)
   - /landing    → autorephero.com marketing landing page
   - /review     → Review Hub customer screen (alias)
   - /dashboard  → Business owner dashboard (manage platforms, settings)
   - /success    → Post-review success screen
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
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      {/* Root → Review Hub (NFC/QR tap destination for app.autorephero.com) */}
      <Route path="/" component={ReviewLanding} />
      {/* /landing → Marketing site (for autorephero.com to point to) */}
      <Route path="/landing" component={LandingPage} />
      {/* /review → alias for root Review Hub */}
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
