import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="text-xl font-bold text-foreground">
              The Best Darn Job Resume Builder
            </h1>
          </div>
          <Link to="/builder">
            <Button className="btn-primary">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Resume Creation
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Build the{" "}
                  <span className="text-gradient">perfect resume</span>{" "}
                  in minutes
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create ATS-optimized resumes that get you noticed. Our AI tailors your experience to match any job description.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/builder">
                  <Button className="btn-hero w-full sm:w-auto">
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="btn-secondary w-full sm:w-auto">
                  See Examples
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  ATS-Optimized
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  AI-Powered
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Job-Matched
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-3xl transform rotate-3"></div>
              <img 
                src={heroImage} 
                alt="Resume builder interface"
                className="relative rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose Our Builder?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional results with intelligent customization
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elegant text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">AI-Optimized</h4>
              <p className="text-muted-foreground">
                Smart algorithms optimize your content for maximum impact
              </p>
            </div>

            <div className="card-elegant text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">ATS-Friendly</h4>
              <p className="text-muted-foreground">
                Formats that pass through applicant tracking systems
              </p>
            </div>

            <div className="card-elegant text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Multiple Formats</h4>
              <p className="text-muted-foreground">
                Export in various formats to match your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="card-elegant max-w-4xl mx-auto text-center hero-gradient text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h3>
            <p className="text-lg mb-8 opacity-90">
              Join thousands who've upgraded their careers with our AI-powered resume builder
            </p>
            <Link to="/builder">
              <Button className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold">
                Create Your Resume Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-accent" />
              <span className="text-sm text-muted-foreground">
                © 2024 The Best Darn Job Resume Builder
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for job seekers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;