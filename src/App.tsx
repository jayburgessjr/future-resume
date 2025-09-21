import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { usePersistenceStore } from "@/stores/persistenceStore";
import ModernLandingPage from "./pages/ModernLandingPage";
import BuilderFlowPage from "./pages/BuilderFlowPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import RecruiterHighlightsPage from "./pages/RecruiterHighlightsPage";
import InterviewToolkitPage from "./pages/InterviewToolkitPage";
import AuthPage from "./pages/AuthPage";
import AuthSignIn from "./pages/AuthSignIn";
import AuthSignUp from "./pages/AuthSignUp";
import PricingPage from "./pages/PricingPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { ReturnToGate } from "./components/auth/ReturnToGate";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AdminGuard } from "./components/auth/AdminGuard";
import { AdminPage } from "./pages/admin/AdminPage";
import { ErrorBoundary, AuthErrorBoundary, ResumeBuilderErrorBoundary } from "./components/common/ErrorBoundary";
import { OfflineIndicator, OfflineIndicatorMini, SyncStatusDebug } from "./components/common/OfflineIndicator";

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { user } = useAuth();
  const { loadResumes } = usePersistenceStore();

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user, loadResumes]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ReturnToGate><ModernLandingPage /></ReturnToGate>} />
        <Route path="/auth/sign-in" element={<ReturnToGate><AuthSignIn /></ReturnToGate>} />
        <Route path="/auth/sign-up" element={<ReturnToGate><AuthSignUp /></ReturnToGate>} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Legacy auth route */}
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<AuthGuard><ErrorBoundary><DashboardPage /></ErrorBoundary></AuthGuard>} />
        <Route path="/builder" element={<AuthGuard><ResumeBuilderErrorBoundary><BuilderFlowPage /></ResumeBuilderErrorBoundary></AuthGuard>} />
        <Route path="/cover-letter" element={<AuthGuard><ErrorBoundary><CoverLetterPage /></ErrorBoundary></AuthGuard>} />
        <Route path="/recruiter-highlights" element={<AuthGuard><ErrorBoundary><RecruiterHighlightsPage /></ErrorBoundary></AuthGuard>} />
        <Route path="/interview-toolkit" element={<AuthGuard><ErrorBoundary><InterviewToolkitPage /></ErrorBoundary></AuthGuard>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AuthGuard><AdminGuard><AdminPage /></AdminGuard></AuthGuard>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global UI Components */}
      <OfflineIndicator />
      <OfflineIndicatorMini />
      <SyncStatusDebug />
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthErrorBoundary>
            <AuthenticatedApp />
          </AuthErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
