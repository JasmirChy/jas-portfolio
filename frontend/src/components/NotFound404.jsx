import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FALLING_SHARDS = [
  { id: 1, x: -45, y: 260, rotate: -65, size: "w-8 h-10", clip: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" },
  { id: 2, x: 35, y: 310, rotate: 82, size: "w-10 h-8", clip: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" },
  { id: 3, x: -18, y: 340, rotate: -110, size: "w-7 h-9", clip: "polygon(50% 0%, 100% 100%, 0% 80%)" },
  { id: 4, x: 58, y: 280, rotate: 45, size: "w-9 h-7", clip: "polygon(0% 15%, 100% 0%, 85% 100%, 10% 90%)" },
  { id: 5, x: 5, y: 360, rotate: -35, size: "w-6 h-8", clip: "polygon(50% 0%, 95% 50%, 50% 100%, 5% 50%)" },
];

export default function NotFound404({ brandName = "JAS", onBackHome }) {
  const [shattered, setShattered] = useState(false);
  const [impactKey, setImpactKey] = useState(0);

  // Trigger initial glass impact shortly after page opens (matching p1.mp4)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShattered(true);
      setImpactKey((k) => k + 1);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const handleScreenTap = () => {
    setShattered(true);
    setImpactKey((k) => k + 1);
  };

  return (
    <div
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black p-2.5 sm:p-5 select-none"
    >
      {/* Rounded CRT Parchment Screen from p1.mp4 */}
      <motion.div
        key={impactKey}
        animate={
          shattered
            ? { x: [0, -6, 5, -3, 2, 0], y: [0, 4, -4, 2, 0] }
            : {}
        }
        transition={{ duration: 0.35 }}
        className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[26px] sm:rounded-[38px] bg-[#EAE2D0] p-6 text-[#1C1917] shadow-[inset_0_0_85px_rgba(0,0,0,0.42)] sm:p-12"
      >
        {/* Subtle Paper/CRT Grain */}
        <div className="film-grain pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply" />

        {/* Top Bar matching p1.mp4 */}
        <div className="relative z-20 flex items-center justify-between text-xs font-medium tracking-tight text-[#1C1917]/75 sm:text-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBackHome();
            }}
            className="font-syne font-bold transition-opacity hover:opacity-60"
          >
            {brandName}.
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBackHome();
              }}
              className="transition-opacity hover:opacity-60"
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBackHome();
              }}
              className="transition-opacity hover:opacity-60"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Center 404 + Radial Glass Fracture Overlay */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          {/* Radial Spiderweb Fracture Lines */}
          <AnimatePresence>
            {shattered && (
              <motion.svg
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                viewBox="0 0 800 500"
                className="pointer-events-none absolute h-[460px] w-[760px] sm:h-[580px] sm:w-[960px]"
              >
                {/* Radial Crack Spokes */}
                <g stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" fill="none">
                  <path d="M400 250 L290 140 L180 60 L70 10" />
                  <path d="M400 250 L510 130 L640 45 L750 0" />
                  <path d="M400 250 L560 220 L710 190 L800 175" />
                  <path d="M400 250 L540 340 L670 430 L770 500" />
                  <path d="M400 250 L410 380 L395 495" />
                  <path d="M400 250 L270 350 L140 440 L30 500" />
                  <path d="M400 250 L220 245 L90 265 L0 275" />
                  <path d="M400 250 L360 110 L345 0" />
                </g>
                {/* Concentric Spiderweb Fracture Rings */}
                <g stroke="rgba(120,113,108,0.35)" strokeWidth="1.1" fill="none">
                  <polygon points="355,205 445,200 470,250 440,305 355,300 325,250" />
                  <polygon points="315,165 485,155 535,245 480,340 315,335 265,248" />
                  <polygon points="255,115 545,105 615,240 540,385 255,380 185,252" />
                </g>
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Bold Vermilion 404 Display */}
          <div className="relative flex items-center justify-center">
            <span className="font-syne text-[6.5rem] leading-none font-extrabold tracking-tight text-[#D9381E] drop-shadow-[0_4px_18px_rgba(217,56,30,0.28)] sm:text-[11rem] md:text-[13rem]">
              404
            </span>

            {/* Punched-Out Dark Void Hole in Center of '0' */}
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
                  className="absolute h-20 w-16 bg-[#0B0B0D] shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_0_3px_rgba(255,255,255,0.65)] sm:h-32 sm:w-24 md:h-36 md:w-28"
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
                  className={`pointer-events-none absolute ${shard.size} border border-white/80 bg-gradient-to-br from-[#D9381E]/70 via-white/60 to-[#1C1917]/80 backdrop-blur-sm`}
                />
              ))}
          </div>

          {/* Caption & Return Link matching p1.mp4 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: shattered ? 1 : 0, y: shattered ? 0 : 10 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative z-20 mt-6 flex flex-col items-center text-center"
          >
            <p className="text-sm font-medium text-[#1C1917]/85 sm:text-base">
              This page fell through the screen.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBackHome();
              }}
              className="mt-3 border-b border-[#1C1917] pb-0.5 text-xs font-semibold text-[#1C1917] transition-opacity hover:opacity-60 sm:text-sm"
            >
              Back to the site
            </button>
          </motion.div>
        </div>

        {/* Bottom Subtle Hint */}
        <div className="relative z-20 text-center font-mono-tech text-[11px] text-[#1C1917]/45">
          TAP ANYWHERE ON GLASS TO TEST IMPACT
        </div>
      </motion.div>
    </div>
  );
}