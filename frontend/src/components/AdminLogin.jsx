import { useState } from "react";
import { motion } from "framer-motion";
import { adminLogin, setAdminToken } from "../api/portfolioApi";

export default function AdminLogin({ brandName = "JAS", onLoginSuccess, onBackHome }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin(username, password);
      setAdminToken(res.token);
      localStorage.setItem("jas_admin_user", res.username || username);
      onLoginSuccess(res);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Access denied. Check your admin username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080A] px-4 py-12 text-white">
      {/* Ambient Crimson & Amber Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,30,0,0.22)_0%,rgba(245,196,81,0.06)_38%,rgba(8,8,10,0)_72%)]"
      />
      <div className="film-grain pointer-events-none absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/14 bg-[#0D0D12]/90 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-9"
      >
        {/* Corner Registration Brackets */}
        <span className="pointer-events-none absolute top-3.5 left-3.5 h-3.5 w-3.5 border-t-2 border-l-2 border-[#F5C451]/70" />
        <span className="pointer-events-none absolute top-3.5 right-3.5 h-3.5 w-3.5 border-t-2 border-r-2 border-[#F5C451]/70" />
        <span className="pointer-events-none absolute bottom-3.5 left-3.5 h-3.5 w-3.5 border-b-2 border-l-2 border-[#FF1E00]/70" />
        <span className="pointer-events-none absolute bottom-3.5 right-3.5 h-3.5 w-3.5 border-b-2 border-r-2 border-[#FF1E00]/70" />

        <div className="flex items-center justify-between">
          <span className="font-display text-2xl tracking-wider text-white">
            {brandName}
            <span className="text-[#FF1E00]">.</span>
          </span>
          <span className="rounded-full border border-[#F5C451]/40 bg-[#F5C451]/10 px-3 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-[#F5C451]">
            AUTH_GATE // 01
          </span>
        </div>

        <h1 className="font-syne mt-6 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Command Center <span className="text-[#FF1E00]">Login</span>
        </h1>
        <p className="mt-1.5 text-xs text-white/60 sm:text-sm">
          Sign in with your Django superuser credentials to manage content and view visitor analytics.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-[#FF1E00]/50 bg-[#FF1E00]/15 px-4 py-3 font-mono-tech text-xs text-[#FF8A7A]"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono-tech text-[11px] uppercase tracking-wider text-white/65">
              Admin Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#F5C451]"
            />
          </div>

          <div>
            <label className="block font-mono-tech text-[11px] uppercase tracking-wider text-white/65">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#F5C451]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#FF1E00] to-[#D9381E] py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(255,30,0,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "VERIFYING CREDENTIALS..." : "Unlock Admin Dashboard →"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <button
            type="button"
            onClick={onBackHome}
            className="cursor-pointer font-mono-tech text-xs text-white/55 transition-colors hover:text-[#F5C451]"
          >
            ← Return to Public Portfolio
          </button>
        </div>
      </motion.div>
    </div>
  );
}