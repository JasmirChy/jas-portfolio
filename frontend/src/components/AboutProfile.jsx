import { useEffect, useRef, useState } from "react";
import staticProfileImg from "../assets/static-profile.jpg";
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

const STAR_PARTICLES = [
  { top: "8%", left: "14%", size: 2, color: "#38BDF8", delay: 0 },
  { top: "16%", left: "84%", size: 2.5, color: "#F5C451", delay: 0.6 },
  { top: "28%", left: "6%", size: 1.5, color: "#34D399", delay: 1.2 },
  { top: "74%", left: "10%", size: 2, color: "#F5C451", delay: 0.4 },
  { top: "82%", left: "88%", size: 2.5, color: "#38BDF8", delay: 1.5 },
  { top: "12%", left: "52%", size: 1.5, color: "#FFFFFF", delay: 0.9 },
  { top: "88%", left: "44%", size: 2, color: "#34D399", delay: 1.8 },
  { top: "46%", left: "93%", size: 1.5, color: "#FF1E00", delay: 0.3 },
];

function getCellColor(theme, lum, wave, isZoomed = false) {
  const alpha = isZoomed
    ? Math.min(1, 0.55 + lum * 0.6)
    : Math.min(1, 0.35 + lum * 0.75);

  if (theme === "matrix") {
    if (lum > 0.78) return `rgba(187, 247, 208, ${alpha})`;
    if (lum > 0.52) return `rgba(52, 211, 153, ${alpha})`;
    if (lum > 0.28) return `rgba(16, 185, 129, ${alpha})`;
    return `rgba(5, 150, 105, ${Math.max(0.32, alpha)})`;
  }

  if (theme === "prism") {
    if (lum > 0.8) return `rgba(245, 196, 81, ${alpha})`;
    if (lum > 0.56) return `rgba(56, 189, 248, ${alpha})`;
    if (lum > 0.34) return `rgba(52, 211, 153, ${alpha})`;
    return `rgba(99, 102, 241, ${Math.max(0.35, alpha)})`;
  }

  // Default "cyber": Vibrant Blues, Cyans & Emerald Greens
  if (lum > 0.82) {
    return wave > 0.5
      ? `rgba(167, 243, 208, ${alpha})`
      : `rgba(186, 230, 253, ${alpha})`;
  }
  if (lum > 0.58) {
    return wave > 0.45
      ? `rgba(52, 211, 153, ${alpha})`
      : `rgba(34, 211, 238, ${alpha})`;
  }
  if (lum > 0.34) {
    return wave > 0.5
      ? `rgba(16, 185, 129, ${alpha})`
      : `rgba(59, 130, 246, ${alpha})`;
  }
  return `rgba(29, 78, 216, ${Math.max(0.36, alpha)})`;
}

function AsciiMatrixCanvas({
  imageUrl,
  staticImageUrl = staticProfileImg,
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

      ctx.fillStyle = "#06080F";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const { x: px, y: py, active } = pointerRef.current;

      if (sampledGrid && sampledGrid.length > 0) {
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

          const tier = GLYPH_TIERS[cell.tierIndex];
          const charTick = Math.floor(time * 0.0085 * cell.speed + cell.seed);
          const glyph = tier[charTick % tier.length];

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

        if (active && px >= 0 && py >= 0 && px <= rect.width && py <= rect.height) {
          const lensRadius = Math.min(rect.width, rect.height) * 0.27;
          const zoomFactor = 2.2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, lensRadius, 0, Math.PI * 2);
          ctx.clip();

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

    const targetSrc = imageUrl || staticImageUrl;
    let triedStaticFallback = targetSrc === staticImageUrl;

    if (targetSrc) {
      setStatus("loading");
      img.onload = () => {
        if (isCancelled) return;
        const rect = container.getBoundingClientRect();
        buildGridFromImage(img, rect.width || 280, rect.height || 350);
        setStatus("ready");
      };
      img.onerror = () => {
        if (isCancelled) return;
        if (!triedStaticFallback && staticImageUrl) {
          triedStaticFallback = true;
          img.src = staticImageUrl;
        } else {
          setStatus("fallback");
        }
      };
      img.src = targetSrc;
    } else {
      setStatus("fallback");
    }

    animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageUrl, staticImageUrl, theme, pointerRef]);

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
            {brandName} // ASCII READY
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
  const avatarUrl = profile?.avatar || staticProfileImg;

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

  const scrollFrameTilt = useTransform(smoothScroll, [0, 0.5, 1], [-7, 0, 7]);
  const scrollFrameY = useTransform(smoothScroll, [0, 1], [24, -24]);

  // 2. Global Cursor-Tracking 3D Tilt & Spotlight Values (works anywhere on screen)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glarePercentX = useMotionValue(50);
  const glarePercentY = useMotionValue(50);

  const springConfig = { stiffness: 160, damping: 20, mass: 0.7 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothGlareX = useSpring(glarePercentX, springConfig);
  const smoothGlareY = useSpring(glarePercentY, springConfig);

  const cursorRotateX = useTransform(smoothY, [-0.6, 0.6], [18, -18]);
  const cursorRotateY = useTransform(smoothX, [-0.6, 0.6], [-18, 18]);
  const cursorRotateZ = useTransform(smoothX, [-0.6, 0.6], [-4, 4]);
  const cursorShiftX = useTransform(smoothX, [-0.6, 0.6], [-12, 12]);
  const cursorShiftY = useTransform(smoothY, [-0.6, 0.6], [-10, 10]);

  const specularGradient = useMotionTemplate`radial-gradient(circle at ${smoothGlareX}% ${smoothGlareY}%, rgba(52, 211, 153, 0.28) 0%, rgba(56, 189, 248, 0.16) 40%, transparent 70%)`;

  useEffect(() => {
    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    const handleGlobalPointerMove = (e) => {
      if (!frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = clamp((e.clientX - centerX) / (window.innerWidth * 0.45), -0.6, 0.6);
      const normY = clamp((e.clientY - centerY) / (window.innerHeight * 0.45), -0.6, 0.6);

      mouseX.set(normX);
      mouseY.set(normY);

      const relX = clamp((e.clientX - rect.left) / rect.width, -0.3, 1.3);
      const relY = clamp((e.clientY - rect.top) / rect.height, -0.3, 1.3);
      glarePercentX.set(relX * 100);
      glarePercentY.set(relY * 100);

      const isInsideCard =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInsideCard) {
        asciiPointerRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        };
        setIsZooming(true);
      } else {
        asciiPointerRef.current.active = false;
        setIsZooming(false);
      }
    };

    const handleWindowMouseOut = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        mouseX.set(0);
        mouseY.set(0);
        glarePercentX.set(50);
        glarePercentY.set(50);
        asciiPointerRef.current.active = false;
        setIsZooming(false);
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    window.addEventListener("mouseout", handleWindowMouseOut);
    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("mouseout", handleWindowMouseOut);
    };
  }, [mouseX, mouseY, glarePercentX, glarePercentY]);

  const handleTouchMove = (e) => {
    if (!frameRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = frameRef.current.getBoundingClientRect();
    const relX = (touch.clientX - rect.left) / rect.width;
    const relY = (touch.clientY - rect.top) / rect.height;

    mouseX.set(Math.min(0.6, Math.max(-0.6, relX - 0.5)));
    mouseY.set(Math.min(0.6, Math.max(-0.6, relY - 0.5)));
    glarePercentX.set(relX * 100);
    glarePercentY.set(relY * 100);

    asciiPointerRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      active: true,
    };
    setIsZooming(true);
  };

  const handleTouchEnd = () => {
    mouseX.set(0);
    mouseY.set(0);
    asciiPointerRef.current.active = false;
    setIsZooming(false);
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden border-t border-white/10 py-14 sm:py-28 md:block"
    >
      {/* Multi-Spectrum Cosmic Nebula Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/4 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.16)_0%,rgba(16,185,129,0.08)_42%,rgba(255,30,0,0.05)_70%,transparent_100%)] blur-[110px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-14 lg:grid-cols-12">
          {/* LEFT COLUMN: Marvel-Level Celestial Astrolabe & Planetary System */}
          <div className="relative flex items-center justify-center lg:col-span-6">
            {/* Ambient Twinkling Starfield Dust */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[310px] w-[310px] sm:h-[520px] sm:w-[520px]"
            >
              {STAR_PARTICLES.map((star, idx) => (
                <motion.span
                  key={idx}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.35, 0.8],
                  }}
                  transition={{
                    duration: 2.8 + (idx % 3) * 0.7,
                    delay: star.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    top: star.top,
                    left: star.left,
                    width: star.size,
                    height: star.size,
                    backgroundColor: star.color,
                    boxShadow: `0 0 8px ${star.color}`,
                  }}
                  className="absolute rounded-full"
                />
              ))}
            </div>

            {/* ORBIT 3 (OUTERMOST CELESTIAL ASTROLABE — 64s CW Revolution) */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute h-[304px] w-[304px] sm:h-[515px] sm:w-[515px]"
            >
              {/* Precision Engraved Astrolabe SVG + Tapered Plasma Comet Wakes */}
              <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="goldCometWake" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F5C451" stopOpacity="0" />
                    <stop offset="65%" stopColor="#F5C451" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="cyanCometWake" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
                    <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Outer Celestial Track */}
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill="none"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="0.9"
                  strokeDasharray="2 6 12 6"
                />
                {/* Inner Harmonic Sub-Track */}
                <circle
                  cx="200"
                  cy="200"
                  r="183"
                  fill="none"
                  stroke="rgba(245,196,81,0.16)"
                  strokeWidth="0.6"
                  strokeDasharray="1 9"
                />

                {/* Cardinal Astrolabe Diamond Markers */}
                <polygon points="200,4 204,10 200,16 196,10" fill="rgba(245,196,81,0.55)" />
                <polygon points="396,200 390,204 384,200 390,196" fill="rgba(56,189,248,0.55)" />
                <polygon points="200,396 204,390 200,384 196,390" fill="rgba(52,211,153,0.55)" />
                <polygon points="4,200 10,204 16,200 10,196" fill="rgba(255,30,0,0.55)" />

                {/* Trailing Plasma Wake Behind Top Gold Sovereign Planet */}
                <path
                  d="M 118 29 A 190 190 0 0 1 200 10"
                  fill="none"
                  stroke="url(#goldCometWake)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Trailing Plasma Wake Behind Bottom Sapphire World */}
                <path
                  d="M 282 371 A 190 190 0 0 1 200 390"
                  fill="none"
                  stroke="url(#cyanCometWake)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>

              {/* Top Planet: Solar-Gold Sovereign World with Atmospheric Corona */}
              <div className="absolute top-[2.5%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <span className="absolute h-7 w-7 animate-pulse rounded-full bg-[#F5C451]/30 blur-sm sm:h-9 sm:w-9" />
                <span
                  className="relative h-4 w-4 rounded-full border border-[#FEF08A]/70 shadow-[0_0_20px_rgba(245,196,81,0.95)] sm:h-5 sm:w-5"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 28%, #FEF9C3 0%, #F5C451 45%, #B45309 82%, #451A03 100%)",
                  }}
                />
              </div>

              {/* Bottom Planet: Deep Sapphire Ice World */}
              <div className="absolute bottom-[2.5%] left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center justify-center">
                <span className="absolute h-6 w-6 rounded-full bg-[#38BDF8]/25 blur-sm sm:h-7 sm:w-7" />
                <span
                  className="relative h-3 w-3 rounded-full border border-[#BAE6FD]/60 shadow-[0_0_16px_rgba(56,189,248,0.95)] sm:h-4 sm:w-4"
                  style={{
                    background:
                      "radial-gradient(circle at 32% 28%, #E0F2FE 0%, #0EA5E9 55%, #1E3A8A 100%)",
                  }}
                />
              </div>
            </motion.div>

            {/* ORBIT 2 (MIDDLE — 38s Counter-Clockwise Revolution with Ringed Giant & Orbiting Moon) */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: -360 }}
              transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute h-[260px] w-[260px] rounded-full border border-[#34D399]/25 sm:h-[435px] sm:w-[435px]"
            >
              {/* Luminous Sector Arc Overlay */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#38BDF8]/50 border-b-[#10B981]/45"
              />

              {/* Top: Ringed Cyan Gas Giant + Its Own Revolving Micro-Moon */}
              <div className="absolute -top-2.5 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center sm:-top-3 sm:h-7 sm:w-7">
                {/* Atmospheric Halo */}
                <span className="absolute h-7 w-7 rounded-full bg-[#38BDF8]/25 blur-sm sm:h-9 sm:w-9" />
                {/* 3D Banded Sphere */}
                <span
                  className="relative h-4 w-4 rounded-full shadow-[0_0_18px_rgba(56,189,248,0.95)] sm:h-5 sm:w-5"
                  style={{
                    background:
                      "radial-gradient(circle at 28% 25%, #F0F9FF 0%, #38BDF8 45%, #0284C7 75%, #082F49 100%)",
                  }}
                />
                {/* Dual Tilted Planetary Rings */}
                <span className="absolute h-2.5 w-8 -rotate-25 rounded-full border border-[#BAE6FD]/85 shadow-[0_0_8px_rgba(56,189,248,0.6)] sm:h-3 sm:w-10" />
                <span className="absolute h-3 w-9 -rotate-25 rounded-full border border-[#38BDF8]/40 sm:h-3.5 sm:w-11" />

                {/* Sub-Orbiting Micro-Moon Revolving Around the Gas Giant */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                  className="absolute h-9 w-9 sm:h-12 sm:w-12"
                >
                  <span className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_6px_#FFFFFF]" />
                </motion.div>
              </div>

              {/* Bottom: Bioluminescent Emerald Biosphere World */}
              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center sm:-bottom-2.5">
                <span className="absolute h-6 w-6 rounded-full bg-[#10B981]/30 blur-sm sm:h-8 sm:w-8" />
                <span
                  className="relative h-3.5 w-3.5 rounded-full border border-[#A7F3D0]/70 shadow-[0_0_18px_rgba(52,211,153,0.95)] sm:h-4.5 sm:w-4.5"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 28%, #D1FAE5 0%, #10B981 50%, #064E3B 100%)",
                  }}
                />
              </div>
            </motion.div>

            {/* ORBIT 1 (INNERMOST — 22s Fast Clockwise Singularity & Quantum Relay) */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute h-[218px] w-[218px] rounded-full border border-dashed border-[#FF1E00]/35 sm:h-[364px] sm:w-[364px]"
            >
              {/* Left: Molten Crimson Singularity Planet with Gold Corona Flare */}
              <div className="absolute top-1/2 -left-2 flex -translate-y-1/2 items-center justify-center sm:-left-2.5">
                <span className="absolute h-6 w-6 animate-ping rounded-full bg-[#FF1E00]/35 [animation-duration:3s]" />
                <span
                  className="relative h-3.5 w-3.5 rounded-full border border-[#F5C451]/80 shadow-[0_0_18px_rgba(255,30,0,1)] sm:h-4 sm:w-4"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #FEF08A 0%, #FF1E00 52%, #7F1D1D 100%)",
                  }}
                />
              </div>

              {/* Right: Quantum Telemetry Satellite with Solar Wing Arrays */}
              <div className="absolute top-1/2 -right-2 flex -translate-y-1/2 items-center justify-center sm:-right-2.5">
                <span className="h-3.5 w-[1.5px] bg-[#38BDF8]/80 sm:h-4" />
                <span className="mx-0.5 h-2 w-2 rotate-45 bg-[#2DD4BF] shadow-[0_0_10px_#2DD4BF] sm:h-2.5 sm:w-2.5" />
                <span className="h-3.5 w-[1.5px] bg-[#38BDF8]/80 sm:h-4" />
              </div>
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
              {/* Perpetual Ambient 3D Levitation Wrapper */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotateZ: [-1.2, 1.2, -1.2],
                }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Global Cursor & Touch-Tracking 3D Interactive ASCII Card */}
                <motion.div
                  ref={frameRef}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    x: cursorShiftX,
                    y: cursorShiftY,
                    rotateX: cursorRotateX,
                    rotateY: cursorRotateY,
                    rotateZ: cursorRotateZ,
                    transformStyle: "preserve-3d",
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="group relative cursor-crosshair rounded-[26px] border border-[#38BDF8]/30 bg-[#090D16] p-2 shadow-[0_30px_75px_rgba(0,0,0,0.9)] transition-colors hover:border-[#34D399]/70 sm:rounded-[28px] sm:p-2.5"
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

                  {/* Continuous Specular Glare Overlay */}
                  <motion.div
                    aria-hidden="true"
                    style={{ background: specularGradient }}
                    className="pointer-events-none absolute inset-0 z-20 rounded-[26px] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  {/* ASCII Code Portrait Frame */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#06080F] sm:rounded-[22px]">
                    <AsciiMatrixCanvas
                      imageUrl={avatarUrl}
                      staticImageUrl={staticProfileImg}
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
                      <span className="text-[#38BDF8]">{brandName} // ASCII</span>
                      <span className="rounded-full bg-[#10B981] px-2 py-0.5 text-[8px] font-bold text-black sm:text-[9px]">
                        {isZooming ? "ZOOM 2.2X" : "HOVER ZOOM"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Card Telemetry Strip */}
                  <div className="mt-2 flex items-center justify-between px-1.5 pb-0.5 font-mono-tech text-[10px] text-white/60 sm:mt-2.5 sm:px-2 sm:pb-1 sm:text-[11px]">
                    <span className="truncate">{location}</span>
                    <span className="text-[#34D399]">3D GYRO</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Continuously Revolving Stamp Badge */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
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

            {/* FOREGROUND 3D ELLIPTICAL ENERGY RING (Sweeps across lower front plane for cinema depth) */}
            <div
              aria-hidden="true"
              style={{ perspective: "900px" }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            >
              <div
                style={{
                  transform: "rotateX(74deg) rotateZ(-20deg)",
                  transformStyle: "preserve-3d",
                }}
                className="relative h-[265px] w-[265px] rounded-full border-b-2 border-[#38BDF8]/45 shadow-[0_12px_25px_rgba(56,189,248,0.25)] sm:h-[430px] sm:w-[430px]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <span className="absolute bottom-0 left-1/2 h-2 w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#F5C451] to-white shadow-[0_0_16px_#F5C451]" />
                </motion.div>
              </div>
            </div>
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