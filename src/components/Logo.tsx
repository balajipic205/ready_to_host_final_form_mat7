import { motion } from "framer-motion";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg" ? "text-3xl md:text-5xl" : size === "sm" ? "text-base" : "text-xl md:text-2xl";
  // Logo placeholder: organisers will swap the inner div for an <img />.
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2.5 select-none"
    >
      <div
        className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-md border-2 border-dashed border-spider/70 bg-background flex items-center justify-center text-[9px] sm:text-[10px] font-mono-ui uppercase tracking-wider text-spider/80"
        aria-label="Make-a-Thon 7.0 logo placeholder"
        title="Replace this placeholder with your real logo image"
      >
        LOGO
        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-edge animate-pulse" />
      </div>
      <div className={`font-display font-bold tracking-tight ${sizeClass}`}>
        <span className="text-foreground">MAKE-A-THON </span>
        <span className="text-spider text-glow-spider">7.0</span>
      </div>
    </motion.div>
  );
}
