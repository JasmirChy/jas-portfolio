import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";

const FALLBACK_VISUALS = [
  {
    id: "v-1",
    title: "Crimson Architecture",
    caption: "Spatial UI & Brutalist Grid Exploration",
    tag: "DESIGN",
    image: null,
    accent_color: "#FF1E00",
  },
  {
    id: "v-2",
    title: "Cinema Amber Light",
    caption: "Motion Choreography & Shader Studies",
    tag: "MOTION",
    image: null,
    accent_color: "#F5C451",
  },
  {
    id: "v-3",
    title: "Obsidian Systems",
    caption: "Django + PostgreSQL Distributed Core",
    tag: "SYSTEMS",
    image: null,
    accent_color: "#D9381E",
  },
  {
    id: "v-4",
    title: "Dhangadhi Studio",
    caption: "Late-Night Builds & Creative Direction",
    tag: "STUDIO",
    image: null,
    accent_color: "#F5C451",
  },
];

function KineticImageCard({ item, index, smoothScroll, onSelect }) {
  const cardRef = useRef(null);

  // Cursor-tracking motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Cursor-driven 3D tilt + subtle Z-axis twist
  const cursorRotateX = useTransform(smoothY, [-0.5, 0.5], [13, -13]);
  const cursorRotateY = useTransform(smoothX, [-0.5, 0.5], [-13, 13]);
  const cursorRotateZ = useTransform(smoothX, [-0.5, 0.5], [-2.5, 2.5]);
  const glareX = useTransform(smoothX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ["0%", "100%"]);

  // Scroll-driven rotational angle & vertical parallax per card column
  const isEven = index % 2 === 0;
  const scrollRotate = useTransform(
    smoothScroll,
    [0, 0.5, 1],
    isEven ? [-5, 0, 4] : [5, 0, -4]
  );
  const scrollYOffset = useTransform(
    smoothScroll,
    [0, 1],
    isEven ? [35, -35] : [-25, 45]
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const accent = item.accent_color || "#F5C451";

  return (
    <motion.div
      style={{
        y: scrollYOffset,
        rotateZ: scrollRotate,
        perspective: 1100,
      }}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={isEven ? "sm:mt-0" : "sm:mt-14"}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(item)}
        style={{
          rotateX: cursorRotateX,
          rotateY: cursorRotateY,
          rotateZ: cursorRotateZ,
          transformStyle: "preserve-3d",
        }}
        whileTap={{ scale: 0.97 }}
        className="group relative cursor-pointer overflow-hidden rounded-[26px] border border-white/14 bg-[#101014] p-2.5 shadow-[0_25px_65px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-white/35"
      >
        {/* Dynamic Cursor Specular Sheen */}
        <motion.div
          aria-hidden="true"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22) 0%, transparent 62%)`
            ),
          }}
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Image Frame */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#16161C]">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div
              style={{
                background: `radial-gradient(circle at 25% 20%, ${accent} 0%, #141419 72%, #08080A 100%)`,
              }}
              className="flex h-full w-full flex-col justify-between p-6"
            >
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-white/75">
                FRAME // 0{index + 1}
              </span>
              <div className="my-auto flex items-center justify-center">
                <div className="h-24 w-24 rounded-full border border-white/25 backdrop-blur-md transition-transform duration-700 group-hover:rotate-90 group-hover:scale-110" />
              </div>
              <p className="font-display text-3xl uppercase leading-none tracking-tight text-white">
                {item.title}
              </p>
            </div>
          )}

          {/* Top Floating Tag Pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-3 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-white backdrop-blur-md">
            <span
              style={{ backgroundColor: accent }}
              className="h-1.5 w-1.5 rounded-full"
            />
            <span>{item.tag || "VISUAL"}</span>
          </div>

          {/* Corner '+' Crosshair Reticle on Hover */}
          <span className="pointer-events-none absolute top-3 right-3 z-10 font-mono-tech text-sm text-white/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            +
          </span>
        </div>

        {/* Bottom Metadata Caption */}
        <div className="mt-3 flex items-center justify-between px-2 pb-1">
          <div>
            <h3 className="font-syne text-base font-bold text-white sm:text-lg">
              {item.title}
            </h3>
            {item.caption && (
              <p className="line-clamp-1 text-xs text-white/55">
                {item.caption}
              </p>
            )}
          </div>
          <span className="font-mono-tech text-xs text-[#F5C451] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VisualGallery({ gallery = [] }) {
  const sectionRef = useRef(null);
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Section-wide cursor spotlight tracking
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const smoothPointerX = useSpring(pointerX, { stiffness: 120, damping: 25 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 120, damping: 25 });

  // Scroll-driven progress across the Visual Gallery section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Opposing rotational rings driven directly by user scroll
  const outerRingRotate = useTransform(smoothScroll, [0, 1], [0, 220]);
  const innerRingRotate = useTransform(smoothScroll, [0, 1], [0, -220]);
  const ringScale = useTransform(smoothScroll, [0, 0.5, 1], [0.85, 1.08, 0.9]);

  const handleSectionMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    pointerX.set(((e.clientX - rect.left) / rect.width) * 100);
    pointerY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const displayItems = gallery.length > 0 ? gallery : FALLBACK_VISUALS;
  const isDemo = gallery.length === 0;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32"
    >
      {/* Interactive Cursor-Following Ambient Spotlight */}
      <motion.div
        aria-hidden="true"
        style={{
          background: useTransform(
            [smoothPointerX, smoothPointerY],
            ([x, y]) =>
              `radial-gradient(620px circle at ${x}% ${y}%, rgba(255, 30, 0, 0.14), rgba(245, 196, 81, 0.06) 40%, transparent 72%)`
          ),
        }}
        className="pointer-events-none absolute inset-0"
      />

      {/* Scroll-Driven Counter-Rotating Orbital HUD Rings in Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{ rotate: outerRingRotate, scale: ringScale }}
          className="h-[340px] w-[340px] rounded-full border border-dashed border-white/[0.08] sm:h-[580px] sm:w-[580px]"
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#FF1E00]/60" />
          <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#F5C451]/60" />
        </motion.div>

        <motion.div
          style={{ rotate: innerRingRotate, scale: ringScale }}
          className="absolute h-[230px] w-[230px] rounded-full border border-white/[0.06] sm:h-[400px] sm:w-[400px]"
        >
          <span className="absolute top-1/2 -left-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#F5C451]/70" />
          <span className="absolute top-1/2 -right-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#FF1E00]/70" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.25em] text-[#F5C451]">
              KINETIC LENS // 0{displayItems.length}
            </p>
            <h2 className="font-syne mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Visual <span className="text-[#FF1E00]">Archive</span>
            </h2>
          </div>

          <p className="max-w-xs font-mono-tech text-xs text-white/55">
            Scroll to rotate orbital axis • Move cursor across frames for 3D depth.
          </p>
        </div>

        {isDemo && (
          <p className="mt-4 font-mono-tech text-[11px] text-[#F5C451]/80">
            Showing kinetic preview frames — upload photos under &ldquo;Gallery Images&rdquo; in Django Admin to feature your own shots.
          </p>
        )}

        {/* Staggered Responsive 3D Rotational Grid */}
        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {displayItems.map((item, idx) => (
            <KineticImageCard
              key={item.id}
              item={item}
              index={idx}
              smoothScroll={smoothScroll}
              onSelect={setActiveLightbox}
            />
          ))}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX INSPECTOR */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-[#0D0D11] p-4 shadow-2xl sm:p-6"
            >
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/75 text-sm text-white hover:border-[#FF1E00] hover:text-[#FF1E00]"
              >
                ✕
              </button>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141418]">
                {activeLightbox.image ? (
                  <img
                    src={activeLightbox.image}
                    alt={activeLightbox.title}
                    className="max-h-[68vh] w-full object-contain"
                  />
                ) : (
                  <div
                    style={{
                      background: `radial-gradient(circle at 30% 25%, ${
                        activeLightbox.accent_color || "#FF1E00"
                      } 0%, #111115 80%)`,
                    }}
                    className="flex aspect-[4/3] w-full items-end p-8"
                  >
                    <h3 className="font-display text-5xl uppercase text-white">
                      {activeLightbox.title}
                    </h3>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono-tech text-[10px] uppercase tracking-widest text-[#F5C451]">
                    {activeLightbox.tag || "VISUAL"}
                  </span>
                  <h3 className="font-syne text-xl font-bold text-white">
                    {activeLightbox.title}
                  </h3>
                  {activeLightbox.caption && (
                    <p className="mt-1 text-xs text-white/65 sm:text-sm">
                      {activeLightbox.caption}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}