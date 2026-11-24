import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const NAV_ITEMS = [
  { id: "about", label: "ABOUT" },
  { id: "work", label: "WORK" },
  { id: "skills", label: "SKILLS" },
  { id: "contact", label: "CONTACT" },
];

const CIPHER_CHARS = "01XZ#@$%&*<>";

function CipherLabel({ text, isActive }) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);

  const runDecode = () => {
    let iteration = 0;
    clearInterval(frameRef.current);

    frameRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, idx) => {
            if (idx < iteration) return text[idx];
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join("")
      );

      iteration += 0.45;
      if (iteration >= text.length) {
        clearInterval(frameRef.current);
        setDisplay(text);
      }
    }, 24);
  };

  useEffect(() => {
    if (isActive) {
      runDecode();
    }
    return () => clearInterval(frameRef.current);
  }, [isActive, text]);

  return <span onMouseEnter={runDecode}>{display}</span>;
}

export default function Navbar({ brandName = "JAS", resumeUrl }) {
  const [activeSection, setActiveSection] = useState("top");

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const sectionIds = ["top", "about", "work", "skills", "contact"];

    const detectActiveSection = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY < viewportHeight * 0.35) {
        setActiveSection("top");
        return;
      }

      if (scrollY + viewportHeight >= docHeight - 60) {
        setActiveSection("contact");
        return;
      }

      const focusLine = viewportHeight * 0.42;
      let closestId = "top";
      let minDistance = Infinity;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        if (rect.top <= focusLine && rect.bottom >= focusLine) {
          closestId = id;
          break;
        }

        const dist = Math.min(
          Math.abs(rect.top - focusLine),
          Math.abs(rect.bottom - focusLine)
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestId = id;
        }
      }

      setActiveSection(closestId);
    };

    detectActiveSection();
    window.addEventListener("scroll", detectActiveSection, { passive: true });
    window.addEventListener("resize", detectActiveSection, { passive: true });
    return () => {
      window.removeEventListener("scroll", detectActiveSection);
      window.removeEventListener("resize", detectActiveSection);
    };
  }, []);

  const isContactActive = activeSection === "contact";

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-3.5 left-0 right-0 z-40 flex justify-center px-3 sm:top-4 sm:px-4"
    >
      <nav className="relative flex w-full max-w-5xl items-center justify-between overflow-hidden rounded-full border border-white/12 bg-[#07070A]/85 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:px-6">
        {/* Brand Logo with Terminal Status Dot */}
        <a
          href="#top"
          onClick={() => setActiveSection("top")}
          className="flex items-center gap-1.5 font-display text-lg tracking-wider text-white transition-colors hover:text-[#00FF66] sm:text-xl"
        >
          <span>
            {brandName}
            <span className="text-[#FF1E00]">.</span>
          </span>
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              activeSection === "top"
                ? "bg-[#00FF66] shadow-[0_0_8px_#00FF66]"
                : "bg-white/25"
            }`}
          />
        </a>

        {/* Minimal Hacker-Style Section Tracker */}
        <div className="flex items-center gap-3 font-mono-tech text-[11px] tracking-wider sm:gap-7 sm:text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`relative py-1 transition-all duration-200 ${
                  isActive
                    ? "font-bold text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.55)]"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center">
                  {isActive && (
                    <span className="mr-1 text-[#00FF66]/80">&gt;</span>
                  )}
                  <CipherLabel text={item.label} isActive={isActive} />
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.85, repeat: Infinity }}
                      className="ml-0.5 text-[#00FF66]"
                    >
                      _
                    </motion.span>
                  )}
                </span>

                {/* Razor-Thin Sliding Terminal Laser Underline */}
                {isActive && (
                  <motion.span
                    layoutId="hackerActiveLine"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 32,
                    }}
                    className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]"
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right Action Button */}
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 font-mono-tech text-[11px] font-bold text-black transition-transform hover:scale-105 active:scale-95 sm:px-3.5 sm:text-xs"
          >
            Resume <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <a
            href="#contact"
            onClick={() => setActiveSection("contact")}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 font-mono-tech text-[11px] font-bold transition-all hover:scale-105 active:scale-95 sm:px-3.5 sm:text-xs ${
              isContactActive
                ? "bg-[#00FF66] text-black shadow-[0_0_18px_rgba(0,255,102,0.5)]"
                : "bg-[#FF1E00] text-white"
            }`}
          >
            Hire Me <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}

        {/* Subtle Bottom Scroll Progress Thread */}
        <motion.div
          style={{ scaleX: smoothProgress, transformOrigin: "0% 50%" }}
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-[#FF1E00] via-[#F5C451] to-[#00FF66]"
        />
      </nav>
    </motion.header>
  );
}