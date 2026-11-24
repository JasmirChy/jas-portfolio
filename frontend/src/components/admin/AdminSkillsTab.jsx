import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
} from "../../api/portfolioApi";

const CATEGORY_OPTIONS = [
  { value: "backend", label: "Backend", code: "SYS.BE" },
  { value: "frontend", label: "Frontend", code: "SYS.FE" },
  { value: "database", label: "Database", code: "SYS.DB" },
  { value: "tools", label: "Tools & DevOps", code: "SYS.OP" },
];

const LAYER_MAP = {
  backend: "SYS.BE",
  frontend: "SYS.FE",
  database: "SYS.DB",
  tools: "SYS.OP",
};

const EMPTY_FORM = {
  name: "",
  category: "backend",
  order: 0,
};

export default function AdminSkillsTab() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeIconFlag, setRemoveIconFlag] = useState(false);

  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSkills();
      setSkills(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load skills from database." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: skills.length });
    setCurrentIcon(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveIconFlag(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (skill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name || "",
      category: skill.category || "backend",
      order: skill.order ?? 0,
    });
    setCurrentIcon(skill.icon_image || null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveIconFlag(false);
    setMessage({ type: "", text: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveIconFlag(false);
  };

  const handleRemoveIcon = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentIcon(null);
    setRemoveIconFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("category", form.category);
      formData.append("order", String(Number(form.order) || 0));

      if (selectedFile) {
        formData.append("icon_image", selectedFile);
      } else if (editingId && removeIconFlag) {
        formData.append("remove_icon_image", "true");
      }

      if (editingId) {
        await updateAdminSkill(editingId, formData);
        setMessage({
          type: "success",
          text: `Module "${form.name}" updated in Quantum Stack Schematic!`,
        });
      } else {
        await createAdminSkill(formData);
        setMessage({
          type: "success",
          text: `Module "${form.name}" added to your live tech constellation!`,
        });
      }

      await loadSkills();
      resetForm();
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save skill node. Ensure the name is valid and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skill) => {
    try {
      await deleteAdminSkill(skill.id);
      if (editingId === skill.id) resetForm();
      setConfirmDeleteId(null);
      setMessage({
        type: "success",
        text: `Removed "${skill.name}" from your tech stack.`,
      });
      await loadSkills();
    } catch {
      setMessage({ type: "error", text: "Could not delete skill module." });
    }
  };

  const displayedIcon = previewUrl || currentIcon;
  const previewName = form.name.trim() || "Skill Name";
  const previewLayer = LAYER_MAP[form.category] || "SYS.IO";

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

      {/* ADD / EDIT SKILL MODULE FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
              {editingId ? `EDITING_NODE // #${editingId}` : "NEW_NODE // QUANTUM SCHEMATIC"}
            </p>
            <h3 className="font-syne mt-0.5 text-xl font-bold text-white">
              {editingId ? `Edit Module: ${form.name}` : "Add Tech Stack Module"}
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
          {/* LEFT: Live Schematic Chip Preview & Icon Controls */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#09090D] p-5 lg:col-span-5">
            <div>
              <p className="font-mono-tech text-[10px] uppercase tracking-widest text-white/45">
                LIVE NODE PREVIEW
              </p>

              {/* Live Chip Replica */}
              <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#060608] py-7">
                <div className="relative flex items-center gap-3 rounded-xl border border-[#F5C451] bg-[#14141B] px-4 py-3 shadow-[0_0_30px_rgba(245,196,81,0.22)]">
                  <span className="pointer-events-none absolute top-1 left-1 h-1.5 w-1.5 border-t border-l border-[#FF1E00]" />
                  <span className="pointer-events-none absolute right-1 bottom-1 h-1.5 w-1.5 border-r border-b border-[#F5C451]" />

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F5C451]/60 bg-[#F5C451]/15 p-1.5">
                    {displayedIcon ? (
                      <img
                        src={displayedIcon}
                        alt="Icon Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="font-display text-base tracking-wider text-[#F5C451]">
                        {previewName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-mono-tech text-[9px] tracking-widest text-white/50">
                      <span className="text-[#F5C451]">
                        0x{String((Number(form.order) || 0) + 1).padStart(2, "0")}
                      </span>
                      <span>•</span>
                      <span>{previewLayer}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-syne text-sm font-bold text-white">
                        {previewName}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full cursor-pointer rounded-xl border border-[#F5C451]/60 bg-[#F5C451]/15 py-2 font-mono-tech text-xs font-bold text-[#F5C451] transition-colors hover:bg-[#F5C451] hover:text-black"
              >
                {displayedIcon ? "↻ Replace Icon (SVG/PNG)" : "+ Upload Custom Icon"}
              </button>

              {displayedIcon && (
                <button
                  type="button"
                  onClick={handleRemoveIcon}
                  className="w-full cursor-pointer rounded-xl border border-[#FF1E00]/45 bg-[#FF1E00]/10 py-2 font-mono-tech text-xs font-semibold text-[#FF8A7A] transition-colors hover:bg-[#FF1E00] hover:text-white"
                >
                  ✕ Remove Icon (Use Monogram)
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Node Name, Architectural Layer & Order */}
          <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
            <div className="space-y-4">
              <div>
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  Technology / Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Python, Django, React, PostgreSQL"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
                />
              </div>

              <div>
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  Architecture Layer *
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const selected = form.category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, category: opt.value })}
                        className={`cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
                          selected
                            ? "border-[#F5C451] bg-[#F5C451]/15 text-white"
                            : "border-white/12 bg-white/[0.03] text-white/60 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <span className="block font-mono-tech text-[10px] text-[#FF1E00]">
                          {opt.code}
                        </span>
                        <span className="mt-0.5 block font-syne text-xs font-bold">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="max-w-[180px]">
                <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                  Orbital Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 font-mono-tech text-sm text-white outline-none focus:border-[#F5C451]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#FF1E00] to-[#D9381E] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,30,0,0.35)] transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {saving
                  ? "DEPLOYING..."
                  : editingId
                  ? "Update Skill Node ✓"
                  : "+ Deploy Skill Node"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ACTIVE SKILL NODES DIRECTORY */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6">
        <div>
          <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
            ACTIVE CONSTELLATION // 0{skills.length} NODES
          </p>
          <h3 className="font-syne mt-0.5 text-lg font-bold text-white">
            Deployed Stack Modules
          </h3>
        </div>

        {loading ? (
          <p className="mt-6 font-mono-tech text-xs text-white/50">
            LOADING STACK NODES...
          </p>
        ) : skills.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center font-mono-tech text-xs text-white/50">
            No custom skill nodes in database yet. Add your first module above!
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {skills.map((skill, idx) => {
                const hexAddr = `0x${String(idx + 1).padStart(2, "0")}`;
                const layerCode = LAYER_MAP[skill.category] || "SYS.IO";

                return (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 transition-colors hover:border-white/25"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-[#14141B] p-1.5">
                        {skill.icon_image ? (
                          <img
                            src={skill.icon_image}
                            alt={skill.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="font-display text-base text-[#F5C451]">
                            {skill.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-mono-tech text-[9px] text-white/45">
                          <span className="text-[#F5C451]">{hexAddr}</span>
                          <span>•</span>
                          <span>{layerCode}</span>
                        </div>
                        <h4 className="truncate font-syne text-sm font-bold text-white">
                          {skill.name}
                        </h4>
                      </div>
                    </div>

                    {/* Edit / Delete Controls */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditClick(skill)}
                        className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono-tech text-[11px] text-white/85 transition-colors hover:border-[#F5C451] hover:text-[#F5C451]"
                      >
                        Edit
                      </button>

                      {confirmDeleteId === skill.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(skill)}
                            className="cursor-pointer rounded-lg bg-[#FF1E00] px-2 py-1 font-mono-tech text-[11px] font-bold text-white"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="cursor-pointer rounded-lg border border-white/15 px-1.5 py-1 font-mono-tech text-[11px] text-white/60"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(skill.id)}
                          className="cursor-pointer rounded-lg border border-[#FF1E00]/40 bg-[#FF1E00]/10 px-2.5 py-1 font-mono-tech text-[11px] text-[#FF8A7A] transition-colors hover:bg-[#FF1E00] hover:text-white"
                        >
                          Del
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}