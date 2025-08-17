import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePersistenceStore } from "@/stores/persistenceStore";
import LandingPage from "./pages/LandingPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import RecruiterHighlightsPage from "./pages/RecruiterHighlightsPage";
import InterviewToolkitPage from "./pages/InterviewToolkitPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

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
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/builder" replace /> : <AuthPage />} />
      <Route path="/builder" element={<ResumeBuilderPage />} />
      <Route path="/cover-letter" element={<CoverLetterPage />} />
      <Route path="/recruiter-highlights" element={<RecruiterHighlightsPage />} />
      <Route path="/interview-toolkit" element={<InterviewToolkitPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
