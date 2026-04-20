import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Youtube, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "https://make-a-thon-7.in/#about" },
    { name: "Timeline", href: "https://make-a-thon-7.in/#timeline" },
    { name: "Tracks & PSs", href: "https://make-a-thon-7.in/#problems" },
    { name: "Gallery", href: "https://make-a-thon-7.in/#gallery" },
    { name: "FAQs", href: "https://make-a-thon-7.in/#faq" },
  ];

  const coordinators = [
    { name: "Roshan", phone: "9150537446" },
    { name: "Adarsh", phone: "8754536643" },
    { name: "Yaaminy", phone: "9176410313" },
    { name: "Deon", phone: "7338875560" },
    { name: "Navedh", phone: "9345228511" },
    { name: "Balaji", phone: "9361661642" },
  ];

  return (
    <footer className="mt-20 border-t border-spider/20 bg-surface/50 pt-12 pb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-spider/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="mx-auto max-w-6xl px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Map */}
          <div className="space-y-4">
            <Link to="/" className="inline-block transform hover:scale-105 transition-transform">
              <span className="font-display text-xl font-bold tracking-tight">
                MAKE-A-THON <span className="text-primary text-glow-cyan">7.0</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Organized by Department of ECE, SVCE in association with RACE, IETE-SF and ECEA.
            </p>
            <a 
              href="https://maps.app.goo.gl/SVCE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono-ui text-cyan-edge hover:text-white transition-colors group"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Sri Venkateswara College of Engineering (SVCE)</span>
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all translate-y-0.5" />
            </a>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-amber mb-5 border-l-2 border-spider pl-3">
              Quick Links
            </h4>
            <ul className="grid grid-cols-1 gap-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-cyan-edge transition-colors flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-spider/40" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Student Coordinators */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-amber mb-5 border-l-2 border-spider pl-3">
              Student Coordinators
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {coordinators.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm border-b border-border/20 pb-1">
                  <span className="text-muted-foreground">{c.name}</span>
                  <a 
                    href={`tel:${c.phone}`} 
                    className="text-[12px] font-mono-ui font-semibold text-[#ff3366] hover:text-white transition-colors"
                  >
                    +91 {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Reach Us */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-amber mb-5 border-l-2 border-spider pl-3">
              Reach Us
            </h4>
            <div className="space-y-4">
              <a 
                href="mailto:makeathon@svce.ac.in" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-cyan-edge transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-spider/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span>makeathon@svce.ac.in</span>
              </a>
              <div className="flex items-center gap-4 pt-2">
                <a 
                  href="https://instagram.com/makeathon_svce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:scale-110 transition-transform shadow-lg shadow-pink-500/10"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="https://linkedin.com/company/makeathon-svce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-[#0077b5] text-white hover:scale-110 transition-transform shadow-lg shadow-blue-500/10"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a 
                  href="https://youtube.com/@makeathon_svce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-[#ff0000] text-white hover:scale-110 transition-transform shadow-lg shadow-red-500/10"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-spider/10 flex flex-col items-center text-center">
          <div className="font-display text-sm italic text-muted-foreground max-w-lg mb-6">
            "With great power comes great innovation."
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-mono-ui text-muted-foreground/60 uppercase tracking-widest">
            <span>© {currentYear} Make-a-Thon 7.0</span>
            <span className="hidden md:inline">•</span>
            <span>SVCE ECE Department</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
