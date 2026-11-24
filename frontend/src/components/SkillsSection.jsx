import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_SKILLS = [
  { id: "s1", name: "Python", category: "backend", category_display: "Backend", icon_image: null, proficiency: 95 },
  { id: "s2", name: "Django & DRF", category: "backend", category_display: "Backend", icon_image: null, proficiency: 94 },
  { id: "s3", name: "React", category: "frontend", category_display: "Frontend", icon_image: null, proficiency: 92 },
  { id: "s4", name: "JavaScript (ES6+)", category: "frontend", category_display: "Frontend", icon_image: null, proficiency: 90 },
  { id: "s5", name: "PostgreSQL", category: "database", category_display: "Database", icon_image: null, proficiency: 88 },
  { id: "s6", name: "Git & GitHub", category: "tools", category_display: "Tools & DevOps", icon_image: null, proficiency: 89 },
];

const CATEGORIES = [
  { id: "all", label: "All Stack" },
  { id: "backend", label: "Backend" },
  { id: "frontend", label: "Frontend" },
  { id: "database", label: "Database" },
  { id: "tools", label: "Tools & DevOps" },
];

export default function SkillsSection({ skills = [] }) {
  const sourceSkills = skills.length > 0 ? skills : DEMO_SKILLS;
  const isDemoMode = skills.length === 0;
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSkills = useMemo(() => {
    if (selectedCategory === "all") return sourceSkills;
    return sourceSkills.filter((skill) => skill.category === selectedCategory);
  }, [sourceSkills, selectedCategory]);

  return (
    <section id="skills" className="relative overflow-hidden border-t border-white/10 py-20 sm:py-28">
      {/* Subtle Ambient Gold Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5C451]/[0.06] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.25em] text-[#F5C451]">
              CORE ARSENAL // 0{sourceSkills.length}
            </p>
            <h2 className="font-syne mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Tech <span className="text-[#F5C451]">Stack</span> & Skills
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 font-mono-tech text-xs transition-all ${
                    active
                      ? "bg-[#F5C451] font-bold text-black shadow-[0_0_20px_rgba(245,196,81,0.3)]"
                      : "border border-white/12 bg-white/[0.03] text-white/65 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {isDemoMode && (
          <p className="mt-4 font-mono-tech text-[11px] text-[#F5C451]/80">
            Showing default stack — add or remove skills with custom icons in Django Admin anytime.
          </p>
        )}

        {/* Animated Responsive Bento Grid */}
        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, index) => (
              <motion.div
                layout
                key={skill.id}
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#F5C451]/50 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Uploaded Skill Icon or Clean Monogram Fallback */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-[#111116] p-2 transition-transform duration-300 group-hover:scale-105">
                      {skill.icon_image ? (
                        <img
                          src={skill.icon_image}
                          alt={skill.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-display text-xl tracking-wider text-[#F5C451]">
                          {skill.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-syne text-base font-bold text-white sm:text-lg">
                        {skill.name}
                      </h3>
                      <span className="font-mono-tech text-[11px] uppercase tracking-wider text-white/45">
                        {skill.category_display || skill.category}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono-tech text-xs font-semibold text-[#F5C451]">
                    {skill.proficiency}%
                  </span>
                </div>

                {/* Animated Proficiency Bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(skill.proficiency, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#FF1E00] to-[#F5C451]"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}