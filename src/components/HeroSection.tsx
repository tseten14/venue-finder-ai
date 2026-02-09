import { Satellite, MapPin, Shield, Activity } from "lucide-react";
import heroImage from "@/assets/satellite-hero.jpg";

const HeroSection = ({ onStartAnalysis }: { onStartAnalysis: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background satellite image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Satellite imagery"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 grid-overlay opacity-40" />
      </div>

      {/* Scan line animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-1/3 scanline animate-scan" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-fade-in-up">
          <Satellite className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-primary tracking-wider uppercase">
            GeoAI Entrance Detection System
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <span className="text-foreground">Locate Venue</span>
          <br />
          <span className="text-primary text-glow">Entrances</span>
          <br />
          <span className="text-foreground">From Space</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          ML-powered satellite imagery analysis to detect and classify entrance
          points of stadiums, hospitals, airports, and large-scale venues.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={onStartAnalysis}
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg box-glow hover:brightness-110 transition-all duration-300 flex items-center gap-2 justify-center"
          >
            <Activity className="w-5 h-5" />
            Start Analysis
          </button>
          <button className="px-8 py-4 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition-all duration-300 flex items-center gap-2 justify-center">
            <Shield className="w-5 h-5" />
            View Documentation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {[
            { label: "Venues Scanned", value: "12,847" },
            { label: "Accuracy Rate", value: "94.7%" },
            { label: "Entrances Found", value: "38,291" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-mono text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-primary/30" />

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <MapPin className="w-4 h-4 text-primary animate-bounce" />
        <span className="text-xs text-muted-foreground font-mono">SCROLL</span>
      </div>
    </section>
  );
};

export default HeroSection;
