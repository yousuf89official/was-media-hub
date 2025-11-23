import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { DEFAULT_HERO, DEFAULT_CTA, DEFAULT_SETTINGS } from "@/utils/contentDefaults";
const Landing = () => {
  const navigate = useNavigate();
  const {
    getSetting,
    getSection,
    features,
    isLoading
  } = useSiteContent();
  const heroContent = getSection("hero") as any || DEFAULT_HERO;
  const ctaContent = getSection("cta") as any || DEFAULT_CTA;
  const siteTitle = getSetting("site_title") || DEFAULT_SETTINGS.site_title;
  const footerText = getSetting("footer_text") || DEFAULT_SETTINGS.footer_text;
  const loginText = getSetting("header_login_text") || DEFAULT_SETTINGS.header_login_text;
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">{siteTitle}</h1>
          <Button onClick={() => navigate("/auth")} size="sm">
            {loginText}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              {heroContent.title}
            </h2>
            <p className="text-xl text-muted-foreground">
              {heroContent.subtitle}
            </p>
            <div className="gap-4 pt-4 flex items-start justify-center">
              <Button size="lg" onClick={() => navigate(heroContent.primaryCtaAction || "/auth")} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow)] text-lg">
                {heroContent.primaryCtaText}
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
              const action = heroContent.secondaryCtaAction;
              if (action?.startsWith("#")) {
                document.querySelector(action)?.scrollIntoView({
                  behavior: "smooth"
                });
              } else {
                navigate(action || "#features");
              }
            }}>
                {heroContent.secondaryCtaText}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/50" id="features">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-12">
            {getSection("features")?.title || "Powerful Features for Modern Teams"}
          </h3>
          {isLoading ? <div className="text-center text-muted-foreground">Loading features...</div> : <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.filter((f: any) => f.is_active).map((feature: any) => {
            const IconComponent = (Icons as any)[feature.icon_name];
            return <div key={feature.id} className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-all">
                      {IconComponent && <IconComponent className="w-12 h-12 text-primary mb-4" />}
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>;
          })}
            </div>}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20">
            <h3 className="text-3xl font-bold mb-4">
              {ctaContent.title}
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              {ctaContent.description}
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate(ctaContent.buttonAction || "/auth")}>
              {ctaContent.buttonText}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>{footerText}</p>
        </div>
      </footer>
    </div>;
};
export default Landing;