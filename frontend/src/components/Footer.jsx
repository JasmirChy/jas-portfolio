import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactForm from "./ContactForm";

export default function Footer({ profile, socials = [], onOpenAdmin }) {
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const brandName = profile?.brand_name || "JAS";
  const fullName = profile?.full_name || "Jasmir Chaudhary";

  const emailItem = socials.find((s) => s.platform === "email");
  const rawEmail = emailItem
    ? emailItem.url.replace(/^mailto:/i, "")
    : "hello@jasmirchaudhary.com.np";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(rawEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const marqueeItems = [
    "PYTHON",
    "DJANGO",
    "REACT",
    "POSTGRESQL",
    "FULL-STACK ARCHITECTURE",
    "UI/UX MOTION",
  ];

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-white/10 bg-[#060608] pt-14 pb-12">
      {/* Kinetic Infinite Marquee */}
      <div className="relative flex overflow-x-hidden border-y border-white/10 bg-white/[0.02] py-3.5 select-none">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex shrink-0 items-center gap-8 whitespace-nowrap pr-8"
        >
          {[...marqueeItems, ...marqueeItems].map((word, idx) => (
            <span
              key={idx}
              className="flex items-center gap-8 font-display text-2xl tracking-wider text-white/25 sm:text-3xl"
            >
              <span>{word}</span>
              <span className="text-[#FF1E00]">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Main Contact CTA Box */}
      <div className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-[#FF1E00]/20 via-[#0E0E12] to-[#08080A] p-7 sm:p-12">
          <div className="film-grain pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono-tech text-xs uppercase tracking-[0.25em] text-[#F5C451]">
                LET&apos;S BUILD TOGETHER
              </p>
              <h2 className="font-display mt-3 text-5xl leading-[0.9] uppercase tracking-tight text-white sm:text-7xl">
                Got a bold <span className="text-[#F5C451]">idea?</span>
              </h2>
              <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                Available for freelance web applications, full-stack product builds, and creative collaborations.
              </p>
            </div>

            {/* Interactive Form Toggle + Copy Email Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#FF1E00] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,30,0,0.4)] transition-transform hover:scale-105 sm:text-sm"
              >
                {showForm ? "Close Form ✕" : "Say Hello ↗"}
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/50 px-5 py-3 font-mono-tech text-xs text-white/90 backdrop-blur-md transition-colors hover:border-[#F5C451] hover:text-[#F5C451]"
              >
                {copied ? "✓ Email Copied!" : rawEmail}
              </button>
            </div>
          </div>

          {/* Expandable Interactive Contact Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative z-10 overflow-hidden"
              >
                <div className="mt-8 border-t border-white/10 pt-8">
                  <ContactForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Dynamic Social Links Row */}
          {socials.length > 0 && (
            <div className="relative z-10 mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              {socials.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.platform === "email" ? "_self" : "_blank"}
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono-tech text-xs text-white/75 transition-all hover:border-white hover:bg-white hover:text-black"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Copyright & Quick Admin / Back-to-top Links */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 font-mono-tech text-xs text-white/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brandName} ({fullName}). All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {onOpenAdmin ? (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="cursor-pointer transition-colors hover:text-[#F5C451]"
              >
                Admin Portal
              </button>
            ) : (
              <a
                href="/admin"
                className="transition-colors hover:text-[#F5C451]"
              >
                Admin Portal
              </a>
            )}
            <a href="#top" className="transition-colors hover:text-white">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}