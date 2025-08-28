import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ArrowRight, 
  FileText, 
  Sparkles,
  ArrowUpRight,
  Check,
  User,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";

const ModernLandingPage = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="border-b border-border/20 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <FileText className="h-4 w-4 text-background" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Future Resume</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <SubscriptionBadge />
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                  <Link to="/builder">Resume Builder</Link>
                </Button>
                <Button
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Link to="/auth/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                  <Link to="/auth/sign-up">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-none">
              Create resumes that 
              <span className="block text-muted-foreground">get you hired</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Generate ATS-optimized resumes in seconds with AI. 
              Join thousands who've landed their dream jobs.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 transition-all duration-200 hover:scale-105">
              <Link to="/auth/sign-up">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground group transition-all duration-200">
              <Link to="/pricing">
                View pricing
                <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </Link>
            </Button>
          </div>

          <div className="pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <p className="text-sm text-muted-foreground/70 mb-8">Trusted by professionals at</p>
            <div className="flex items-center justify-center gap-12 text-muted-foreground/50 text-sm font-medium">
              <span className="hover:text-muted-foreground/70 transition-colors cursor-default">Google</span>
              <span className="hover:text-muted-foreground/70 transition-colors cursor-default">Microsoft</span>
              <span className="hover:text-muted-foreground/70 transition-colors cursor-default">Apple</span>
              <span className="hover:text-muted-foreground/70 transition-colors cursor-default">Amazon</span>
              <span className="hover:text-muted-foreground/70 transition-colors cursor-default">Meta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-16">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
              Everything you need to stand out
            </h2>
            <p className="text-xl text-muted-foreground">
              Built for modern job seekers who want results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 group cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-200">
                <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold group-hover:text-foreground/80 transition-colors">AI-powered</h3>
                <p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  Smart algorithms that understand what recruiters want to see
                </p>
              </div>
            </div>

            <div className="space-y-4 group cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-200">
                <Check className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold group-hover:text-foreground/80 transition-colors">ATS-friendly</h3>
                <p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  Formats that pass through applicant tracking systems
                </p>
              </div>
            </div>

            <div className="space-y-4 group cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-200">
                <ArrowUpRight className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold group-hover:text-foreground/80 transition-colors">Interview ready</h3>
                <p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  Complete toolkit including cover letters and interview prep
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join thousands of professionals who've upgraded their careers
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 hover:scale-105">
                <Link to="/auth/sign-up">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                <Link to="/pricing">Learn about pricing</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground/70">
              No credit card required • 7-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-border/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
                <FileText className="h-3 w-3 text-background" />
              </div>
              <span className="font-semibold">Future Resume</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Future Resume. Built for ambitious professionals.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;