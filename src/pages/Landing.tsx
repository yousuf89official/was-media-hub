import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">WAS Media Hub</h1>
          <Button onClick={() => navigate("/auth")} size="sm">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Social Media Intelligence{" "}
              <span className="text-primary">That Drives Results</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Track, measure, and optimize your social media campaigns with real-time AVE and SOV calculations. 
              Built for We Are Social Indonesia.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow)]"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Modern Teams
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Campaign Tracking",
                desc: "Monitor earned, owned, and paid media metrics in real-time",
              },
              {
                icon: TrendingUp,
                title: "AVE Calculation",
                desc: "Automatic Advertising Value Equivalent with weighted multipliers",
              },
              {
                icon: Users,
                title: "Client Portal",
                desc: "Secure client access to view campaigns and reports",
              },
              {
                icon: Award,
                title: "Share of Voice",
                desc: "Track your brand's presence against competitors",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-all"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Media Analytics?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join leading brands using WAS Media Hub to drive campaign success
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate("/auth")}
            >
              Start Tracking Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 We Are Social Indonesia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
