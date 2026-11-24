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
    <footer
      id="contact"
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden border-t border-white/10 bg-[#060608] pt-16 pb-6 sm:block sm:min-h-0 sm:pt-14 sm:pb-12"
    >
      {/* Kinetic Infinite Marquee */}
      <div className="relative flex overflow-x-hidden border-y border-white/10 bg-white/[0.02] py-2.5 select-none sm:py-3.5">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 sm:gap-8 sm:pr-8"
        >
          {[...marqueeItems, ...marqueeItems].map((word, idx) => (
            <span
              key={idx}
              className="flex items-center gap-6 font-display text-xl tracking-wider text-white/25 sm:gap-8 sm:text-3xl"
            >
              <span>{word}</span>
              <span className="text-[#FF1E00]">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Main Contact CTA Box */}
      <div className="mx-auto my-auto w-full max-w-6xl px-4 py-4 sm:my-0 sm:mt-16 sm:px-8 sm:py-0">
        <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-gradient-to-br from-[#FF1E00]/20 via-[#0E0E12] to-[#08080A] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.85)] sm:rounded-[28px] sm:p-12">
          <div className="film-grain pointer-events-none absolute inset-0 opacity-30" />

          {/* Corner Tactical Crosshairs */}
          <span className="pointer-events-none absolute top-3 left-3 font-mono-tech text-[10px] text-[#F5C451]/60 sm:top-4 sm:left-4">
            +
          </span>
          <span className="pointer-events-none absolute top-3 right-3 font-mono-tech text-[10px] text-[#F5C451]/60 sm:top-4 sm:right-4">
            +
          </span>

          <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-[#F5C451] sm:text-xs">
                LET&apos;S BUILD TOGETHER
              </p>
              <h2
                className={`font-display mt-2 leading-[0.92] uppercase tracking-tight text-white transition-all sm:mt-3 sm:text-7xl ${
                  showForm ? "text-3xl" : "text-4xl"
                }`}
              >
                Got a bold <span className="text-[#F5C451]">idea?</span>
              </h2>
              <p
                className={`mt-3 max-w-md text-xs text-white/70 sm:mt-4 sm:text-base ${
                  showForm ? "hidden sm:block" : "block"
                }`}
              >
                Available for freelance web applications, full-stack product builds, and creative collaborations.
              </p>
            </div>

            {/* Interactive Form Toggle + Copy Email Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#FF1E00] px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,30,0,0.4)] transition-transform hover:scale-105 sm:px-6 sm:py-3 sm:text-sm"
              >
                {showForm ? "Close Form ✕" : "Say Hello ↗"}
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2.5 font-mono-tech text-[11px] text-white/90 backdrop-blur-md transition-colors hover:border-[#F5C451] hover:text-[#F5C451] sm:px-5 sm:py-3 sm:text-xs"
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
                <div className="mt-4 border-t border-white/10 pt-4 sm:mt-8 sm:pt-8">
                  <ContactForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Dynamic Social Links Row */}
          {socials.length > 0 && (
            <div
              className={`relative z-10 mt-6 flex-wrap gap-2 border-t border-white/10 pt-4 sm:mt-10 sm:flex sm:gap-3 sm:pt-6 ${
                showForm ? "hidden" : "flex"
              }`}
            >
              {socials.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.platform === "email" ? "_self" : "_blank"}
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 font-mono-tech text-[11px] text-white/75 transition-all hover:border-white hover:bg-white hover:text-black sm:px-4 sm:py-1.5 sm:text-xs"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Copyright (with Stealth Admin Trigger on JAS) & Back-to-top Link */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:mt-10 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-2.5 font-mono-tech text-[11px] text-white/45 sm:flex-row sm:gap-4 sm:text-xs">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()}{" "}
            {onOpenAdmin ? (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="m-0 cursor-default appearance-none border-0 bg-transparent p-0 font-inherit text-inherit focus:outline-none"
              >
                {brandName}
              </button>
            ) : (
              <a
                href="/admin"
                className="cursor-default text-inherit no-underline"
              >
                {brandName}
              </a>
            )}{" "}
            ({fullName}). All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a href="#top" className="transition-colors hover:text-white">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}