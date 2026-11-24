import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAdminSocials,
  createAdminSocial,
  updateAdminSocial,
  deleteAdminSocial,
} from "../../api/portfolioApi";

const PLATFORM_OPTIONS = [
  { value: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-handle" },
  { value: "github", label: "GitHub", placeholder: "https://github.com/your-username" },
  { value: "instagram", label: "Instagram", placeholder: "https://instagram.com/your-handle" },
  { value: "email", label: "Email", placeholder: "mailto:you@example.com" },
  { value: "youtube", label: "YouTube", placeholder: "https://youtube.com/@your-channel" },
  { value: "x", label: "X (Twitter)", placeholder: "https://x.com/your-handle" },
  { value: "website", label: "Website", placeholder: "https://yourwebsite.com" },
  { value: "other", label: "Other", placeholder: "https://..." },
];

const EMPTY_FORM = {
  platform: "linkedin",
  label: "LinkedIn",
  url: "",
  order: 0,
  is_active: true,
};

export default function AdminSocialsTab() {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadSocials = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSocials();
      setSocials(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load social links from database." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocials();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: socials.length });
  };

  const handlePlatformChange = (newPlatform) => {
    const matched = PLATFORM_OPTIONS.find((p) => p.value === newPlatform);
    const prevMatched = PLATFORM_OPTIONS.find((p) => p.value === form.platform);

    // Auto-update label if user hasn't typed a custom label yet
    const shouldAutoLabel = !form.label || form.label === prevMatched?.label;

    setForm({
      ...form,
      platform: newPlatform,
      label: shouldAutoLabel && matched ? matched.label : form.label,
    });
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setForm({
      platform: item.platform || "website",
      label: item.label || "",
      url: item.url || "",
      order: item.order ?? 0,
      is_active: item.is_active !== false,
    });
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let normalizedUrl = form.url.trim();
      if (
        form.platform === "email" &&
        normalizedUrl &&
        !normalizedUrl.toLowerCase().startsWith("mailto:")
      ) {
        normalizedUrl = `mailto:${normalizedUrl}`;
      }

      const payload = {
        platform: form.platform,
        label: form.label.trim(),
        url: normalizedUrl,
        order: Number(form.order) || 0,
        is_active: Boolean(form.is_active),
      };

      if (editingId) {
        await updateAdminSocial(editingId, payload);
        setMessage({
          type: "success",
          text: `Link "${payload.label}" updated! Live Hero & Footer synced.`,
        });
      } else {
        await createAdminSocial(payload);
        setMessage({
          type: "success",
          text: `Link "${payload.label}" added to your Hero & Contact Footer!`,
        });
      }

      await loadSocials();
      resetForm();
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save link. Check all required fields and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const nextState = !(item.is_active !== false);
      await updateAdminSocial(item.id, { is_active: nextState });
      setMessage({
        type: "success",
        text: `"${item.label}" is now ${nextState ? "visible" : "hidden"} on the public site.`,
      });
      await loadSocials();
    } catch {
      setMessage({ type: "error", text: "Could not update link visibility." });
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteAdminSocial(item.id);
      if (editingId === item.id) resetForm();
      setConfirmDeleteId(null);
      setMessage({
        type: "success",
        text: `Deleted "${item.label}" from your social links.`,
      });
      await loadSocials();
    } catch {
      setMessage({ type: "error", text: "Could not delete social link." });
    }
  };

  const activePlatformMeta =
    PLATFORM_OPTIONS.find((p) => p.value === form.platform) || PLATFORM_OPTIONS[0];

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

      {/* ADD / EDIT SOCIAL LINK FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
              {editingId ? `EDITING_LINK // #${editingId}` : "NEW_CHANNEL // HERO & FOOTER"}
            </p>
            <h3 className="font-syne mt-0.5 text-xl font-bold text-white">
              {editingId ? `Edit Link: ${form.label}` : "Add Social or Contact Link"}
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

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {/* Platform Selector */}
          <div className="lg:col-span-3">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              Platform *
            </label>
            <select
              value={form.platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#14141B] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Display Label */}
          <div className="lg:col-span-3">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              Button Label *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., LinkedIn, GitHub, Email"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
            />
          </div>

          {/* Target URL / Email */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              {form.platform === "email" ? "Email Address or mailto: *" : "Profile URL *"}
            </label>
            <input
              type="text"
              required
              placeholder={activePlatformMeta.placeholder}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
            />
          </div>

          {/* Sort Order */}
          <div className="lg:col-span-2">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              Order
            </label>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 font-mono-tech text-sm text-white outline-none focus:border-[#F5C451]"
            />
          </div>
        </div>

        {/* Live Pill Preview + Active Checkbox + Submit */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex cursor-pointer items-center gap-2 font-mono-tech text-xs text-white/85">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 accent-[#F5C451]"
              />
              <span>Visible on Public Site</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-mono-tech text-[10px] uppercase text-white/45">
                PILL PREVIEW:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C451]/60 bg-white/[0.06] px-3.5 py-1 text-xs font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5C451]" />
                {form.label || "Label"}
              </span>
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
              ? "Update Link ✓"
              : "+ Add Social Link"}
          </button>
        </div>
      </form>

      {/* EXISTING SOCIAL LINKS DIRECTORY */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6">
        <div>
          <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
            ACTIVE CHANNELS // 0{socials.length} LINKS
          </p>
          <h3 className="font-syne mt-0.5 text-lg font-bold text-white">
            Connected Social & Contact Links
          </h3>
        </div>

        {loading ? (
          <p className="mt-6 font-mono-tech text-xs text-white/50">
            LOADING SOCIAL LINKS...
          </p>
        ) : socials.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center font-mono-tech text-xs text-white/50">
            No social links configured yet. Add your LinkedIn, GitHub, Instagram, or Email above!
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            <AnimatePresence>
              {socials.map((item) => {
                const isVisible = item.is_active !== false;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-white/15 bg-white/[0.05] px-2 py-0.5 font-mono-tech text-[10px] uppercase text-[#F5C451]">
                          {item.platform}
                        </span>
                        <h4 className="font-syne text-base font-bold text-white">
                          {item.label}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono-tech text-[9px] font-bold ${
                            isVisible
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/10 text-white/45"
                          }`}
                        >
                          {isVisible ? "VISIBLE" : "HIDDEN"}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono-tech text-xs text-white/55">
                        {item.url}
                      </p>
                    </div>

                    {/* Visibility Toggle, Edit & Delete Controls */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono-tech text-xs text-white/75 transition-colors hover:border-white hover:text-white"
                      >
                        {isVisible ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono-tech text-xs text-white/85 transition-colors hover:border-[#F5C451] hover:text-[#F5C451]"
                      >
                        Edit
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
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
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="cursor-pointer rounded-lg border border-[#FF1E00]/40 bg-[#FF1E00]/10 px-3 py-1.5 font-mono-tech text-xs text-[#FF8A7A] transition-colors hover:bg-[#FF1E00] hover:text-white"
                        >
                          Delete
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