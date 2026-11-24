import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendContactMessage } from "../api/portfolioApi";

const QUICK_TOPICS = [
  "Full-Stack Build",
  "Freelance Project",
  "UI/UX & Frontend",
  "Collaboration",
];

export default function ContactForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTopicSelect = (topic) => {
    setForm((prev) => ({
      ...prev,
      subject: prev.subject === topic ? "" : topic,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      await sendContactMessage(form);
      setStatus({
        type: "success",
        text: "Transmission received! I will reply to your inbox shortly.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      const apiDetail =
        err?.response?.data?.detail ||
        (err?.response?.data?.email && `Email: ${err.response.data.email[0]}`) ||
        "Transmission failed. Please check your connection and try again.";
      setStatus({
        type: "error",
        text: apiDetail,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl rounded-2xl border border-white/12 bg-[#09090D]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-6">
      {/* 4 Corner Tactical Micro-Brackets */}
      <span className="pointer-events-none absolute top-2 left-2 h-2.5 w-2.5 border-t border-l border-[#FF1E00]" />
      <span className="pointer-events-none absolute top-2 right-2 h-2.5 w-2.5 border-t border-r border-[#F5C451]" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-[#F5C451]" />
      <span className="pointer-events-none absolute right-2 bottom-2 h-2.5 w-2.5 border-r border-b border-[#FF1E00]" />

      {/* Top Comm-Channel Telemetry Header */}
      <div className="mb-3.5 flex items-center justify-between border-b border-white/10 pb-2.5 font-mono-tech text-[10px] tracking-widest text-white/55 sm:mb-5 sm:text-[11px]">
        <span className="flex items-center gap-2 text-[#F5C451]">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              loading
                ? "animate-ping bg-[#F5C451]"
                : "animate-pulse bg-emerald-400"
            }`}
          />
          <span>{loading ? "TRANSMITTING_PACKET..." : "DIRECT_UPLINK // READY"}</span>
        </span>
        <span className="hidden sm:inline">TLS // RESEND_API</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Row 1: Name & Email (Side-by-side even on mobile for compact 100dvh fit) */}
        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-4">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-1 block font-mono-tech text-[9px] uppercase tracking-widest text-white/50 sm:text-[10px]"
            >
              01 // YOUR NAME *
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              placeholder="Jasmir / Alex"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-white/30 transition-colors focus:border-[#F5C451] focus:bg-black/90 focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1 block font-mono-tech text-[9px] uppercase tracking-widest text-white/50 sm:text-[10px]"
            >
              02 // RETURN EMAIL *
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              placeholder="you@domain.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-white/30 transition-colors focus:border-[#F5C451] focus:bg-black/90 focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
            />
          </div>
        </div>

        {/* Row 2: Subject + One-Tap Mobile Topic Chips */}
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <label
              htmlFor="contact-subject"
              className="font-mono-tech text-[9px] uppercase tracking-widest text-white/50 sm:text-[10px]"
            >
              03 // SUBJECT TAG
            </label>

            {/* Quick-Select Topic Pills */}
            <div className="flex flex-wrap gap-1">
              {QUICK_TOPICS.map((topic) => {
                const selected = form.subject === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicSelect(topic)}
                    className={`cursor-pointer rounded-full px-2 py-0.5 font-mono-tech text-[8.5px] transition-all sm:px-2.5 sm:text-[9.5px] ${
                      selected
                        ? "bg-[#F5C451] font-bold text-black"
                        : "border border-white/10 bg-white/[0.03] text-white/55 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <input
            id="contact-subject"
            type="text"
            name="subject"
            placeholder="Project scope, timeline, or topic..."
            value={form.subject}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/12 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-white/30 transition-colors focus:border-[#F5C451] focus:bg-black/90 focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>

        {/* Row 3: Message Payload */}
        <div>
          <div className="mb-1 flex items-center justify-between font-mono-tech text-[9px] uppercase tracking-widest text-white/50 sm:text-[10px]">
            <label htmlFor="contact-message">04 // MESSAGE PAYLOAD *</label>
            <span className="text-white/35">{form.message.length} CHARS</span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            required
            placeholder="Tell me about what we are building together..."
            value={form.message}
            onChange={handleChange}
            className="h-20 w-full resize-none rounded-xl border border-white/12 bg-black/60 px-3.5 py-2.5 text-xs leading-relaxed text-white placeholder-white/30 transition-colors focus:border-[#F5C451] focus:bg-black/90 focus:outline-none sm:h-28 sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>

        {/* Animated Status Banner */}
        <AnimatePresence mode="wait">
          {status.text && (
            <motion.div
              key={status.text}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 font-mono-tech text-[11px] sm:text-xs ${
                status.type === "success"
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                  : "border-[#FF1E00]/40 bg-[#FF1E00]/10 text-red-300"
              }`}
            >
              <span>{status.type === "success" ? "✓" : "✕"}</span>
              <span>{status.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Action Bar */}
        <div className="flex flex-col justify-between gap-3 pt-1 sm:flex-row sm:items-center">
          <span className="hidden font-mono-tech text-[10px] text-white/40 sm:inline">
            AVG RESPONSE TIME: &lt; 24 HRS
          </span>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="relative inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-[#FF1E00] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(255,30,0,0.4)] transition hover:bg-[#ff3319] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7 sm:text-sm"
          >
            {loading && (
              <motion.span
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
            )}
            <span>{loading ? "Transmitting..." : "Send Message ↗"}</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}