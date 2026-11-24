import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  fetchPortfolioData,
  getAdminToken,
  trackVisit,
} from "./api/portfolioApi";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutProfile from "./components/AboutProfile";
import ProjectCarousel3D from "./components/ProjectCarousel3D";
import SkillsSection from "./components/SkillsSection";
import Footer from "./components/Footer";
import NotFound404 from "./components/NotFound404";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

const FALLBACK_DATA = {
  profile: {
    full_name: "Jasmir Chaudhary",
    brand_name: "JAS",
    hero_headline: "I design and build websites and digital products.",
    bio: "Full-stack developer crafting bold, interactive web experiences with Python, Django, React, and PostgreSQL.",
    location: "Dhangadhi, Nepal",
    availability_status: "Open to new projects.",
    avatar: null,
    resume_url: null,
  },
  projects: [],
  skills: [],
  socials: [],
};

export default function App() {
  const [data, setData] = useState(FALLBACK_DATA);
  const [loadingDone, setLoadingDone] = useState(false);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));
  const hasTrackedRef = useRef(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  const loadPortfolioData = async () => {
    try {
      const res = await fetchPortfolioData();
      setData({
        profile: res.profile || FALLBACK_DATA.profile,
        projects: res.projects || [],
        skills: res.skills || [],
        socials: res.socials || [],
      });
    } catch (err) {
      console.error("Failed to fetch portfolio data from Django API:", err);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Track visitor once when visiting public homepage
  useEffect(() => {
    if (pathname === "/" && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackVisit("/");
    }
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (targetPath) => {
    window.history.pushState({}, "", targetPath);
    setPathname(targetPath);
    if (targetPath === "/") {
      setLoadingDone(true);
      loadPortfolioData();
    }
  };

  // Route 1: /admin (Protected Dashboard or Login Gate)
  if (pathname === "/admin" || pathname === "/admin/") {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          brandName={data.profile?.brand_name || "JAS"}
          onLoginSuccess={() => setIsAuthenticated(true)}
          onBackHome={() => navigateTo("/")}
        />
      );
    }

    return (
      <AdminDashboard
        brandName={data.profile?.brand_name || "JAS"}
        onLogout={() => setIsAuthenticated(false)}
        onViewSite={() => navigateTo("/")}
      />
    );
  }

  // Route 2: Any unknown URL -> Shattered-Glass 404
  if (pathname !== "/") {
    return (
      <NotFound404
        brandName={data.profile?.brand_name || "JAS"}
        onBackHome={() => navigateTo("/")}
      />
    );
  }

  // Route 3: Public Portfolio Home (/)
  return (
    <div className="min-h-screen bg-[#08080A] text-white">
      <Preloader
        brandName={data.profile?.brand_name || "JAS"}
        fullName={data.profile?.full_name || "Jasmir Chaudhary"}
        onComplete={() => setLoadingDone(true)}
      />

      {loadingDone && (
        <>
          <motion.div
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 z-50 h-[2.5px] origin-left bg-gradient-to-r from-[#FF1E00] via-[#F5C451] to-white"
          />

          <Navbar
            brandName={data.profile?.brand_name || "JAS"}
            resumeUrl={data.profile?.resume_url}
          />
          <main>
            <Hero profile={data.profile} socials={data.socials} />
            <AboutProfile profile={data.profile} />
            <ProjectCarousel3D projects={data.projects} />
            <SkillsSection skills={data.skills} />
          </main>
          <Footer
            profile={data.profile}
            socials={data.socials}
            onOpenAdmin={() => navigateTo("/admin")}
          />
        </>
      )}
    </div>
  );
}