import { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";

const DEMO_SKILLS = [
  { id: "s1", name: "Python", category: "backend", category_display: "Backend", icon_image: null },
  { id: "s2", name: "Django", category: "backend", category_display: "Backend", icon_image: null },
  { id: "s3", name: "React", category: "frontend", category_display: "Frontend", icon_image: null },
  { id: "s4", name: "JavaScript", category: "frontend", category_display: "Frontend", icon_image: null },
  { id: "s5", name: "PostgreSQL", category: "database", category_display: "Database", icon_image: null },
  { id: "s6", name: "REST APIs", category: "backend", category_display: "Backend", icon_image: null },
  { id: "s7", name: "Tailwind CSS", category: "frontend", category_display: "Frontend", icon_image: null },
  { id: "s8", name: "Git & GitHub", category: "tools", category_display: "Tools & DevOps", icon_image: null },
];

const CATEGORIES = [
  { id: "all", label: "ALL_NODES", code: "0xFF" },
  { id: "backend", label: "BACKEND", code: "SYS.BE" },
  { id: "frontend", label: "FRONTEND", code: "SYS.FE" },
  { id: "database", label: "DATABASE", code: "SYS.DB" },
  { id: "tools", label: "DEVOPS", code: "SYS.OP" },
];

const LAYER_CODES = {
  backend: "SYS.BE",
  frontend: "SYS.FE",
  database: "SYS.DB",
  tools: "SYS.OP",
};

function getNodeCoords(index, total, isCompact) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const isOuterRing = total > 6 && index % 2 === 1;

  // Responsive orbital radii so nodes and SVG traces stay perfectly aligned on mobile & desktop
  const radiusX = isCompact
    ? isOuterRing
      ? 36
      : 33
    : isOuterRing
    ? 40
    : 31;
  const radiusY = isCompact
    ? isOuterRing
      ? 37
      : 33
    : isOuterRing
    ? 39
    : 30;

  return {
    x: 50 + Math.cos(angle) * radiusX,
    y: 50 + Math.sin(angle) * radiusY,
    angle,
  };
}

function buildCurvedTrace(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const ctrlX = midX - dy * 0.16;
  const ctrlY = midY + dx * 0.16;
  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
}

function TechnicalChipNode({
  skill,
  index,
  total,
  isCompact,
  isActive,
  isSynergy,
  isDimmed,
  onActivate,
}) {
  const chipRef = useRef(null);
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const smoothPullX = useSpring(pullX, { stiffness: 280, damping: 20, mass: 0.4 });
  const smoothPullY = useSpring(pullY, { stiffness: 280, damping: 20, mass: 0.4 });

  const { x, y } = getNodeCoords(index, total, isCompact);
  const hexAddr = `0x${String(index + 1).padStart(2, "0")}`;
  const layerCode = LAYER_CODES[skill.category] || "SYS.IO";

  const handlePointerMove = (e) => {
    if (!chipRef.current) return;
    const rect = chipRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const strength = isCompact ? 0.2 : 0.32;
    pullX.set((e.clientX - cx) * strength);
    pullY.set((e.clientY - cy) * strength);
  };

  const handlePointerLeave = () => {
    pullX.set(0);
    pullY.set(0);
  };

  return (
    <motion.div
      style={{
        left: `${x}%`,
        top: `${y}%`,
        x: smoothPullX,
        y: smoothPullY,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
        delay: index * 0.045,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <motion.button
        ref={chipRef}
        type="button"
        onMouseEnter={() => onActivate(skill)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => onActivate(skill)}
        animate={{
          y: [0, index % 2 === 0 ? -4 : 4, 0],
          scale: isDimmed ? 0.82 : isActive ? 1.1 : isSynergy ? 1.03 : 1,
          opacity: isDimmed ? 0.22 : 1,
          filter: isDimmed ? "blur(1.5px)" : "blur(0px)",
        }}
        transition={{
          y: {
            duration: 3.6 + (index % 3) * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          scale: { type: "spring", stiffness: 320, damping: 24 },
          opacity: { duration: 0.25 },
        }}
        className={`group relative flex items-center gap-1.5 sm:gap-3 rounded-lg sm:rounded-xl border px-2 py-1.5 sm:px-3.5 sm:py-2.5 text-left backdrop-blur-xl transition-colors duration-300 cursor-pointer ${
          isActive
            ? "border-[#F5C451] bg-[#14141B]/95 shadow-[0_0_30px_rgba(245,196,81,0.34),inset_0_0_14px_rgba(255,30,0,0.2)]"
            : isSynergy
            ? "border-[#FF1E00]/55 bg-[#111117]/90 shadow-[0_0_18px_rgba(255,30,0,0.2)]"
            : "border-white/12 bg-[#0B0B10]/88 hover:border-white/35"
        }`}
      >
        {/* Corner Precision Micro-Ticks */}
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 sm:top-1 sm:left-1 h-1 w-1 sm:h-1.5 sm:w-1.5 border-t border-l transition-colors ${
            isActive ? "border-[#FF1E00]" : "border-white/25"
          }`}
        />
        <span
          className={`pointer-events-none absolute right-0.5 bottom-0.5 sm:right-1 sm:bottom-1 h-1 w-1 sm:h-1.5 sm:w-1.5 border-r border-b transition-colors ${
            isActive ? "border-[#F5C451]" : "border-white/25"
          }`}
        />

        {/* Module Icon Housing */}
        <div
          className={`relative flex h-6 w-6 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-md sm:rounded-lg border transition-colors ${
            isActive
              ? "border-[#F5C451]/70 bg-[#F5C451]/15"
              : isSynergy
              ? "border-[#FF1E00]/50 bg-[#FF1E00]/10"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          {skill.icon_image ? (
            <img
              src={skill.icon_image}
              alt={skill.name}
              className="h-3.5 w-3.5 sm:h-5 sm:w-5 object-contain"
            />
          ) : (
            <span className="font-display text-[11px] sm:text-sm tracking-wider text-[#F5C451]">
              {skill.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Technical Chip Metadata */}
        <div className="pr-0.5 sm:pr-1">
          <div className="flex items-center gap-1 font-mono-tech text-[7px] sm:text-[9px] tracking-widest text-white/45">
            <span className={isActive ? "text-[#F5C451]" : ""}>{hexAddr}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{layerCode}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 sm:gap-2">
            <span
              className={`font-syne text-[10px] sm:text-xs lg:text-sm font-bold tracking-tight whitespace-nowrap ${
                isActive ? "text-white" : "text-white/85 group-hover:text-white"
              }`}
            >
              {skill.name}
            </span>
            <span
              className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full transition-all ${
                isActive
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : isSynergy
                  ? "bg-[#FF1E00]"
                  : "bg-white/20"
              }`}
            />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

export default function SkillsSection({ skills = [] }) {
  const sourceSkills = skills.length > 0 ? skills : DEMO_SKILLS;
  const isDemoMode = skills.length === 0;

  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSkill, setActiveSkill] = useState(sourceSkills[0]);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [pulseWaveKey, setPulseWaveKey] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ x: 240, y: 240, active: false });

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (sourceSkills.length > 0) {
      setActiveSkill(sourceSkills[0]);
    }
  }, [skills.length]);

  const matchingSkills = useMemo(() => {
    if (selectedCategory === "all") return sourceSkills;
    const filtered = sourceSkills.filter((s) => s.category === selectedCategory);
    return filtered.length > 0 ? filtered : sourceSkills;
  }, [sourceSkills, selectedCategory]);

  // Auto-cycle nodes when idle
  useEffect(() => {
    if (isUserInteracting || matchingSkills.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSkill((prev) => {
        const currentIdx = matchingSkills.findIndex((s) => s.id === prev?.id);
        const nextIdx = (currentIdx + 1) % matchingSkills.length;
        return matchingSkills[nextIdx];
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isUserInteracting, matchingSkills]);

  useEffect(() => {
    if (!isUserInteracting) return;
    const timeout = setTimeout(() => setIsUserInteracting(false), 4500);
    return () => clearTimeout(timeout);
  }, [isUserInteracting, activeSkill]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPulseWaveKey((k) => k + 1);
    const nextGroup =
      catId === "all"
        ? sourceSkills
        : sourceSkills.filter((s) => s.category === catId);
    if (nextGroup.length > 0) {
      setActiveSkill(nextGroup[0]);
    }
  };

  const handleSkillActivate = (skill) => {
    setIsUserInteracting(true);
    setActiveSkill(skill);
  };

  const handleStagePointerMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setCursorCoords({
      x: Math.max(0, Math.round(e.clientX - rect.left)),
      y: Math.max(0, Math.round(e.clientY - rect.top)),
      active: true,
    });
  };

  const handleStagePointerLeave = () => {
    setCursorCoords((prev) => ({ ...prev, active: false }));
  };

  // Scroll-driven gyroscopic rotation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const gyroRotateCW = useTransform(smoothScroll, [0, 1], [0, 260]);
  const gyroRotateCCW = useTransform(smoothScroll, [0, 1], [0, -260]);

  const currentSkill = activeSkill || sourceSkills[0];
  const activeIndex = sourceSkills.findIndex((s) => s.id === currentSkill?.id);

  // Compute 2 synergy peer nodes for architectural mesh visualization
  const synergyIndices = useMemo(() => {
    if (sourceSkills.length <= 1 || activeIndex < 0) return [];
    const peers = [];
    sourceSkills.forEach((s, idx) => {
      if (idx !== activeIndex && s.category !== currentSkill?.category && peers.length < 2) {
        peers.push(idx);
      }
    });
    if (peers.length === 0 && sourceSkills.length > 1) {
      peers.push((activeIndex + 1) % sourceSkills.length);
    }
    return peers;
  }, [sourceSkills, activeIndex, currentSkill]);

  const activeCoords =
    activeIndex >= 0
      ? getNodeCoords(activeIndex, sourceSkills.length, isCompact)
      : { x: 50, y: 50 };

  const activeCurvePath = buildCurvedTrace(
    activeCoords.x,
    activeCoords.y,
    50,
    50
  );

  const activeHex = `0x${String(Math.max(activeIndex + 1, 1)).padStart(2, "0")}`;
  const activeLayer = LAYER_CODES[currentSkill?.category] || "SYS.IO";

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 py-20 sm:py-32"
    >
      {/* Precision Blueprint Grid Backdrop */}
      <div
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_75%_70%_at_50%_50%,#000_45%,transparent_100%)]"
      />

      {/* Ambient Quantum Core Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[340px] w-[340px] sm:h-[540px] sm:w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,30,0,0.14)_0%,rgba(245,196,81,0.05)_45%,transparent_72%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
        {/* Top Section Header & Protocol Switcher */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#F5C451]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#FF1E00]" />
              <span>ARCHITECTURE_TOPOLOGY // 0{sourceSkills.length} MODULES</span>
            </div>
            <h2 className="font-syne mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Quantum <span className="text-[#FF1E00]">Stack</span> Schematic
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2.5 py-1.5 sm:px-3 font-mono-tech text-[10px] sm:text-[11px] transition-all cursor-pointer ${
                    active
                      ? "border-[#F5C451] bg-[#F5C451] font-bold text-black shadow-[0_0_24px_rgba(245,196,81,0.3)]"
                      : "border-white/12 bg-white/[0.03] text-white/65 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-black/70" : "text-[#FF1E00]"}>
                    [{cat.code}]
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isDemoMode && (
          <p className="mt-3 font-mono-tech text-[10px] sm:text-[11px] text-[#F5C451]/80">
            SIMULATION_MODE // Add or remove stack modules with custom icons in Django Admin to auto-wire live nodes.
          </p>
        )}

        {/* =====================================================================
            UNIFIED 360° QUANTUM SCHEMATIC VIEWPORT (Mobile, Tablet & Desktop)
           ===================================================================== */}
        <div
          ref={stageRef}
          onPointerMove={handleStagePointerMove}
          onPointerLeave={handleStagePointerLeave}
          className="relative mx-auto mt-8 sm:mt-10 flex h-[450px] sm:h-[550px] md:h-[600px] w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#09090D]/85 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] backdrop-blur-md touch-pan-y"
        >
          {/* Corner Calibration Brackets */}
          <span className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 h-3.5 w-3.5 sm:h-4 sm:w-4 border-t-2 border-l-2 border-[#F5C451]/60" />
          <span className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4 h-3.5 w-3.5 sm:h-4 sm:w-4 border-t-2 border-r-2 border-[#F5C451]/60" />
          <span className="pointer-events-none absolute bottom-3 left-3 sm:bottom-4 sm:left-4 h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-l-2 border-[#FF1E00]/60" />
          <span className="pointer-events-none absolute bottom-3 right-3 sm:bottom-4 sm:right-4 h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-r-2 border-[#FF1E00]/60" />

          {/* Top-Left Live Pointer Coordinate HUD */}
          <div className="pointer-events-none absolute top-3.5 left-8 sm:top-4 sm:left-10 z-30 flex items-center gap-2.5 sm:gap-4 font-mono-tech text-[9px] sm:text-[10px] tracking-widest text-white/45">
            <span>
              AXIS // X:{String(cursorCoords.x).padStart(3, "0")} Y:
              {String(cursorCoords.y).padStart(3, "0")}
            </span>
            <span className="hidden sm:inline text-emerald-400">
              {cursorCoords.active ? "LOCK: MANUAL" : "LOCK: AUTO_SCAN"}
            </span>
          </div>

          {/* Top-Right Active Bus Telemetry */}
          <div className="pointer-events-none absolute top-3.5 right-8 sm:top-4 sm:right-10 z-30 font-mono-tech text-[9px] sm:text-[10px] tracking-widest text-white/45">
            <span>
              ADDR: <strong className="text-[#F5C451]">{activeHex}</strong> •{" "}
              <strong className="text-white">{activeLayer}</strong>
            </span>
          </div>

          {/* Category Resonance Shockwave */}
          <AnimatePresence>
            <motion.div
              key={pulseWaveKey}
              initial={{ scale: 0.2, opacity: 0.85 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="pointer-events-none absolute h-[240px] w-[240px] sm:h-[380px] sm:w-[380px] rounded-full border border-[#F5C451]"
            />
          </AnimatePresence>

          {/* Concentric Schematic Range Rings */}
          <div className="pointer-events-none absolute h-[250px] w-[66%] sm:h-[350px] sm:w-[62%] rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute h-[335px] w-[82%] sm:h-[470px] sm:w-[81%] rounded-full border border-dashed border-white/[0.07]" />

          {/* SVG Circuit Traces, Synergy Links & Traveling Signal Packet */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          >
            <defs>
              <linearGradient id="quantumTrace" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1E00" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#F5C451" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF1E00" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Passive Base Traces */}
            {sourceSkills.map((skill, idx) => {
              const coords = getNodeCoords(idx, sourceSkills.length, isCompact);
              const d = buildCurvedTrace(coords.x, coords.y, 50, 50);
              return (
                <path
                  key={skill.id}
                  d={d}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={isCompact ? "0.24" : "0.16"}
                />
              );
            })}

            {/* Synergy Peer Mesh Traces */}
            {activeIndex >= 0 &&
              synergyIndices.map((peerIdx) => {
                const peerCoords = getNodeCoords(peerIdx, sourceSkills.length, isCompact);
                const synergyPath = buildCurvedTrace(
                  activeCoords.x,
                  activeCoords.y,
                  peerCoords.x,
                  peerCoords.y
                );
                return (
                  <motion.path
                    key={`syn-${currentSkill?.id}-${peerIdx}`}
                    d={synergyPath}
                    fill="none"
                    stroke="rgba(255, 30, 0, 0.48)"
                    strokeWidth={isCompact ? "0.32" : "0.22"}
                    strokeDasharray="0.9 0.9"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.45 }}
                  />
                );
              })}

            {/* Energized Primary Curved Circuit Trace */}
            {activeIndex >= 0 && (
              <>
                <motion.path
                  key={`trace-${currentSkill?.id}`}
                  d={activeCurvePath}
                  fill="none"
                  stroke="url(#quantumTrace)"
                  strokeWidth={isCompact ? "0.65" : "0.48"}
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* Traveling Light Pulse Packet along Primary Trace */}
                <motion.circle
                  key={`packet-${currentSkill?.id}`}
                  r={isCompact ? "1.1" : "0.75"}
                  fill="#F5C451"
                  initial={{ cx: activeCoords.x, cy: activeCoords.y, opacity: 1 }}
                  animate={{ cx: 50, cy: 50, opacity: [1, 1, 0] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </>
            )}
          </svg>

          {/* CENTRAL QUANTUM REACTOR CORE */}
          <div className="relative z-30 flex h-32 w-32 sm:h-48 sm:w-48 md:h-56 md:w-56 items-center justify-center">
            {/* Scroll-Driven Precision Degree Reticle */}
            <motion.svg
              style={{ rotate: gyroRotateCW }}
              viewBox="0 0 200 200"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <circle
                cx="100"
                cy="100"
                r="94"
                fill="none"
                stroke="rgba(245, 196, 81, 0.45)"
                strokeWidth="1.2"
                strokeDasharray="3 5"
              />
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="rgba(255, 30, 0, 0.4)"
                strokeWidth="1.6"
                strokeDasharray="28 18 6 18"
              />
            </motion.svg>

            {/* Continuous Counter-Rotating Inner Stator */}
            <motion.div
              style={{ rotate: gyroRotateCCW }}
              className="pointer-events-none absolute inset-2.5 sm:inset-5 rounded-full border border-white/15"
            >
              <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 sm:h-2 sm:w-2 -translate-x-1/2 rotate-45 bg-[#FF1E00]" />
              <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 sm:h-2 sm:w-2 -translate-x-1/2 rotate-45 bg-[#F5C451]" />
            </motion.div>

            {/* Core Silicon Chamber */}
            <div className="relative flex h-24 w-24 sm:h-36 sm:w-36 md:h-40 md:w-40 flex-col items-center justify-center rounded-full border border-white/20 bg-[#0A0A0E]/95 p-2 sm:p-4 text-center shadow-[0_0_55px_rgba(255,30,0,0.28),inset_0_0_24px_rgba(245,196,81,0.08)] backdrop-blur-2xl">
              <AnimatePresence mode="wait">
                {currentSkill && (
                  <motion.div
                    key={currentSkill.id}
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.12, filter: "blur(6px)" }}
                    transition={{ duration: 0.24 }}
                    className="flex flex-col items-center"
                  >
                    <span className="hidden sm:block font-mono-tech text-[9px] tracking-widest text-[#F5C451]">
                      {activeHex} // {activeLayer}
                    </span>

                    <div className="my-1 sm:my-2 flex h-7 w-7 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl border border-white/15 bg-white/[0.05] p-1 sm:p-2">
                      {currentSkill.icon_image ? (
                        <img
                          src={currentSkill.icon_image}
                          alt={currentSkill.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-display text-sm sm:text-2xl text-[#F5C451]">
                          {currentSkill.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <h3 className="font-syne text-[11px] sm:text-sm font-extrabold leading-tight text-white max-w-[82px] sm:max-w-none truncate">
                      {currentSkill.name}
                    </h3>
                    <span className="mt-0.5 font-mono-tech text-[7px] sm:text-[9px] uppercase tracking-wider text-emerald-400">
                      ONLINE
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ORBITING TECHNICAL CHIP NODES */}
          {sourceSkills.map((skill, idx) => {
            const isActive = currentSkill?.id === skill.id;
            const isSynergy = synergyIndices.includes(idx);
            const isDimmed =
              selectedCategory !== "all" && skill.category !== selectedCategory;

            return (
              <TechnicalChipNode
                key={skill.id}
                skill={skill}
                index={idx}
                total={sourceSkills.length}
                isCompact={isCompact}
                isActive={isActive}
                isSynergy={isSynergy}
                isDimmed={isDimmed}
                onActivate={handleSkillActivate}
              />
            );
          })}

          {/* Bottom Schematic Telemetry Footer Strip */}
          <div className="pointer-events-none absolute inset-x-8 sm:inset-x-10 bottom-3.5 sm:bottom-4 z-30 flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] tracking-widest text-white/45">
            <span className="truncate max-w-[65%]">
              MESH:{" "}
              <span className="text-white/80">
                {synergyIndices
                  .map((i) => sourceSkills[i]?.name.toUpperCase())
                  .join(" + ") || "ACTIVE"}
              </span>
            </span>
            <span>TAP_OR_SCAN</span>
          </div>
        </div>
      </div>
    </section>
  );
}