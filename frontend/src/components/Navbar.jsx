import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Navbar({ brandName = "JAS", resumeUrl }) {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4"
    >
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/12 bg-[#08080A]/75 px-4 py-2.5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.65)] sm:px-6">
        <a
          href="#top"
          className="font-display text-xl tracking-wider text-white transition-colors hover:text-[#F5C451]"
        >
          {brandName}
          <span className="text-[#FF1E00]">.</span>
        </a>

        <div className="flex items-center gap-3.5 text-xs font-medium tracking-wide text-white/75 sm:gap-7 sm:text-sm">
          <a href="#about" className="transition-colors hover:text-white">
            About
          </a>
          <a href="#work" className="transition-colors hover:text-white">
            Work
          </a>
          <a href="#skills" className="transition-colors hover:text-white">
            Skills
          </a>
          <a href="#contact" className="transition-colors hover:text-white">
            Contact
          </a>
        </div>

        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Resume <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <a
            href="#contact"
            className="inline-flex items-center gap-1 rounded-full bg-[#FF1E00] px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Hire Me <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </nav>
    </motion.header>
  );
}