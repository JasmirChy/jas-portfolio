import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";

// Brightness-tiered glyph pools so characters constantly mutate while preserving facial detail
const GLYPH_TIERS = [
  [".", "·", "`", ","],
  [":", "-", "~", "^", ";"],
  ["+", "=", "<", ">", "/", "\\"],
  ["*", "{", "}", "[", "]", "0", "1"],
  ["#", "%", "&", "$", "X", "Z"],
  ["@", "W", "M", "B", "8", "Q"],
];

function getCellColor(theme, lum, wave, isZoomed = false) {
  const alpha = isZoomed
    ? Math.min(1, 0.55 + lum * 0.6)
    : Math.min(1, 0.35 + lum * 0.75);

  if (theme === "matrix") {
    if (lum > 0.78) return `rgba(187, 247, 208, ${alpha})`; // Mint highlight
    if (lum > 0.52) return `rgba(52, 211, 153, ${alpha})`;  // Emerald green
    if (lum > 0.28) return `rgba(16, 185, 129, ${alpha})`;  // Matrix green
    return `rgba(5, 150, 105, ${Math.max(0.32, alpha)})`;   // Deep teal-green
  }

  if (theme === "prism") {
    if (lum > 0.8) return `rgba(245, 196, 81, ${alpha})`;   // Gold peak
    if (lum > 0.56) return `rgba(56, 189, 248, ${alpha})`;  // Electric sky blue
    if (lum > 0.34) return `rgba(52, 211, 153, ${alpha})`;  // Emerald green
    return `rgba(99, 102, 241, ${Math.max(0.35, alpha)})`;  // Indigo-blue shadow
  }

  // Default "cyber": Vibrant Blues, Cyans & Emerald Greens
  if (lum > 0.82) {
    return wave > 0.5
      ? `rgba(167, 243, 208, ${alpha})` // Luminous mint-emerald
      : `rgba(186, 230, 253, ${alpha})`; // Ice cyan highlight
  }
  if (lum > 0.58) {
    return wave > 0.45
      ? `rgba(52, 211, 153, ${alpha})`  // Vivid emerald green
      : `rgba(34, 211, 238, ${alpha})`; // Electric cyan
  }
  if (lum > 0.34) {
    return wave > 0.5
      ? `rgba(16, 185, 129, ${alpha})`  // Rich green
      : `rgba(59, 130, 246, ${alpha})`; // Cobalt blue
  }
  return `rgba(29, 78, 216, ${Math.max(0.36, alpha)})`;    // Deep royal blue
}

function AsciiMatrixCanvas({
  imageUrl,
  brandName = "JAS",
  theme = "cyber",
  pointerRef,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId;
    let isCancelled = false;
    let sampledGrid = null;
    let cols = 0;
    let rows = 0;
    let cellW = 5;
    let cellH = 7;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    const buildGridFromImage = (loadedImg, width, height) => {
      const targetCols = Math.max(48, Math.min(76, Math.floor(width / 4.2)));
      cellW = width / targetCols;
      cellH = cellW * 1.35;
      cols = targetCols;
      rows = Math.max(34, Math.floor(height / cellH));

      const offscreen = document.createElement("canvas");
      offscreen.width = cols;
      offscreen.height = rows;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

      const imgRatio = loadedImg.width / loadedImg.height;
      const boxRatio = width / height;
      let sx = 0;
      let sy = 0;
      let sWidth = loadedImg.width;
      let sHeight = loadedImg.height;

      if (imgRatio > boxRatio) {
        sWidth = loadedImg.height * boxRatio;
        sx = (loadedImg.width - sWidth) / 2;
      } else {
        sHeight = loadedImg.width / boxRatio;
        sy = (loadedImg.height - sHeight) * 0.18;
      }

      offCtx.drawImage(loadedImg, sx, sy, sWidth, sHeight, 0, 0, cols, rows);
      const { data } = offCtx.getImageData(0, 0, cols, rows);

      const nextGrid = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4;
          const red = data[idx];
          const green = data[idx + 1];
          const blue = data[idx + 2];
          const alpha = data[idx + 3] / 255;

          let lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
          lum = Math.min(1, Math.max(0, (lum - 0.08) * 1.3)) * alpha;

          const tierIndex = Math.min(
            GLYPH_TIERS.length - 1,
            Math.floor(lum * GLYPH_TIERS.length)
          );

          nextGrid.push({
            col: c,
            row: r,
            brightness: lum,
            tierIndex,
            seed: (c * 17 + r * 31) % 97,
            speed: 0.7 + ((c + r) % 5) * 0.28,
          });
        }
      }

      sampledGrid = nextGrid;
    };

    const renderFrame = (time) => {
      if (isCancelled) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        rect.width > 0 &&
        rect.height > 0 &&
        (canvas.width !== Math.round(rect.width * dpr) ||
          canvas.height !== Math.round(rect.height * dpr))
      ) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        if (img.complete && img.naturalWidth > 0) {
          buildGridFromImage(img, rect.width, rect.height);
        }
      }

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep cyber-obsidian canvas background
      ctx.fillStyle = "#06080F";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const { x: px, y: py, active } = pointerRef.current;

      if (sampledGrid && sampledGrid.length > 0) {
        // 1. Base Portrait Pass (with gentle zoom-in when hovered)
        ctx.save();
        if (active) {
          const baseZoom = 1.12;
          ctx.translate(px, py);
          ctx.scale(baseZoom, baseZoom);
          ctx.translate(-px, -py);
        }

        const fontSize = Math.max(5.5, Math.floor(cellH * 0.92));
        ctx.font = `700 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.textBaseline = "top";

        const scanRow = ((time * 0.018) % (rows + 14)) - 7;

        for (let i = 0; i < sampledGrid.length; i++) {
          const cell = sampledGrid[i];
          if (cell.brightness < 0.05) continue;

          const drawX = cell.col * cellW;
          const drawY = cell.row * cellH;

          // Continuously mutating character inside the cell's brightness tier
          const tier = GLYPH_TIERS[cell.tierIndex];
          const charTick = Math.floor(time * 0.0085 * cell.speed + cell.seed);
          const glyph = tier[charTick % tier.length];

          // Flowing blue-green energy wave across the face
          const wave =
            0.5 + 0.5 * Math.sin(cell.col * 0.14 + cell.row * 0.1 - time * 0.0025);

          const scanDist = Math.abs(cell.row - scanRow);
          if (scanDist < 2.2) {
            ctx.fillStyle = `rgba(110, 231, 183, ${Math.min(1, cell.brightness + 0.35)})`;
          } else {
            ctx.fillStyle = getCellColor(theme, cell.brightness, wave, false);
          }

          ctx.fillText(glyph, drawX, drawY);
        }
        ctx.restore();

        // 2. Optical 2.2x ASCII Magnifier Loupe when Cursor/Finger Hovers Over Portrait
        if (active && px >= 0 && py >= 0 && px <= rect.width && py <= rect.height) {
          const lensRadius = Math.min(rect.width, rect.height) * 0.27;
          const zoomFactor = 2.2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, lensRadius, 0, Math.PI * 2);
          ctx.clip();

          // Darken & tint lens interior for ultra-high glyph legibility
          ctx.fillStyle = "#04070D";
          ctx.fillRect(
            px - lensRadius,
            py - lensRadius,
            lensRadius * 2,
            lensRadius * 2
          );

          ctx.translate(px, py);
          ctx.scale(zoomFactor, zoomFactor);
          ctx.translate(-px, -py);

          ctx.font = `800 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
          ctx.textBaseline = "top";

          const reach = lensRadius / zoomFactor + cellW * 2;

          for (let i = 0; i < sampledGrid.length; i++) {
            const cell = sampledGrid[i];
            if (cell.brightness < 0.05) continue;

            const drawX = cell.col * cellW;
            const drawY = cell.row * cellH;

            if (Math.abs(drawX - px) > reach || Math.abs(drawY - py) > reach) {
              continue;
            }

            const tier = GLYPH_TIERS[cell.tierIndex];
            const charTick = Math.floor(time * 0.011 * cell.speed + cell.seed);
            const glyph = tier[charTick % tier.length];

            const wave =
              0.5 + 0.5 * Math.cos(cell.col * 0.16 - cell.row * 0.12 + time * 0.003);

            ctx.fillStyle = getCellColor(theme, cell.brightness, wave, true);
            ctx.fillText(glyph, drawX, drawY);
          }

          ctx.restore();

          // Glowing HUD Reticle Ring Around the Zoomed Lens
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, lensRadius, 0, Math.PI * 2);
          ctx.strokeStyle = "#34D399";
          ctx.lineWidth = 1.75;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, lensRadius - 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
          ctx.lineWidth = 0.8;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    if (imageUrl) {
      setStatus("loading");
      img.onload = () => {
        if (isCancelled) return;
        const rect = container.getBoundingClientRect();
        buildGridFromImage(img, rect.width || 280, rect.height || 350);
        setStatus("ready");
      };
      img.onerror = () => {
        if (!isCancelled) setStatus("fallback");
      };
      img.src = imageUrl;
    } else {
      setStatus("fallback");
    }

    animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageUrl, theme, pointerRef]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#06080F]">
      <canvas ref={canvasRef} className="block h-full w-full" />

      {status === "fallback" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0EA5E9]/25 via-[#09121A] to-[#06080F] p-4 text-center">
          <pre className="font-mono-tech text-[10px] leading-tight text-[#34D399]">
{` ██╗ █████╗ ███████╗
 ██║██╔══██╗██╔════╝
 ██║███████║███████╗
██ ██║██╔══██║╚════██║
╚████╔╝██║  ██║███████║
 ╚═══╝ ╚═╝  ╚═╝╚══════╝`}
          </pre>
          <span className="mt-3 font-mono-tech text-[10px] text-[#38BDF8]">
            {brandName} 
          </span>
        </div>
      )}
    </div>
  );
}

export default function AboutProfile({ profile }) {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const asciiPointerRef = useRef({ x: -999, y: -999, active: false });
  const [asciiTheme, setAsciiTheme] = useState("cyber");
  const [isZooming, setIsZooming] = useState(false);

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

  const outerRingRotate = useTransform(smoothScroll, [0, 1], [-45, 195]);
  const innerRingRotate = useTransform(smoothScroll, [0, 1], [60, -180]);
  const badgeOrbitRotate = useTransform(smoothScroll, [0, 1], [0, 360]);
  const scrollFrameTilt = useTransform(smoothScroll, [0, 0.5, 1], [-7, 0, 7]);
  const scrollFrameY = useTransform(smoothScroll, [0, 1], [24, -24]);

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

  const specularGradient = useMotionTemplate`radial-gradient(circle at ${smoothGlareX}% ${smoothGlareY}%, rgba(52, 211, 153, 0.24) 0%, rgba(56, 189, 248, 0.14) 38%, transparent 68%)`;

  const updateInteraction = (clientX, clientY) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    mouseX.set(relX - 0.5);
    mouseY.set(relY - 0.5);
    glarePercentX.set(relX * 100);
    glarePercentY.set(relY * 100);

    asciiPointerRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      active: true,
    };
    if (!isZooming) setIsZooming(true);
  };

  const resetInteraction = () => {
    mouseX.set(0);
    mouseY.set(0);
    glarePercentX.set(50);
    glarePercentY.set(50);
    asciiPointerRef.current.active = false;
    setIsZooming(false);
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden border-t border-white/10 py-14 sm:py-28 md:block"
    >
      {/* Subtle Ambient Emerald & Cyan Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/4 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0EA5E9]/[0.12] blur-[120px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-14 lg:grid-cols-12">
          {/* LEFT COLUMN: Rotational & Cursor-Reactive ASCII Portrait Stage */}
          <div className="relative flex items-center justify-center lg:col-span-6">
            {/* Outer Scroll-Rotating Dashed Orbital Ring */}
            <motion.div
              aria-hidden="true"
              style={{ rotate: outerRingRotate }}
              className="pointer-events-none absolute h-[255px] w-[255px] rounded-full border border-dashed border-[#34D399]/35 sm:h-[430px] sm:w-[430px]"
            >
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#38BDF8] shadow-[0_0_12px_#38BDF8]" />
              <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#34D399]" />
            </motion.div>

            {/* Inner Counter-Rotating Ring */}
            <motion.div
              aria-hidden="true"
              style={{ rotate: innerRingRotate }}
              className="pointer-events-none absolute h-[215px] w-[215px] rounded-full border border-white/12 sm:h-[365px] sm:w-[365px]"
            >
              <span className="absolute top-1/2 -left-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#34D399]" />
              <span className="absolute top-1/2 -right-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#38BDF8]" />
            </motion.div>

            {/* Scroll-Driven Parallax & Tilt Wrapper */}
            <motion.div
              style={{
                y: scrollFrameY,
                rotateZ: scrollFrameTilt,
                perspective: 1100,
              }}
              className="relative z-10 w-full max-w-[205px] sm:max-w-[320px]"
            >
              {/* Cursor & Touch-Tracking 3D Interactive ASCII Card */}
              <motion.div
                ref={frameRef}
                onMouseMove={(e) => updateInteraction(e.clientX, e.clientY)}
                onMouseLeave={resetInteraction}
                onTouchMove={(e) => {
                  if (e.touches[0]) {
                    updateInteraction(
                      e.touches[0].clientX,
                      e.touches[0].clientY
                    );
                  }
                }}
                onTouchEnd={resetInteraction}
                style={{
                  rotateX: cursorRotateX,
                  rotateY: cursorRotateY,
                  rotateZ: cursorRotateZ,
                  transformStyle: "preserve-3d",
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative cursor-crosshair rounded-[26px] border border-[#38BDF8]/25 bg-[#090D16] p-2 shadow-[0_30px_75px_rgba(0,0,0,0.9)] transition-colors hover:border-[#34D399]/60 sm:rounded-[28px] sm:p-2.5"
              >
                {/* 4 Corner Crosshair '+' Reticles */}
                <span className="pointer-events-none absolute -top-3 -left-3 font-mono-tech text-xs text-[#34D399]">
                  +
                </span>
                <span className="pointer-events-none absolute -top-3 -right-3 font-mono-tech text-xs text-[#38BDF8]">
                  +
                </span>
                <span className="pointer-events-none absolute -bottom-3 -left-3 font-mono-tech text-xs text-[#38BDF8]">
                  +
                </span>
                <span className="pointer-events-none absolute -bottom-3 -right-3 font-mono-tech text-xs text-[#34D399]">
                  +
                </span>

                {/* Cursor Specular Glare Overlay */}
                <motion.div
                  aria-hidden="true"
                  style={{ background: specularGradient }}
                  className="pointer-events-none absolute inset-0 z-20 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                {/* ASCII Code Portrait Frame */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#06080F] sm:rounded-[22px]">
                  <AsciiMatrixCanvas
                    imageUrl={avatarUrl}
                    brandName={brandName}
                    theme={asciiTheme}
                    pointerRef={asciiPointerRef}
                  />

                  {/* Top Color Spectrum Switcher Pill (CYBER / MATRIX / PRISM) */}
                  <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1 rounded-full border border-white/15 bg-black/80 p-0.5 backdrop-blur-md">
                    {["cyber", "matrix", "prism"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsciiTheme(item);
                        }}
                        className={`cursor-pointer rounded-full px-2 py-0.5 font-mono-tech text-[8px] uppercase tracking-wider transition-colors sm:text-[9px] ${
                          asciiTheme === item
                            ? "bg-gradient-to-r from-[#0EA5E9] to-[#10B981] font-bold text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Subtle Gradient Overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between font-mono-tech text-[9px] uppercase tracking-wider text-white/85 sm:text-[10px]">
                    <span className="text-[#38BDF8]">{brandName} .... </span>
                    <span className="rounded-full bg-[#10B981] px-2 py-0.5 text-[8px] font-bold text-black sm:text-[9px]">
                      {isZooming ? "ZOOM 2.2X" : "HOVER ZOOM"}
                    </span>
                  </div>
                </div>

                {/* Bottom Card Telemetry Strip */}
                <div className="mt-2 flex items-center justify-between px-1.5 pb-0.5 font-mono-tech text-[10px] text-white/60 sm:mt-2.5 sm:px-2 sm:pb-1 sm:text-[11px]">
                  <span className="truncate">{location}</span>
                  <span className="text-[#34D399]">LIVE CODE</span>
                </div>
              </motion.div>

              {/* Orbiting Rotating Stamp Badge */}
              <motion.div
                style={{ rotate: badgeOrbitRotate }}
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -bottom-4 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-[#34D399]/40 bg-[#08080A]/90 shadow-xl backdrop-blur-md sm:-right-7 sm:-bottom-7 sm:h-24 sm:w-24"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full p-1.5">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                    />
                  </defs>
                  <text
                    fill="#38BDF8"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="2.4"
                  >
                    <textPath href="#circlePath">
                      - {brandName} • FULL-STACK DEV
                    </textPath>
                  </text>
                </svg>
                <span className="absolute h-2 w-2 rounded-full bg-[#34D399] sm:h-2.5 sm:w-2.5" />
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
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-[#F5C451] sm:text-xs">
              ABOUT ME // PROFILE
            </p>

            <h2 className="font-syne mt-2 text-2xl font-extrabold leading-tight text-white sm:mt-3 sm:text-5xl">
              Behind the <span className="text-[#FF1E00]">Code</span> &{" "}
              <span className="text-[#F5C451]">Design.</span>
            </h2>

            <p className="mt-3 text-xs leading-relaxed text-white/75 sm:mt-5 sm:text-base">
              {bio}
            </p>

            {/* Clean Telemetry Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-3.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                <p className="font-mono-tech text-[9px] uppercase tracking-widest text-white/45 sm:text-[10px]">
                  BASE LOCATION
                </p>
                <p className="font-syne mt-1 text-xs font-bold text-white sm:text-base">
                  {location}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                <p className="font-mono-tech text-[9px] uppercase tracking-widest text-white/45 sm:text-[10px]">
                  CURRENT STATUS
                </p>
                <p className="font-syne mt-1 text-xs font-bold text-emerald-400 sm:text-base">
                  {status}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5C451] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                See My Projects →
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white sm:px-5 sm:py-2.5 sm:text-sm"
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