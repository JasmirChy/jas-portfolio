import { useEffect, useRef, useState } from "react";

const CHAR_SETS = {
  dense: " .:-=+*#%@",
  code: " .·:;+-=<>{}01#",
};

export default function AsciiPortrait({
  imageUrl,
  name = "Jasmir Chaudhary",
  badge = "ASCII_MATRIX // 02",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -999, y: -999, active: false });

  const [mode, setMode] = useState("dense");
  const [gridInfo, setGridInfo] = useState({ cols: 0, rows: 0 });
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "fallback"

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId;
    let isCancelled = false;
    let sampledGrid = null; // Array of { char, brightness, col, row }
    let cols = 0;
    let rows = 0;
    let cellW = 6;
    let cellH = 8;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    const buildGridFromImage = (loadedImg, width, height) => {
      // Target ~68-84 columns depending on container width for crisp mobile & desktop legibility
      const targetCols = Math.max(54, Math.min(88, Math.floor(width / 5.4)));
      cellW = width / targetCols;
      cellH = cellW * 1.38; // Monospace character aspect ratio
      cols = targetCols;
      rows = Math.max(30, Math.floor(height / cellH));

      setGridInfo({ cols, rows });

      // Offscreen canvas with cover-fit cropping so any photo aspect ratio fits cleanly
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
        sy = (loadedImg.height - sHeight) * 0.2; // Bias slightly upward for portrait faces
      }

      offCtx.drawImage(loadedImg, sx, sy, sWidth, sHeight, 0, 0, cols, rows);
      const { data } = offCtx.getImageData(0, 0, cols, rows);

      const ramp = CHAR_SETS[mode] || CHAR_SETS.dense;
      const nextGrid = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4;
          const red = data[idx];
          const green = data[idx + 1];
          const blue = data[idx + 2];
          const alpha = data[idx + 3] / 255;

          // Perceptual luminance with gentle contrast boost for facial features
          let lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
          lum = Math.min(1, Math.max(0, (lum - 0.12) * 1.25)) * alpha;

          const charIdx = Math.min(
            ramp.length - 1,
            Math.floor(lum * (ramp.length - 1))
          );

          nextGrid.push({
            col: c,
            row: r,
            brightness: lum,
            char: ramp[charIdx],
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
        canvas.width !== Math.round(rect.width * dpr) ||
        canvas.height !== Math.round(rect.height * dpr)
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

      // Deep obsidian backdrop
      ctx.fillStyle = "#08080C";
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (sampledGrid && sampledGrid.length > 0) {
        const fontSize = Math.max(6, Math.floor(cellH * 0.92));
        ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.textBaseline = "top";

        const scanRow = ((time * 0.018) % (rows + 14)) - 7;
        const { x: px, y: py, active } = pointerRef.current;

        for (let i = 0; i < sampledGrid.length; i++) {
          const cell = sampledGrid[i];
          if (cell.brightness < 0.06) continue;

          const drawX = cell.col * cellW;
          const drawY = cell.row * cellH;

          // Subtle travelling scanline pulse
          const scanDist = Math.abs(cell.row - scanRow);
          const scanBoost = scanDist < 2.2 ? (1 - scanDist / 2.2) * 0.35 : 0;

          // Interactive cursor / finger spotlight
          let pointerBoost = 0;
          if (active) {
            const dx = drawX - px;
            const dy = drawY - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 85) {
              pointerBoost = 1 - dist / 85;
            }
          }

          if (pointerBoost > 0.25) {
            ctx.fillStyle = pointerBoost > 0.65 ? "#F5C451" : "#FF1E00";
          } else if (scanBoost > 0.15) {
            ctx.fillStyle = `rgba(245, 196, 81, ${Math.min(1, cell.brightness + scanBoost)})`;
          } else if (cell.brightness > 0.78) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, cell.brightness + 0.1)})`;
          } else if (cell.brightness > 0.45) {
            ctx.fillStyle = `rgba(225, 225, 232, ${cell.brightness * 0.92})`;
          } else {
            ctx.fillStyle = `rgba(255, 65, 35, ${Math.max(0.28, cell.brightness * 1.15)})`;
          }

          ctx.fillText(cell.char, drawX, drawY);
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
        buildGridFromImage(img, rect.width || 320, rect.height || 400);
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
  }, [imageUrl, mode]);

  const updatePointer = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      active: true,
    };
  };

  return (
    <div className="relative mx-auto w-full max-w-[360px] select-none sm:max-w-[400px]">
      {/* Outer Tactical Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#08080C] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        {/* Corner HUD Brackets */}
        <span className="pointer-events-none absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-[#FF1E00]" />
        <span className="pointer-events-none absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-[#F5C451]" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-[#F5C451]" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[#FF1E00]" />

        {/* Top Telemetry Bar */}
        <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2 font-mono-tech text-[10px] tracking-widest text-white/60">
          <span className="flex items-center gap-1.5 text-[#F5C451]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF1E00]" />
            {badge}
          </span>

          <div className="flex items-center gap-1">
            {["dense", "code"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`cursor-pointer rounded px-2 py-0.5 uppercase transition-colors ${
                  mode === item
                    ? "bg-[#FF1E00] text-white font-bold"
                    : "bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ASCII Canvas Viewport */}
        <div
          ref={containerRef}
          onMouseMove={(e) => updatePointer(e.clientX, e.clientY)}
          onMouseLeave={() => {
            pointerRef.current.active = false;
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              updatePointer(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={() => {
            pointerRef.current.active = false;
          }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-[#08080C]"
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {status === "fallback" && (
            <pre className="flex h-full w-full items-center justify-center font-mono-tech text-xs leading-tight text-[#F5C451]">
{`   ██╗ █████╗ ███████╗
   ██║██╔══██╗██╔════╝
   ██║███████║███████╗
██ ██║██╔══██║╚════██║
╚████╔╝██║  ██║███████║
 ╚═══╝ ╚═╝  ╚═╝╚══════╝`}
            </pre>
          )}
        </div>

        {/* Bottom Status Strip */}
        <div className="mt-2.5 flex items-center justify-between font-mono-tech text-[10px] text-white/45">
          <span>SUBJECT: {name.toUpperCase()}</span>
          <span>
            {gridInfo.cols > 0 ? `${gridInfo.cols}×${gridInfo.rows} GLYPHS` : "SYNCING..."}
          </span>
        </div>
      </div>
    </div>
  );
}