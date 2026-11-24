import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ brandName = "JAS", fullName = "Jasmir Chaudhary", onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onCompleteRef.current) onCompleteRef.current();
          }, 400);
          return 100;
        }
        const step = Math.floor(Math.random() * 14) + 10;
        return Math.min(prev + step, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="jas-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: "blur(12px)",
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-2 sm:p-4"
        >
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[34px] border border-white/10 bg-[#0B0B0D] p-6 sm:p-12 shadow-[inset_0_0_90px_rgba(0,0,0,0.95)]">
            <motion.div
              animate={{ opacity: [0.45, 0.25, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="film-grain pointer-events-none absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: progress / 160, scale: 1 }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,196,81,0.14)_0%,rgba(8,8,10,0.92)_70%)]"
            />

            <div className="relative z-10 flex items-center justify-between font-mono-tech text-xs uppercase tracking-widest text-white/50">
              <span>SYS // INIT</span>
              <span>{String(progress).padStart(3, "0")}%</span>
            </div>

            <div className="relative z-10 my-auto">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-mono-tech mb-2 text-xs uppercase tracking-[0.28em] text-[#F5C451]"
              >
                {brandName} ORIGINALS
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, filter: "blur(18px)", letterSpacing: "-0.06em" }}
                animate={{
                  opacity: 1,
                  filter: progress > 45 ? "blur(0px)" : "blur(6px)",
                  letterSpacing: "-0.02em",
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-syne text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl"
              >
                {fullName}
              </motion.h1>
            </div>

            <div className="relative z-10">
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF1E00] via-[#F5C451] to-white"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                />
              </div>
              <div className="mt-3 flex justify-between font-mono-tech text-[11px] text-white/40">
                <span>LOADING EXPERIENCE</span>
                <span>DHANGADHI • NP</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}