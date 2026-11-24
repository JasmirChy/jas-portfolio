import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { fetchPortfolioData } from "./api/portfolioApi";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutProfile from "./components/AboutProfile";
import ProjectCarousel3D from "./components/ProjectCarousel3D";
import SkillsSection from "./components/SkillsSection";
import Footer from "./components/Footer";
import NotFound404 from "./components/NotFound404";

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
  const [isNotFound, setIsNotFound] = useState(
    () => window.location.pathname !== "/"
  );

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  useEffect(() => {
    const loadData = async () => {
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

    loadData();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setIsNotFound(window.location.pathname !== "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleBackHome = () => {
    window.history.pushState({}, "", "/");
    setIsNotFound(false);
    setLoadingDone(true);
  };

  if (isNotFound) {
    return (
      <NotFound404
        brandName={data.profile?.brand_name || "JAS"}
        onBackHome={handleBackHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08080A] text-white">
      <Preloader
        brandName={data.profile?.brand_name || "JAS"}
        fullName={data.profile?.full_name || "Jasmir Chaudhary"}
        onComplete={() => setLoadingDone(true)}
      />

      {loadingDone && (
        <>
          {/* Top Scroll Progress Bar */}
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
          <Footer profile={data.profile} socials={data.socials} />
        </>
      )}
    </div>
  );
}