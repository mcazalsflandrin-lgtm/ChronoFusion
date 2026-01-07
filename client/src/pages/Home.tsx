import React from "react";
import { Link } from "wouter";
import { ArrowRight, Activity, Camera, Layers, PlayCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n";

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 group">
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Navbar with Language Switcher */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-end">
        <LanguageSwitcher />
      </nav>

      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-8 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t("hero.badge")}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {t("hero.title")} <br />
            <span className="text-primary text-glow">{t("hero.subtitle")}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {t("hero.description")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/editor">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                {t("hero.cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="rounded-full text-lg">
              <PlayCircle className="mr-2 w-5 h-5" />
              {t("hero.demo")}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <FeatureCard 
            icon={Camera}
            title={t("feature.frames.title")}
            description={t("feature.frames.desc")}
          />
          <FeatureCard 
            icon={Activity}
            title={t("feature.masking.title")}
            description={t("feature.masking.desc")}
          />
          <FeatureCard 
            icon={Layers}
            title={t("feature.layers.title")}
            description={t("feature.layers.desc")}
          />
        </div>

        {/* Footer */}
        <div className="mt-32 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-muted-foreground gap-4">
          <p>© 2024 ChronoLab. {t("footer.rights")}</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
          </div>
        </div>
      </div>
    </div>
  );
}
