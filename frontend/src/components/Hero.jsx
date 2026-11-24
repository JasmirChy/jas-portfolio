import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function SocialIcon({ platform }) {
  switch (platform) {
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M12 2A10 10 0 0 0 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2A5.8 5.8 0 0 1 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2M7.6 4A3.6 3.6 0 0 0 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4A3.6 3.6 0 0 0 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6M17.25 5.5A1.25 1.25 0 0 1 18.5 6.75A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75A1.25 1.25 0 0 1 17.25 5.5M12 7A5 5 0 0 1 17 12A5 5 0 0 1 12 17A5 5 0 0 1 7 12A5 5 0 0 1 12 7M12 9A3 3 0 0 0 9 12A3 3 0 0 0 12 15A3 3 0 0 0 15 12A3 3 0 0 0 12 9Z" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M10 15L15.19 12L10 9V15M21.56 7.17C21.69 7.64 21.78 8.27 21.84 9.07C21.91 9.87 21.94 10.56 21.94 11.16L22 12C22 14.19 21.84 15.8 21.56 16.83C21.31 17.73 20.73 18.31 19.83 18.56C19.36 18.69 18.5 18.78 17.18 18.84C15.88 18.91 14.69 18.94 13.59 18.94L12 19C7.81 19 5.2 18.84 4.17 18.56C3.27 18.31 2.69 17.73 2.44 16.83C2.31 16.36 2.22 15.73 2.16 14.93C2.09 14.13 2.06 13.44 2.06 12.84L2 12C2 9.81 2.16 8.2 2.44 7.17C2.69 6.27 3.27 5.69 4.17 5.44C4.64 5.31 5.5 5.22 6.82 5.16C8.12 5.09 9.31 5.06 10.41 5.06L12 5C16.19 5 18.8 5.16 19.83 5.44C20.73 5.69 21.31 6.27 21.56 7.17Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

export default function Hero({ profile, socials = [] }) {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kathmandu",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        setTimeString(`${formatted} NPT`);
      } catch {
        setTimeString("LIVE");
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const brandName = profile?.brand_name || "JAS";
  const fullName = profile?.full_name || "Jasmir Chaudhary";
  const headline =
    profile?.hero_headline || "I design and build websites and digital products.";
  const location = profile?.location || "Dhangadhi, Nepal";
  const status = profile?.availability_status || "Open to new projects.";

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24"
    >
      {/* Mobile-First Crimson-to-Obsidian Top Gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] sm:h-[520px] bg-[radial-gradient(ellipse_90%_65%_at_50%_-10%,#FF1E00_0%,rgba(255,30,0,0.38)_42%,rgba(8,8,10,0)_80%)]"
      />
      <div className="film-grain pointer-events-none absolute inset-0 opacity-35" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        {/* Giant Sculpted Top Brand Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="select-none"
        >
          <h1 className="font-display text-[24vw] leading-[0.84] uppercase tracking-tighter text-white/95 drop-shadow-[0_12px_30px_rgba(0,0,0,0.65)] sm:text-[13rem] md:text-[15.5rem]">
            {brandName}
            <span className="text-[#F5C451]">.</span>
          </h1>
        </motion.div>

        {/* Statement, Live Telemetry & Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 max-w-3xl"
        >
          <p className="font-mono-tech mb-3 text-xs uppercase tracking-[0.22em] text-[#F5C451]">
            {fullName} — Full-Stack Engineer
          </p>

          <h2 className="font-syne text-2xl leading-snug font-bold text-white sm:text-4xl sm:leading-tight">
            {headline}
          </h2>

          {/* Live Time & Availability Status */}
          <div className="mt-6 space-y-1.5 font-mono-tech text-xs text-white/60">
            <div className="flex items-center gap-2">
              <span>{timeString}</span>
              <span>•</span>
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 text-white/85">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span>{status}</span>
            </div>
          </div>

          {/* Dynamic Social Links from Django Admin */}
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {socials.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.platform === "email" ? "_self" : "_blank"}
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-all hover:border-[#F5C451] hover:bg-[#F5C451] hover:text-black sm:text-sm"
              >
                {item.icon_image ? (
                  <img
                    src={item.icon_image}
                    alt={item.label}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <SocialIcon platform={item.platform} />
                )}
                <span>{item.label}</span>
              </a>
            ))}

            <a
              href="#about"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition-transform hover:scale-105 sm:text-sm"
            >
              Meet {brandName} ↓
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}