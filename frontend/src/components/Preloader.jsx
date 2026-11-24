import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FALLING_SHARDS = [
  { id: 1, x: -55, y: 270, rotate: -68, size: "w-8 h-10", clip: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" },
  { id: 2, x: 42, y: 315, rotate: 85, size: "w-10 h-8", clip: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" },
  { id: 3, x: -22, y: 345, rotate: -112, size: "w-7 h-9", clip: "polygon(50% 0%, 100% 100%, 0% 80%)" },
  { id: 4, x: 64, y: 285, rotate: 48, size: "w-9 h-7", clip: "polygon(0% 15%, 100% 0%, 85% 100%, 10% 90%)" },
  { id: 5, x: 8, y: 365, rotate: -38, size: "w-6 h-8", clip: "polygon(50% 0%, 95% 50%, 50% 100%, 5% 50%)" },
  { id: 6, x: -75, y: 240, rotate: 95, size: "w-7 h-7", clip: "polygon(15% 0%, 100% 25%, 75% 100%, 0% 75%)" },
];

const WELCOME_ROLES = [
  "FULL-STACK ARCHITECT",
  "PYTHON & DJANGO ENGINEER",
  "REACT & MOTION CRAFTSMAN",
  "DIGITAL PRODUCT DESIGNER",
];

export default function Preloader({
  brandName = "JAS",
  fullName = "Jasmir Chaudhary",
  onComplete,
}) {
  const [progress, setProgress] = useState(0);
  const [shattered, setShattered] = useState(false);
  const [impactKey, setImpactKey] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finishWelcome = () => {
    setIsVisible(false);
    if (onCompleteRef.current) onCompleteRef.current();
  };

  // Cycle modern role subtitles
  useEffect(() => {
    const roleTimer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % WELCOME_ROLES.length);
    }, 850);
    return () => clearInterval(roleTimer);
  }, []);

  // Charge progress -> trigger glass shatter at 65% -> enter portfolio at 100%
  useEffect(() => {
    let hasShattered = false;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 5, 100);

        if (next >= 65 && !hasShattered) {
          hasShattered = true;
          setShattered(true);
          setImpactKey((k) => k + 1);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            finishWelcome();
          }, 950);
        }

        return next;
      });
    }, 135);

    return () => clearInterval(interval);
  }, []);

  const handleGlassTap = () => {
    setShattered(true);
    setImpactKey((k) => k + 1);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="jas-welcome-shatter"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.16,
            filter: "blur(10px)",
            transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
          }}
          onClick={handleGlassTap}
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black p-2.5 select-none sm:p-5"
        >
          {/* Rounded CRT Parchment Screen matching image_bde154.png */}
          <motion.div
            key={impactKey}
            animate={
              shattered
                ? { x: [0, -7, 6, -4, 2, 0], y: [0, 5, -4, 2, 0] }
                : {}
            }
            transition={{ duration: 0.35 }}
            className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[26px] bg-[#EAE2D0] p-6 text-[#1C1917] shadow-[inset_0_0_85px_rgba(0,0,0,0.42)] sm:rounded-[38px] sm:p-12"
          >
            {/* Subtle Paper/CRT Grain */}
            <div className="film-grain pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply" />

            {/* Top Bar (Exact layout from image_bde154.png) */}
            <div className="relative z-20 flex items-center justify-between text-xs font-medium tracking-tight text-[#1C1917]/80 sm:text-sm">
              <span className="font-syne font-extrabold tracking-tight text-[#1C1917]">
                {brandName}.
              </span>

              <div className="flex items-center gap-5 sm:gap-7">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    finishWelcome();
                  }}
                  className="transition-opacity hover:opacity-55"
                >
                  Portfolio
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    finishWelcome();
                  }}
                  className="rounded-full border border-[#1C1917]/25 px-3.5 py-1 text-xs font-semibold transition-all hover:bg-[#1C1917] hover:text-[#EAE2D0]"
                >
                  Enter →
                </button>
              </div>
            </div>

            {/* Centerpiece: Modern Animated Welcome Texts + Shattered Glass Effect */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
              {/* Top Masked Welcome Greeting */}
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="font-mono-tech text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1C1917]/65 sm:text-xs"
                >
                  WELCOME TO THE STUDIO OF {fullName.toUpperCase()}
                </motion.p>
              </div>

              {/* Animated Role Ticker */}
              <div className="mt-2 h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={roleIndex}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="font-syne text-xs font-bold tracking-wide text-[#D9381E] sm:text-sm"
                  >
                    {WELCOME_ROLES[roleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Radial Spiderweb Glass Fracture Lines (image_bde154.png) */}
              <AnimatePresence>
                {shattered && (
                  <motion.svg
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 0.9, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    viewBox="0 0 800 500"
                    className="pointer-events-none absolute h-[460px] w-[760px] sm:h-[580px] sm:w-[960px]"
                  >
                    <g stroke="rgba(255,255,255,0.88)" strokeWidth="1.5" fill="none">
                      <path d="M400 250 L290 140 L180 60 L70 10" />
                      <path d="M400 250 L510 130 L640 45 L750 0" />
                      <path d="M400 250 L560 220 L710 190 L800 175" />
                      <path d="M400 250 L540 340 L670 430 L770 500" />
                      <path d="M400 250 L410 380 L395 495" />
                      <path d="M400 250 L270 350 L140 440 L30 500" />
                      <path d="M400 250 L220 245 L90 265 L0 275" />
                      <path d="M400 250 L360 110 L345 0" />
                    </g>
                    <g stroke="rgba(120,113,108,0.38)" strokeWidth="1.15" fill="none">
                      <polygon points="355,205 445,200 470,250 440,305 355,300 325,250" />
                      <polygon points="315,165 485,155 535,245 480,340 315,335 265,248" />
                      <polygon points="255,115 545,105 615,240 540,385 255,380 185,252" />
                    </g>
                  </motion.svg>
                )}
              </AnimatePresence>

              {/* Giant Vermilion Brand Display + Center Breakthrough Portal */}
              <div className="relative my-3 flex items-center justify-center sm:my-4">
                <motion.h1
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="font-syne text-[5.8rem] leading-none font-extrabold uppercase tracking-tight text-[#D9381E] drop-shadow-[0_6px_22px_rgba(217,56,30,0.3)] sm:text-[10.5rem] md:text-[12.5rem]"
                >
                  {brandName}
                </motion.h1>

                {/* Punched-Out Dark Void Hole in Center (image_bde154.png) */}
                <AnimatePresence>
                  {shattered && (
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 20 }}
                      style={{
                        clipPath:
                          "polygon(48% 2%, 78% 10%, 96% 36%, 92% 72%, 72% 96%, 36% 98%, 10% 78%, 4% 42%, 22% 12%)",
                      }}
                      className="absolute h-20 w-16 bg-[#08080A] shadow-[inset_0_0_22px_rgba(0,0,0,1),0_0_0_3px_rgba(255,255,255,0.75)] sm:h-32 sm:w-24 md:h-36 md:w-28"
                    />
                  )}
                </AnimatePresence>

                {/* Falling Glass Shards */}
                {shattered &&
                  FALLING_SHARDS.map((shard) => (
                    <motion.div
                      key={`${impactKey}-${shard.id}`}
                      initial={{ opacity: 0.95, x: 0, y: 0, rotate: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        x: shard.x,
                        y: shard.y,
                        rotate: shard.rotate,
                        scale: 0.65,
                      }}
                      transition={{ duration: 1.15, ease: [0.32, 0, 0.67, 0] }}
                      style={{ clipPath: shard.clip }}
                      className={`pointer-events-none absolute ${shard.size} border border-white/85 bg-gradient-to-br from-[#D9381E]/75 via-white/65 to-[#1C1917]/80 backdrop-blur-sm`}
                    />
                  ))}
              </div>

              {/* Modern Tagline & Action Link beneath Glass */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="relative z-20 mt-2 flex flex-col items-center"
              >
                <p className="max-w-md text-sm font-medium text-[#1C1917]/85 sm:text-base">
                  {shattered
                    ? "Breaking through ordinary digital experiences."
                    : "Crafting bold, interactive web products."}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    finishWelcome();
                  }}
                  className="mt-3 border-b border-[#1C1917] pb-0.5 text-xs font-bold text-[#1C1917] transition-opacity hover:opacity-60 sm:text-sm"
                >
                  Enter the portfolio
                </button>
              </motion.div>
            </div>

            {/* Bottom Progress Line & Telemetry */}
            <div className="relative z-20">
              <div className="mx-auto mb-2.5 h-[2px] w-full max-w-md overflow-hidden rounded-full bg-[#1C1917]/15">
                <motion.div
                  className="h-full bg-[#D9381E]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                />
              </div>

              <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-widest text-[#1C1917]/50 sm:text-[11px]">
                <span>TAP GLASS TO SHATTER</span>
                <span>{String(progress).padStart(3, "0")}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}