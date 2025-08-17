import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  FileText, 
  Zap,
  Target,
  Trophy,
  Star,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ModernLandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FileText className="h-8 w-8 text-accent" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Resume Builder Pro
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Career Success</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-accent text-white">
                  <Link to="/builder">Resume Builder</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-accent text-white">
                  <Link to="/auth/sign-up">Start Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  #1 AI Resume Builder
                </Badge>
                
                <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Land Your{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Dream Job
                  </span>{" "}
                  in Days
                </h2>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Our AI-powered platform creates ATS-optimized resumes that get you 3x more interviews. 
                  Join 50,000+ professionals who've accelerated their careers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-white text-lg px-8 py-4 hover:scale-105 transition-transform">
                  <Link to="/auth/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 hover:bg-accent/10">
                  Watch Demo
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Free 7-Day Trial</p>
                    <p className="text-sm text-muted-foreground">No credit card required</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">3x More Interviews</p>
                    <p className="text-sm text-muted-foreground">Proven results</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">ATS-Optimized</p>
                    <p className="text-sm text-muted-foreground">100% compatible</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl transform rotate-3 blur-lg"></div>
              <Card className="relative bg-card/50 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Dashboard Preview</h3>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white">Live</Badge>
                    </div>
                    
                    {/* Mock Dashboard */}
                    <div className="space-y-4">
                      <div className="h-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-primary/10 rounded-lg p-4 text-center">
                          <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                          <p className="text-sm font-semibold">98% Match</p>
                        </div>
                        <div className="bg-accent/10 rounded-lg p-4 text-center">
                          <Target className="h-6 w-6 text-accent mx-auto mb-2" />
                          <p className="text-sm font-semibold">ATS Ready</p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-4 text-center">
                          <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                          <p className="text-sm font-semibold">Pro Quality</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gradient-to-r from-primary/30 to-transparent rounded"></div>
                        <div className="h-3 bg-gradient-to-r from-accent/30 to-transparent rounded w-4/5"></div>
                        <div className="h-3 bg-gradient-to-r from-primary/30 to-transparent rounded w-3/5"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">50,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                <span className="font-semibold">Industry Leader</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Got 5 interviews in the first week after using this. The AI optimization is incredible!"
                  </p>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Landed my dream role at FAANG. This tool made all the difference in my application."
                  </p>
                  <p className="font-semibold">Marcus Johnson</p>
                  <p className="text-sm text-muted-foreground">Product Manager</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The career change support was amazing. Went from retail to tech in 3 months!"
                  </p>
                  <p className="font-semibold">Jessica Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Data Analyst</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 mb-4">
              Powerful Features
            </Badge>
            <h3 className="text-4xl font-bold mb-4">Everything You Need to Win</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform gives you every advantage in today's competitive job market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-interactive bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-4">AI-Powered Optimization</h4>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes job descriptions and optimizes your resume for maximum ATS compatibility and human appeal.
                </p>
              </CardContent>
            </Card>

            <Card className="card-interactive bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Job-Specific Tailoring</h4>
                <p className="text-muted-foreground">
                  Automatically customize your resume for each application with industry-specific keywords and formatting.
                </p>
              </CardContent>
            </Card>

            <Card className="card-interactive bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Lightning Fast</h4>
                <p className="text-muted-foreground">
                  Generate a professional, optimized resume in under 60 seconds. No more hours of formatting and editing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary via-primary to-accent text-white border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <Badge className="bg-white/20 text-white border-0 mb-6">
                🎉 Limited Time Offer
              </Badge>
              <h3 className="text-4xl font-bold mb-6">Start Your Free Trial Today</h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Join thousands of successful job seekers who've transformed their careers. 
                No credit card required for your 7-day free trial.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4">
                  <Link to="/auth/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  View Pricing Plans
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold">7 Days</p>
                  <p className="text-white/80">Free Trial</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">$20/mo</p>
                  <p className="text-white/80">After Trial</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">Cancel</p>
                  <p className="text-white/80">Anytime</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-white/80">Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-accent" />
              <div>
                <span className="font-semibold">Resume Builder Pro</span>
                <p className="text-sm text-muted-foreground">© 2024 All rights reserved</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for ambitious professionals
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;