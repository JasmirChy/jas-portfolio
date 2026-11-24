import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fetchAdminProfile, updateAdminProfile } from "../../api/portfolioApi";

export default function AdminProfileTab() {
  const [form, setForm] = useState({
    full_name: "",
    brand_name: "",
    hero_headline: "",
    bio: "",
    location: "",
    availability_status: "",
    resume_url: "",
  });
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProfile();
      setForm({
        full_name: data.full_name || "",
        brand_name: data.brand_name || "",
        hero_headline: data.hero_headline || "",
        bio: data.bio || "",
        location: data.location || "",
        availability_status: data.availability_status || "",
        resume_url: data.resume_url || "",
      });
      setCurrentAvatar(data.avatar || null);
      setPreviewUrl(null);
      setSelectedFile(null);
      setRemoveAvatarFlag(false);
    } catch {
      setMessage({ type: "error", text: "Failed to load profile settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatarFlag(false);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentAvatar(null);
    setRemoveAvatarFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("brand_name", form.brand_name);
      formData.append("hero_headline", form.hero_headline);
      formData.append("bio", form.bio);
      formData.append("location", form.location);
      formData.append("availability_status", form.availability_status);
      formData.append("resume_url", form.resume_url);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (removeAvatarFlag) {
        formData.append("remove_avatar", "true");
      }

      const updated = await updateAdminProfile(formData);
      setCurrentAvatar(updated.avatar || null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setRemoveAvatarFlag(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setMessage({
        type: "success",
        text: "Profile & photo saved to database. Live portfolio updated!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Could not save profile changes. Check your inputs and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 font-mono-tech text-xs text-white/50">
        LOADING PROFILE CONFIGURATION...
      </div>
    );
  }

  const displayedImage = previewUrl || currentAvatar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-7"
    >
      {message.text && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 font-mono-tech text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-[#FF1E00]/50 bg-[#FF1E00]/15 text-[#FF8A7A]"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* LEFT COLUMN: Profile Image Add / Replace / Remove Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6 lg:col-span-4">
          <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
            PORTRAIT MEDIA
          </p>
          <h3 className="font-syne mt-1 text-lg font-bold text-white">
            Profile Photo
          </h3>
          <p className="mt-1 text-xs text-white/55">
            Add, change, or remove your portrait displayed in the 3D About showcase.
          </p>

          {/* Live Image Preview Frame */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-[#14141B]">
            <div className="aspect-[4/5] w-full overflow-hidden">
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FF1E00]/25 via-[#14141B] to-[#08080A] p-6 text-center">
                  <span className="font-display text-5xl text-white/30">
                    {form.brand_name || "JAS"}
                  </span>
                  <span className="mt-2 font-mono-tech text-[11px] text-white/45">
                    No profile photo set
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Add / Change & Remove Buttons */}
          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer rounded-xl border border-[#F5C451]/60 bg-[#F5C451]/15 py-2.5 font-mono-tech text-xs font-bold text-[#F5C451] transition-colors hover:bg-[#F5C451] hover:text-black"
            >
              {displayedImage ? "↻ Change / Replace Photo" : "+ Upload Profile Photo"}
            </button>

            {displayedImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full cursor-pointer rounded-xl border border-[#FF1E00]/45 bg-[#FF1E00]/10 py-2.5 font-mono-tech text-xs font-semibold text-[#FF8A7A] transition-colors hover:bg-[#FF1E00] hover:text-white"
              >
                ✕ Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Identity, Headline, Bio & Availability Fields */}
        <div className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6 lg:col-span-8">
          <p className="font-mono-tech text-[11px] uppercase tracking-widest text-[#F5C451]">
            IDENTITY & STATUS
          </p>
          <h3 className="font-syne mt-1 text-lg font-bold text-white">
            Portfolio Details
          </h3>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Brand Monogram (Hero Display)
              </label>
              <input
                type="text"
                required
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              Hero Headline
            </label>
            <input
              type="text"
              required
              value={form.hero_headline}
              onChange={(e) => setForm({ ...form, hero_headline: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
            />
          </div>

          <div className="mt-4">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              About Bio
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Base Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase text-white/60">
                Availability Status
              </label>
              <input
                type="text"
                value={form.availability_status}
                onChange={(e) =>
                  setForm({ ...form, availability_status: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#F5C451]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-mono-tech text-[11px] uppercase text-white/60">
              Resume / CV URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={form.resume_url}
              onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#F5C451]"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-[#FF1E00] to-[#D9381E] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,30,0,0.35)] transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? "SAVING CHANGES..." : "Save Profile Settings ✓"}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}