import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_PROJECTS = [
  {
    id: "demo-1",
    title: "NepWork",
    subtitle: "Freelance & Local Service Marketplace",
    description:
      "Full-stack local job and freelance platform built with Django, React, PostgreSQL, and eSewa payment integration.",
    cover_image: null,
    accent_color: "#FF1E00",
    tech_list: ["Python", "Django", "React", "PostgreSQL"],
    live_url: "",
    github_url: "",
    featured: true,
  },
  {
    id: "demo-2",
    title: "KrishiMart",
    subtitle: "Agricultural E-Commerce Platform",
    description:
      "Farm-to-door marketplace featuring real-time chat, map-based delivery calculation, and seamless digital checkout.",
    cover_image: null,
    accent_color: "#F5C451",
    tech_list: ["Django REST", "React", "PostgreSQL"],
    live_url: "",
    github_url: "",
    featured: true,
  },
  {
    id: "demo-3",
    title: "Live Traveller",
    subtitle: "Interactive Route & Travel Companion",
    description:
      "Modern travel discovery web app with JWT authentication, interactive maps, and curated destination guides.",
    cover_image: null,
    accent_color: "#D9381E",
    tech_list: ["React", "Django", "PostgreSQL"],
    live_url: "",
    github_url: "",
    featured: false,
  },
];

export default function ProjectCarousel3D({ projects = [] }) {
  const sourceProjects = projects.length > 0 ? projects : DEMO_PROJECTS;
  const isDemoMode = projects.length === 0;

  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("carousel"); // "carousel" | "grid"
  const [selectedProject, setSelectedProject] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleResize = (e) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return sourceProjects;
    if (activeFilter === "featured") {
      const feat = sourceProjects.filter((p) => p.featured);
      return feat.length > 0 ? feat : sourceProjects;
    }
    return sourceProjects.filter((p) =>
      (p.tech_list || []).some(
        (t) => t.toLowerCase() === activeFilter.toLowerCase()
      )
    );
  }, [sourceProjects, activeFilter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeFilter, projects.length]);

  const total = filteredProjects.length;

  const handlePrev = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  // Keyboard Left / Right navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (selectedProject || viewMode !== "carousel") return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Touch swipe handlers for mobile
  const onTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    if (diff < -40) handlePrev();
    setTouchStartX(null);
  };

  const activeProject = filteredProjects[activeIndex] || filteredProjects[0];

  // Compute circular offset (-2, -1, 0, +1, +2) for curved 3D stage
  const getRelativeOffset = (index) => {
    if (total === 1) return 0;
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section
      id="work"
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden border-t border-white/10 pt-16 pb-10 sm:py-24 md:block md:py-28"
    >
      {/* Dynamic Ambient Spotlight synced to active project's accent color */}
      <div
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 50% 52%, ${
            activeProject?.accent_color || "#FF1E00"
          }26 0%, rgba(8,8,10,0) 68%)`,
        }}
        className="pointer-events-none absolute inset-0 transition-all duration-700"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        {/* Header Bar ("Latest Work" + "Show all ->") */}
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-[#F5C451] sm:text-xs">
              SELECTED ARCHIVE // 0{total}
            </p>
            <h2 className="font-syne mt-1 text-2xl font-extrabold tracking-tight text-white sm:mt-2 sm:text-5xl">
              Latest <span className="text-[#FF1E00]">Work</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setViewMode((m) => (m === "carousel" ? "grid" : "carousel"))
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono-tech text-[11px] text-white/80 transition-colors hover:border-[#F5C451] hover:text-[#F5C451] sm:px-4 sm:py-2 sm:text-xs"
          >
            <span>{viewMode === "carousel" ? "Show all →" : "3D Stage →"}</span>
          </button>
        </div>

        {/* Centered Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:mt-8 sm:gap-2">
          {[
            { id: "all", label: "All" },
            { id: "featured", label: "Featured" },
            { id: "Django", label: "Django" },
            { id: "React", label: "React" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`cursor-pointer rounded-full px-3.5 py-1 font-mono-tech text-[11px] transition-all sm:px-4 sm:py-1.5 sm:text-xs ${
                  isActive
                    ? "bg-white font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {isDemoMode && (
          <p className="mt-2.5 text-center font-mono-tech text-[10px] text-[#F5C451]/80 sm:mt-4 sm:text-[11px]">
            Showing preview cards — add your projects in Django Admin to replace these automatically.
          </p>
        )}

        {/* VIEW 1: 3D CURVED PERSPECTIVE CAROUSEL */}
        {viewMode === "carousel" ? (
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="mt-4 select-none sm:mt-10"
          >
            {/* 3D Perspective Stage */}
            <div
              style={{ perspective: isMobile ? "950px" : "1200px" }}
              className="relative mx-auto flex h-[215px] w-full items-center justify-center sm:h-[380px]"
            >
              {filteredProjects.map((project, idx) => {
                const offset = getRelativeOffset(idx);
                if (Math.abs(offset) > 2) return null;

                const isCenter = offset === 0;
                const spread = isMobile ? 155 : 270;
                const translateX = offset * spread;
                const translateZ = isCenter
                  ? isMobile
                    ? 24
                    : 40
                  : -Math.abs(offset) * (isMobile ? 75 : 90);
                const rotateY = offset * (isMobile ? -22 : -24);
                const scale = isCenter
                  ? 1
                  : Math.abs(offset) === 1
                  ? isMobile
                    ? 0.84
                    : 0.88
                  : 0.72;
                const opacity = isCenter
                  ? 1
                  : Math.abs(offset) === 1
                  ? 0.62
                  : 0.25;

                return (
                  <motion.div
                    key={project.id}
                    onClick={() => {
                      if (isCenter) {
                        setSelectedProject(project);
                      } else {
                        setActiveIndex(idx);
                      }
                    }}
                    animate={{
                      x: translateX,
                      z: translateZ,
                      rotateY,
                      scale,
                      opacity,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 26,
                    }}
                    style={{
                      zIndex: 30 - Math.abs(offset) * 10,
                      transformStyle: "preserve-3d",
                    }}
                    className="group absolute w-[235px] cursor-pointer sm:w-[370px]"
                  >
                    {/* 4 Corner Crosshair '+' Reticles on Active Center Card */}
                    {isCenter && (
                      <>
                        <span className="pointer-events-none absolute -top-3 -left-3 font-mono-tech text-xs leading-none text-white/80 sm:-top-3.5 sm:-left-3.5 sm:text-sm">
                          +
                        </span>
                        <span className="pointer-events-none absolute -top-3 -right-3 font-mono-tech text-xs leading-none text-white/80 sm:-top-3.5 sm:-right-3.5 sm:text-sm">
                          +
                        </span>
                        <span className="pointer-events-none absolute -bottom-3 -left-3 font-mono-tech text-xs leading-none text-white/80 sm:-bottom-3.5 sm:-left-3.5 sm:text-sm">
                          +
                        </span>
                        <span className="pointer-events-none absolute -bottom-3 -right-3 font-mono-tech text-xs leading-none text-white/80 sm:-bottom-3.5 sm:-right-3.5 sm:text-sm">
                          +
                        </span>
                      </>
                    )}

                    {/* Project Card Surface */}
                    <div
                      style={{
                        borderColor: isCenter
                          ? `${project.accent_color || "#F5C451"}88`
                          : "rgba(255,255,255,0.12)",
                      }}
                      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-[#121216] shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-colors"
                    >
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          style={{
                            background: `linear-gradient(135deg, ${
                              project.accent_color || "#FF1E00"
                            } 0%, #111115 95%)`,
                          }}
                          className="flex h-full w-full flex-col justify-between p-4 sm:p-5"
                        >
                          <span className="font-mono-tech text-[9px] uppercase tracking-widest text-white/75 sm:text-[10px]">
                            CASE STUDY // 0{idx + 1}
                          </span>
                          <h4 className="font-display text-2xl uppercase tracking-tight text-white sm:text-4xl">
                            {project.title}
                          </h4>
                        </div>
                      )}

                      {/* Subtle Hover / Tap Inspect Badge */}
                      {isCenter && (
                        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-95 transition-opacity sm:p-4 sm:opacity-0 sm:group-hover:opacity-100">
                          <span className="rounded-full bg-black/75 px-2.5 py-0.5 font-mono-tech text-[10px] text-white backdrop-blur-md sm:px-3 sm:py-1 sm:text-[11px]">
                            Tap to inspect
                          </span>
                          <span
                            style={{
                              backgroundColor: project.accent_color || "#F5C451",
                            }}
                            className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Active Project Title, Subtitle, Tech Pills & Controls */}
            {activeProject && (
              <div className="mt-3 flex flex-col items-center text-center sm:mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="px-2"
                  >
                    <h3 className="font-syne text-lg font-bold text-white sm:text-2xl">
                      {activeProject.title}
                    </h3>
                    <p className="mt-0.5 font-mono-tech text-[11px] text-white/55 sm:mt-1 sm:text-xs">
                      {activeProject.subtitle || "Full-Stack Web Application"}
                    </p>

                    {/* Compact Tech Chips on Mobile */}
                    {(activeProject.tech_list || []).length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:hidden">
                        {activeProject.tech_list.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono-tech text-[9px] text-white/75"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Prev / Dots / Next Controls */}
                <div className="mt-4 flex items-center gap-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous project"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs text-white/80 transition-colors hover:border-[#F5C451] hover:text-[#F5C451] sm:h-9 sm:w-9 sm:text-sm"
                  >
                    ←
                  </button>

                  <div className="flex items-center gap-1.5">
                    {filteredProjects.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Select ${p.title}`}
                        className={`h-1.5 cursor-pointer rounded-full transition-all ${
                          i === activeIndex
                            ? "w-6 bg-[#F5C451]"
                            : "w-1.5 bg-white/25 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next project"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs text-white/80 transition-colors hover:border-[#F5C451] hover:text-[#F5C451] sm:h-9 sm:w-9 sm:text-sm"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: ALL PROJECTS GRID (Contained inside 100dvh on mobile) */
          <div className="mt-5 grid max-h-[60dvh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:mt-10 sm:max-h-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pr-0 lg:grid-cols-3">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] transition-all hover:-translate-y-1 hover:border-white/30"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#121216] sm:aspect-[16/10]">
                  {project.cover_image ? (
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      style={{
                        backgroundColor: project.accent_color || "#FF1E00",
                      }}
                      className="flex h-full w-full items-end p-4 sm:p-5"
                    >
                      <span className="font-display text-2xl uppercase text-white sm:text-3xl">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-syne text-base font-bold text-white sm:text-lg">
                      {project.title}
                    </h3>
                    <span className="font-mono-tech text-xs text-[#F5C451]">
                      View ↗
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">
                    {project.subtitle}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
                    {(project.tech_list || []).slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono-tech text-[10px] text-white/75"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* PROJECT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0E0E12] p-5 shadow-2xl sm:p-7"
            >
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/70 text-sm text-white hover:border-[#FF1E00] hover:text-[#FF1E00]"
              >
                ✕
              </button>

              {selectedProject.cover_image ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={selectedProject.cover_image}
                    alt={selectedProject.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: selectedProject.accent_color || "#FF1E00",
                  }}
                  className="flex aspect-[16/8] w-full items-end rounded-2xl p-6"
                >
                  <h3 className="font-display text-4xl uppercase text-white sm:text-5xl">
                    {selectedProject.title}
                  </h3>
                </div>
              )}

              <div className="mt-6">
                <p className="font-mono-tech text-xs uppercase tracking-widest text-[#F5C451]">
                  {selectedProject.subtitle || "Project Overview"}
                </p>
                <h3 className="font-syne mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                  {selectedProject.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                  {selectedProject.description}
                </p>

                {/* Tech Stack Chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {(selectedProject.tech_list || []).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 font-mono-tech text-xs text-white/85"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Links */}
                <div className="mt-7 flex flex-wrap gap-3">
                  {selectedProject.live_url && (
                    <a
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#F5C451] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 sm:text-sm"
                    >
                      Live Demo ↗
                    </a>
                  )}
                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-white sm:text-sm"
                    >
                      Source Code ↗
                    </a>
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