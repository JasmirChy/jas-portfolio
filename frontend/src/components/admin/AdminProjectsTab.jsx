import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
} from "../../api/portfolioApi";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  description: "",
  accent_color: "#FF1E00",
  tech_stack: "Python, Django, React, PostgreSQL",
  live_url: "",
  github_url: "",
  featured: true,
  order: 0,
};

const ACCENT_PRESETS = [
  { label: "Crimson", hex: "#FF1E00" },
  { label: "Cinema Amber", hex: "#F5C451" },
  { label: "Vermilion", hex: "#D9381E" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Cobalt", hex: "#3B82F6" },
];

export default function AdminProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentCover, setCurrentCover] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeCoverFlag, setRemoveCoverFlag] = useState(false);

  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProjects();
      setProjects(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load projects from database." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: projects.length });
    setCurrentCover(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveCoverFlag(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || "",
      subtitle: project.subtitle || "",
      description: project.description || "",
      accent_color: project.accent_color || "#FF1E00",
      tech_stack: project.tech_stack || "",
      live_url: project.live_url || "",
      github_url: project.github_url || "",
      featured: Boolean(project.featured),
      order: project.order ?? 0,
    });
    setCurrentCover(project.cover_image || null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveCoverFlag(false);
    setMessage({ type: "", text: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveCoverFlag(false);
  };

  const handleRemoveCover = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentCover(null);
    setRemoveCoverFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description);
      formData.append("accent_color", form.accent_color);
      formData.append("tech_stack", form.tech_stack);
      formData.append("live_url", form.live_url);
      formData.append("github_url", form.github_url);
      formData.append("featured", form.featured ? "true" : "false");
      formData.append("order", String(Number(form.order) || 0));

      if (selectedFile) {
        formData.append("cover_image", selectedFile);
      } else if (editingId && removeCoverFlag) {
        formData.append("remove_cover_image", "true");
      }

      if (editingId) {
        await updateAdminProject(editingId, formData);
        setMessage({
          type: "success",
          text: `Project "${form.title}" updated! Changes are live on your 3D carousel.`,
        });
      } else {
        await createAdminProject(formData);
        setMessage({
          type: "success",
          text: `Project "${form.title}" published to your portfolio!`,
        });
      }

      await loadProjects();
      resetForm();
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save project. Verify URLs start with https:// and required fields are filled.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    try {
      await deleteAdminProject(project.id);
      if (editingId === project.id) resetForm();
      setConfirmDeleteId(null);
      setMessage({
        type: "success",
        text: `Deleted "${project.title}" from your portfolio.`,
      });
      await loadProjects();
    } catch {
      setMessage({ type: "error", text: "Could not delete project." });
    }
  };

  const displayedCover = previewUrl || currentCover;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-7 space-y-8"
    >
      {message.text && (
        <div
          className={`rounded-xl border px-4 py-3 font-mono-tech text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-[#FF1E00]/50 bg-[#FF1E00]/15 text-[#FF8A7A]"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ADD / EDIT PROJECT FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
              {editingId ? `EDITING_ID // #${editingId}` : "NEW_DEPLOYMENT // 3D STAGE"}
            </p>
            <h3 className="font-syne mt-0.5 text-xl font-bold text-white">
              {editingId ? `Edit Project: ${form.title}` : "Add New Project"}
            </h3>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono-tech text-xs text-white/75 hover:border-white hover:text-white"
            >
              ✕ Cancel Edit
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Cover Image Upload & Preview */}
          <div className="lg:col-span-4">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              Cover Image (16:10 Ratio Recommended)
            </label>

            <div className="mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#14141B]">
              <div className="aspect-[16/10] w-full overflow-hidden">
                {displayedCover ? (
                  <img
                    src={displayedCover}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${form.accent_color} 0%, #111115 95%)`,
                    }}
                    className="flex h-full w-full flex-col justify-between p-4"
                  >
                    <span className="font-mono-tech text-[10px] uppercase tracking-widest text-white/75">
                      FALLBACK CARD PREVIEW
                    </span>
                    <span className="font-display text-2xl uppercase text-white">
                      {form.title || "PROJECT TITLE"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full cursor-pointer rounded-xl border border-[#F5C451]/60 bg-[#F5C451]/15 py-2 font-mono-tech text-xs font-bold text-[#F5C451] transition-colors hover:bg-[#F5C451] hover:text-black"
              >
                {displayedCover ? "↻ Replace Cover Image" : "+ Upload Cover Image"}
              </button>

              {displayedCover && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="w-full cursor-pointer rounded-xl border border-[#FF1E00]/45 bg-[#FF1E00]/10 py-2 font-mono-tech text-xs font-semibold text-[#FF8A7A] transition-colors hover:bg-[#FF1E00] hover:text-white"
                >
                  ✕ Remove Cover Image
                </button>
              )}
            </div>

            {/* Accent Color Picker */}
            <div className="mt-5">
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Card Spotlight Accent
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    title={preset.label}
                    onClick={() => setForm({ ...form, accent_color: preset.hex })}
                    style={{ backgroundColor: preset.hex }}
                    className={`h-7 w-7 cursor-pointer rounded-full border-2 transition-transform ${
                      form.accent_color.toLowerCase() === preset.hex.toLowerCase()
                        ? "scale-115 border-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  />
                ))}
                <input
                  type="text"
                  value={form.accent_color}
                  onChange={(e) =>
                    setForm({ ...form, accent_color: e.target.value })
                  }
                  className="w-24 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono-tech text-xs text-white outline-none focus:border-[#F5C451]"
                />
              </div>
            </div>
          </div>

          {/* Project Details Fields */}
          <div className="space-y-4 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NepWork"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
                />
              </div>

              <div>
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  Subtitle / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g., Freelance & Service Marketplace"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what the project solves, architecture highlights, and key features..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Tech Stack (Comma-Separated — powers carousel filters)
              </label>
              <input
                type="text"
                placeholder="Python, Django, React, PostgreSQL"
                value={form.tech_stack}
                onChange={(e) =>
                  setForm({ ...form, tech_stack: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://yourproject.com"
                  value={form.live_url}
                  onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
                />
              </div>

              <div>
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  GitHub Repository URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={form.github_url}
                  onChange={(e) =>
                    setForm({ ...form, github_url: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2.5 font-mono-tech text-xs text-white/85">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#F5C451]"
                  />
                  <span>Featured Project</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="font-mono-tech text-xs text-white/60">
                    Sort Order:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-16 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-center font-mono-tech text-xs text-white outline-none focus:border-[#F5C451]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#FF1E00] to-[#D9381E] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,30,0,0.35)] transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {saving
                  ? "SAVING..."
                  : editingId
                  ? "Update Project ✓"
                  : "+ Publish Project"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* EXISTING PROJECTS LIST */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
              DATABASE ARCHIVE // 0{projects.length} ITEMS
            </p>
            <h3 className="font-syne mt-0.5 text-lg font-bold text-white">
              Published Projects
            </h3>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 font-mono-tech text-xs text-white/50">
            LOADING PROJECTS...
          </p>
        ) : projects.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center font-mono-tech text-xs text-white/50">
            No projects in database yet. Use the form above to add your first project!
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/25"
                >
                  <div className="flex gap-4">
                    {/* Cover Thumbnail */}
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#14141B]">
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: project.accent_color || "#FF1E00" }}
                          className="flex h-full w-full items-center justify-center p-2 text-center font-display text-sm uppercase text-white"
                        >
                          {project.title.slice(0, 10)}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-syne text-base font-bold text-white">
                          {project.title}
                        </h4>
                        {project.featured && (
                          <span className="shrink-0 rounded-full bg-[#F5C451]/15 px-2 py-0.5 font-mono-tech text-[9px] font-bold text-[#F5C451]">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-white/55">
                        {project.subtitle || "Full-Stack Project"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(project.tech_list || []).slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono-tech text-[9px] text-white/70"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-mono-tech text-[10px] text-white/40">
                      ORDER: #{project.order}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(project)}
                        className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono-tech text-xs text-white/85 transition-colors hover:border-[#F5C451] hover:text-[#F5C451]"
                      >
                        Edit
                      </button>

                      {confirmDeleteId === project.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(project)}
                            className="cursor-pointer rounded-lg bg-[#FF1E00] px-2.5 py-1.5 font-mono-tech text-xs font-bold text-white"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="cursor-pointer rounded-lg border border-white/15 px-2 py-1.5 font-mono-tech text-xs text-white/60"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(project.id)}
                          className="cursor-pointer rounded-lg border border-[#FF1E00]/40 bg-[#FF1E00]/10 px-3 py-1.5 font-mono-tech text-xs text-[#FF8A7A] transition-colors hover:bg-[#FF1E00] hover:text-white"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}