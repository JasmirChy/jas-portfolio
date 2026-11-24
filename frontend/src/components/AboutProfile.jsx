import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";

export default function AboutProfile({ profile }) {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);

  const brandName = profile?.brand_name || "JAS";
  const fullName = profile?.full_name || "Jasmir Chaudhary";
  const bio =
    profile?.bio ||
    "Full-stack developer crafting bold, interactive web experiences with Python, Django, React, and PostgreSQL.";
  const location = profile?.location || "Dhangadhi, Nepal";
  const status = profile?.availability_status || "Open to new projects.";
  const avatarUrl = profile?.avatar || null;

  // 1. Scroll-driven progress across the Profile section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 24,
    restDelta: 0.001,
  });

  // Scroll-linked rotational motions for rings & portrait frame
  const outerRingRotate = useTransform(smoothScroll, [0, 1], [-45, 195]);
  const innerRingRotate = useTransform(smoothScroll, [0, 1], [60, -180]);
  const badgeOrbitRotate = useTransform(smoothScroll, [0, 1], [0, 360]);
  const scrollFrameTilt = useTransform(smoothScroll, [0, 0.5, 1], [-7, 0, 7]);
  const scrollFrameY = useTransform(smoothScroll, [0, 1], [35, -35]);

  // 2. Cursor-tracking 3D tilt & spotlight values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glarePercentX = useMotionValue(50);
  const glarePercentY = useMotionValue(50);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothGlareX = useSpring(glarePercentX, springConfig);
  const smoothGlareY = useSpring(glarePercentY, springConfig);

  const cursorRotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const cursorRotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const cursorRotateZ = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);

  const specularGradient = useMotionTemplate`radial-gradient(circle at ${smoothGlareX}% ${smoothGlareY}%, rgba(245, 196, 81, 0.28) 0%, rgba(255, 30, 0, 0.12) 38%, transparent 68%)`;

  const handleMouseMove = (e) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    mouseX.set(relX - 0.5);
    mouseY.set(relY - 0.5);
    glarePercentX.set(relX * 100);
    glarePercentY.set(relY * 100);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    glarePercentX.set(50);
    glarePercentY.set(50);
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32"
    >
      {/* Subtle Ambient Crimson & Amber Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/4 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF1E00]/[0.12] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
          {/* LEFT COLUMN: Rotational & Cursor-Reactive Profile Image Stage */}
          <div className="relative flex items-center justify-center lg:col-span-6">
            {/* Outer Scroll-Rotating Dashed Orbital Ring */}
            <motion.div
              aria-hidden="true"
              style={{ rotate: outerRingRotate }}
              className="pointer-events-none absolute h-[320px] w-[320px] rounded-full border border-dashed border-[#F5C451]/30 sm:h-[430px] sm:w-[430px]"
            >
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#FF1E00] shadow-[0_0_12px_#FF1E00]" />
              <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#F5C451]" />
            </motion.div>

            {/* Inner Counter-Rotating Ring */}
            <motion.div
              aria-hidden="true"
              style={{ rotate: innerRingRotate }}
              className="pointer-events-none absolute h-[270px] w-[270px] rounded-full border border-white/12 sm:h-[365px] sm:w-[365px]"
            >
              <span className="absolute top-1/2 -left-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#F5C451]" />
              <span className="absolute top-1/2 -right-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#FF1E00]" />
            </motion.div>

            {/* Scroll-Driven Parallax & Tilt Wrapper */}
            <motion.div
              style={{
                y: scrollFrameY,
                rotateZ: scrollFrameTilt,
                perspective: 1100,
              }}
              className="relative z-10 w-full max-w-[270px] sm:max-w-[320px]"
            >
              {/* Cursor-Tracking 3D Interactive Portrait Card */}
              <motion.div
                ref={frameRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX: cursorRotateX,
                  rotateY: cursorRotateY,
                  rotateZ: cursorRotateZ,
                  transformStyle: "preserve-3d",
                }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative cursor-pointer rounded-[28px] border border-white/18 bg-[#101015] p-2.5 shadow-[0_30px_75px_rgba(0,0,0,0.9)]"
              >
                {/* 4 Corner Crosshair '+' Reticles */}
                <span className="pointer-events-none absolute -top-3 -left-3 font-mono-tech text-xs text-[#F5C451]">
                  +
                </span>
                <span className="pointer-events-none absolute -top-3 -right-3 font-mono-tech text-xs text-[#F5C451]">
                  +
                </span>
                <span className="pointer-events-none absolute -bottom-3 -left-3 font-mono-tech text-xs text-[#F5C451]">
                  +
                </span>
                <span className="pointer-events-none absolute -bottom-3 -right-3 font-mono-tech text-xs text-[#F5C451]">
                  +
                </span>

                {/* Cursor Specular Glare Overlay */}
                <motion.div
                  aria-hidden="true"
                  style={{ background: specularGradient }}
                  className="pointer-events-none absolute inset-0 z-20 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                {/* Profile Image Frame */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-[#16161D]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-between bg-gradient-to-br from-[#FF1E00] via-[#18181F] to-[#08080A] p-6 text-center">
                      <span className="font-mono-tech text-[10px] uppercase tracking-widest text-white/75">
                        PORTRAIT SLOT
                      </span>
                      <span className="font-display text-7xl uppercase text-white/90">
                        {brandName}
                      </span>
                      <span className="font-mono-tech text-[10px] text-white/65">
                        Upload avatar in Django Admin
                      </span>
                    </div>
                  )}

                  {/* Bottom Subtle Gradient Overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-wider text-white/85">
                    <span>{brandName} // IDENTITY</span>
                    <span className="rounded-full bg-[#FF1E00] px-2 py-0.5 text-[9px] font-bold text-white">
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Bottom Card Telemetry Strip */}
                <div className="mt-2.5 flex items-center justify-between px-2 pb-1 font-mono-tech text-[11px] text-white/60">
                  <span>{location}</span>
                  <span className="text-[#F5C451]">3D GYRO</span>
                </div>
              </motion.div>

              {/* Orbiting Rotating Stamp Badge */}
              <motion.div
                style={{ rotate: badgeOrbitRotate }}
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -bottom-5 z-20 flex h-20 w-20 items-center justify-center rounded-full border border-[#F5C451]/40 bg-[#08080A]/90 shadow-xl backdrop-blur-md sm:-right-7 sm:-bottom-7 sm:h-24 sm:w-24"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full p-1.5">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                    />
                  </defs>
                  <text
                    fill="#F5C451"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="2.4"
                  >
                    <textPath href="#circlePath">
                      • {brandName} • FULL-STACK DEV
                    </textPath>
                  </text>
                </svg>
                <span className="absolute h-2.5 w-2.5 rounded-full bg-[#FF1E00]" />
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Identity Story, Highlights & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <p className="font-mono-tech text-xs uppercase tracking-[0.25em] text-[#F5C451]">
              ABOUT ME // PROFILE
            </p>

            <h2 className="font-syne mt-3 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              Behind the <span className="text-[#FF1E00]">Code</span> &{" "}
              <span className="text-[#F5C451]">Design.</span>
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-white/75 sm:text-base">
              {bio}
            </p>

            {/* Clean Telemetry Cards */}
            <div className="mt-7 grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-mono-tech text-[10px] uppercase tracking-widest text-white/45">
                  BASE LOCATION
                </p>
                <p className="font-syne mt-1 text-sm font-bold text-white sm:text-base">
                  {location}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-mono-tech text-[10px] uppercase tracking-widest text-white/45">
                  CURRENT STATUS
                </p>
                <p className="font-syne mt-1 text-sm font-bold text-emerald-400 sm:text-base">
                  {status}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5C451] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 sm:text-sm"
              >
                See My Projects →
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-white sm:text-sm"
              >
                Get in Touch
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}