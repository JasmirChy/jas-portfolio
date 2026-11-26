import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchAdminStats,
  clearAdminVisitors,
  setAdminToken,
} from "../api/portfolioApi";
import AdminProfileTab from "./admin/AdminProfileTab";
import AdminProjectsTab from "./admin/AdminProjectsTab";
import AdminSkillsTab from "./admin/AdminSkillsTab";
import AdminSocialsTab from "./admin/AdminSocialsTab";

const ADMIN_TABS = [
  { id: "overview", label: "Overview & Visitors" },
  { id: "profile", label: "Profile & Photo" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "socials", label: "Social Links" },
];

export default function AdminDashboard({ brandName = "JAS", onLogout, onViewSite }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const adminUser = localStorage.getItem("jas_admin_user") || "Admin";

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAdminToken(null);
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    setConfirmClear(false);
    if (tabId === "overview") {
      loadStats();
    }
  };

const handleClearVisitors = async () => {
    setClearError("");

    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setClearing(true);
    try {
      await clearAdminVisitors();
      setConfirmClear(false);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total_views: 0,
              unique_visitors: 0,
              today_views: 0,
              recent_visitors: [],
              daily_chart: prev.daily_chart.map((d) => ({ ...d, views: 0 })),
            }
          : prev
      );
      await loadStats();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAdminToken(null);
        onLogout();
      } else {
        setClearError(
          err.response?.data?.detail ||
            `Failed to clear (${err.response?.status || "Network Error"})`
        );
      }
    } finally {
      setClearing(false);
    }
  };

  const handleLogoutClick = () => {
    setAdminToken(null);
    localStorage.removeItem("jas_admin_user");
    onLogout();
  };

  const maxViews = Math.max(
    1,
    ...(stats?.daily_chart || []).map((d) => d.views)
  );

  return (
    <div className="min-h-screen bg-[#08080A] text-white">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080A]/85 px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-wider text-white">
              {brandName}
              <span className="text-[#FF1E00]">.</span>
            </span>
            <span className="rounded-md border border-[#F5C451]/40 bg-[#F5C451]/10 px-2.5 py-0.5 font-mono-tech text-[10px] uppercase tracking-widest text-[#F5C451]">
              ADMIN_PANEL
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <span className="hidden font-mono-tech text-xs text-white/55 sm:inline">
              USER: <strong className="text-white">{adminUser}</strong>
            </span>
            <button
              type="button"
              onClick={onViewSite}
              className="cursor-pointer rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono-tech text-xs text-white/85 transition-colors hover:border-[#F5C451] hover:text-[#F5C451]"
            >
              View Live Site ↗
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="cursor-pointer rounded-full bg-[#FF1E00] px-3.5 py-1.5 font-mono-tech text-xs font-bold text-white transition-transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {/* Section Title */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-[#F5C451]">
              COMMAND CENTER // CMS & ANALYTICS
            </p>
            <h1 className="font-syne mt-1 text-2xl font-extrabold sm:text-4xl">
              Portfolio <span className="text-[#FF1E00]">Control</span> Panel
            </h1>
          </div>

          {activeTab === "overview" && (
            <button
              type="button"
              onClick={loadStats}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 font-mono-tech text-xs text-white/80 hover:border-white"
            >
              ↻ Refresh Metrics
            </button>
          )}
        </div>

        {/* Navigation Tabs Bar */}
        <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {ADMIN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSwitch(tab.id)}
                className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 font-mono-tech text-xs transition-all ${
                  isActive
                    ? "bg-[#F5C451] font-bold text-black shadow-[0_0_20px_rgba(245,196,81,0.3)]"
                    : "border border-white/10 bg-white/[0.03] text-white/65 hover:border-white/30 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & VISITOR ANALYTICS */}
        {activeTab === "overview" && (
          <>
            {loading || !stats ? (
              <div className="mt-10 font-mono-tech text-xs text-white/50">
                LOADING ANALYTICS...
              </div>
            ) : (
              <>
                <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: "TOTAL PAGE VIEWS", value: stats.total_views, accent: "text-[#FF1E00]" },
                    { label: "UNIQUE VISITORS", value: stats.unique_visitors, accent: "text-[#F5C451]" },
                    { label: "VIEWS TODAY", value: stats.today_views, accent: "text-emerald-400" },
                    {
                      label: "ACTIVE ITEMS",
                      value: `${stats.projects_count}P • ${stats.skills_count}S`,
                      accent: "text-white",
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-white/10 bg-[#0D0D12] p-5"
                    >
                      <p className="font-mono-tech text-[10px] uppercase tracking-widest text-white/45">
                        {card.label}
                      </p>
                      <p className={`font-display mt-2 text-3xl sm:text-4xl ${card.accent}`}>
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-[#0D0D12] p-6">
                  <p className="font-mono-tech text-xs uppercase tracking-widest text-[#F5C451]">
                    7-DAY VISITOR TRAFFIC
                  </p>
                  <div className="mt-6 grid h-40 grid-cols-7 items-end gap-3">
                    {stats.daily_chart.map((day) => {
                      const heightPercent = Math.max(10, Math.round((day.views / maxViews) * 100));
                      return (
                        <div key={day.date} className="flex h-full flex-col items-center justify-end gap-2">
                          <span className="font-mono-tech text-[11px] text-white/75">
                            {day.views}
                          </span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-[38px] rounded-t-lg bg-gradient-to-t from-[#FF1E00] to-[#F5C451]"
                          />
                          <span className="font-mono-tech text-[10px] text-white/45">
                            {day.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

<div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D12]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <p className="font-mono-tech text-xs uppercase tracking-widest text-white/70">
                        RECENT VISITOR LOGS
                      </p>
                      {clearError && (
                        <span className="font-mono-tech text-[11px] text-[#FF1E00]">
                          {clearError}
                        </span>
                      )}
                    </div>

                    {stats.total_views > 0 && (
                      <button
                        type="button"
                        disabled={clearing}
                        onClick={handleClearVisitors}
                        className={`cursor-pointer rounded-xl px-3.5 py-1.5 font-mono-tech text-[11px] font-bold transition-all disabled:opacity-50 ${
                          confirmClear
                            ? "border border-[#FF1E00] bg-[#FF1E00] text-white shadow-[0_0_16px_rgba(255,30,0,0.45)]"
                            : "border border-[#FF1E00]/40 bg-[#FF1E00]/10 text-[#FF1E00] hover:bg-[#FF1E00] hover:text-white"
                        }`}
                      >
                        {clearing
                          ? "Clearing..."
                          : confirmClear
                          ? "Click Again to Confirm Clear ✕"
                          : "Clear Visitors"}
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono-tech text-xs">
                      <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase text-white/45">
                        <tr>
                          <th className="px-6 py-3">Visitor ID</th>
                          <th className="px-6 py-3">Email / Gmail</th>
                          <th className="px-6 py-3">Device</th>
                          <th className="px-6 py-3">Browser</th>
                          <th className="px-6 py-3">Path</th>
                          <th className="px-6 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-white/80">
                        {stats.recent_visitors.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-6 text-center text-white/45">
                              No visits logged yet — open the public homepage to record a visit.
                            </td>
                          </tr>
                        ) : (
                          stats.recent_visitors.map((v) => (
                            <tr key={v.id} className="hover:bg-white/[0.02]">
                              <td className="px-6 py-3 text-[#F5C451]">{v.visitor_id}</td>
                              <td className="px-6 py-3">
                                {v.email ? (
                                  <a
                                    href={`mailto:${v.email}`}
                                    className="text-emerald-400 underline-offset-4 hover:underline"
                                  >
                                    {v.email}
                                  </a>
                                ) : (
                                  <span className="text-white/30">Anonymous</span>
                                )}
                              </td>
                              <td className="px-6 py-3">{v.device_type}</td>
                              <td className="px-6 py-3">{v.browser}</td>
                              <td className="px-6 py-3">{v.path}</td>
                              <td className="px-6 py-3 text-white/50">{v.visited_at}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* TAB 2: PROFILE & PHOTO MANAGER */}
        {activeTab === "profile" && <AdminProfileTab />}

        {/* TAB 3: PROJECTS MANAGER */}
        {activeTab === "projects" && <AdminProjectsTab />}

        {/* TAB 4: SKILLS MANAGER */}
        {activeTab === "skills" && <AdminSkillsTab />}

        {/* TAB 5: SOCIAL LINKS MANAGER */}
        {activeTab === "socials" && <AdminSocialsTab />}
      </main>
    </div>
  );
}