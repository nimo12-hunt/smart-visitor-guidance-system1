/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AnnouncementBanner from "../components/AnnouncementBanner";
import { searchDepartments } from "../data/departmentsData";
import { getFloorLabel } from "../utils/floorLabels";
import { sectorService } from "../services/sectorService";
import { departmentService } from "../services/departmentService";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiArrowRight,
  FiGrid,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiAward,
  FiActivity,
  FiGlobe,
  FiZap,
  FiCpu,
  FiShield,
  FiCompass,
  FiTrendingUp,
  FiHexagon,
} from "react-icons/fi";
import axios from "axios";

// ----------------------------------------------------------------------
// PREMIUM CONFIGURATION
// ----------------------------------------------------------------------

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// High‑quality background assets (4K video + images)
const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-digital-circuit-board-with-glowing-connections-31202-large.mp4",
    title: "Digital Innovation Hub",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    title: "Connected Future",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
    title: "Advanced Technology",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80",
    title: "Cyber Security",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1920&q=80",
    title: "Artificial Intelligence",
  },
];

const ROTATING_TAGLINES = [
  "Empowering Ethiopia through Digital Innovation.",
  "Your Gateway to Modern Public Services.",
  "Streamlining Governance with Technology.",
  "Building a Digitally Inclusive Nation.",
  "Innovation at the Heart of Service.",
];

// Splash images for sectors (high‑quality, unique per sector)
const sectorSplashImages = {
  1: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
  2: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=500&fit=crop",
  3: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=500&fit=crop",
  4: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
  5: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=500&fit=crop",
  6: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
  7: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&h=500&fit=crop",
  8: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=500&fit=crop",
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const Home = () => {
  // Data states
  const [sectors, setSectors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 4.9,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Hero carousel
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const videoRef = useRef(null);
  const autoTimerRef = useRef(null);

  // ----------------------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------------------
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const getSectorPulse = useCallback((sector) => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 17) return "Business Hours • Active";
    return "After Hours • Limited Access";
  }, []);

  // ----------------------------------------------------------------------
  // CAROUSEL & ANIMATIONS
  // ----------------------------------------------------------------------
  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
      setIsTransitioning(false);
    }, 600);
  }, []);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMediaIndex(
        (prev) =>
          (prev - 1 + BACKGROUND_ASSETS.length) % BACKGROUND_ASSETS.length,
      );
      setIsTransitioning(false);
    }, 600);
  }, []);

  useEffect(() => {
    autoTimerRef.current = setInterval(handleNext, 8000);
    return () => clearInterval(autoTimerRef.current);
  }, [handleNext]);

  useEffect(() => {
    const taglineTimer = setInterval(() => {
      setIsTextTransitioning(true);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setIsTextTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(taglineTimer);
  }, []);

  // ----------------------------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectorsData, departmentsData] = await Promise.all([
          sectorService.getPublicSectors(),
          departmentService.getAll(),
        ]);

        setSectors(sectorsData || []);
        setStats((prev) => ({
          ...prev,
          totalDepts: departmentsData?.length || 0,
          totalSectors: sectorsData?.length || 0,
        }));

        // Fetch real‑time average rating if available
        try {
          const feedbackStats = await API.get("/feedback/stats");
          const avg = feedbackStats.data?.average;
          if (avg) {
            setStats((prev) => ({
              ...prev,
              avgRating: parseFloat(avg).toFixed(1),
            }));
          }
        } catch (err) {
          console.debug("Feedback stats not available, using default rating.");
        }

        // Announcements
        const annRes = await API.get("/announcements?active=true");
        const activeAnnouncements = (annRes.data.data || []).filter(
          (a) =>
            a.isActive && (!a.endDate || new Date(a.endDate) >= new Date()),
        );
        setAnnouncements(activeAnnouncements.slice(0, 3));
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = searchDepartments(searchQuery);
      setSearchResults(results.slice(0, 6));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleResultClick = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  // Scroll helper
  const scrollToSearch = () => {
    document
      .getElementById("search-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ----------------------------------------------------------------------
  // RENDER LOADING
  // ----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 w-24 h-24 border-t-4 border-emerald-500 rounded-full animate-spin" />
        </div>
        <p className="mt-8 text-emerald-500 text-sm tracking-widest uppercase animate-pulse">
          Loading MINT Portal...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // MAIN RENDER
  // ----------------------------------------------------------------------
  return (
    <Layout>
      <div className="relative min-h-screen bg-white">
        {/* Announcement Banner (Static) */}
        <AnnouncementBanner />

        {/* Live Ticker for Urgent Announcements */}
        {announcements.length > 0 && (
          <div className="bg-slate-900 border-b border-white/5">
            <div className="container mx-auto px-6 py-2.5 flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
                <FiActivity size={12} className="animate-pulse" /> LATEST:
              </div>
              <div className="flex gap-4">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className={`px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${getPriorityStyles(ann.priority)}`}
                  >
                    {ann.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== ELITE HERO SECTION ========== */}
        <section className="relative h-screen max-h-[800px] w-full overflow-hidden bg-black">
          {/* Background Media */}
          <div className="absolute inset-0 z-0">
            {BACKGROUND_ASSETS[currentMediaIndex].type === "video" ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className={`h-full w-full object-cover transition-opacity duration-1000 ${
                  isTransitioning ? "opacity-0" : "opacity-70"
                }`}
                key={BACKGROUND_ASSETS[currentMediaIndex].url}
              >
                <source
                  src={BACKGROUND_ASSETS[currentMediaIndex].url}
                  type="video/mp4"
                />
              </video>
            ) : (
              <div
                className={`h-full w-full bg-cover bg-center transition-all duration-1000 ${
                  isTransitioning ? "opacity-0" : "opacity-70"
                }`}
                style={{
                  backgroundImage: `url(${BACKGROUND_ASSETS[currentMediaIndex].url})`,
                }}
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
          </div>

          {/* Ethiopian Flag Bar */}
          <div className="absolute top-0 left-0 w-full h-1 z-30 flex">
            <div className="h-full w-1/3 bg-[#078930]" />
            <div className="h-full w-1/3 bg-[#FCDD09]" />
            <div className="h-full w-1/3 bg-[#DA121A]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center text-center items-center">
            <div className="mb-8 inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full">
              <FiHexagon className="text-emerald-400" size={16} />
              <span className="text-white text-[11px] font-bold tracking-[0.3em] uppercase">
                Ministry of Innovation & Technology
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-6">
              MINT{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Navigator
              </span>
            </h1>

            <div className="h-20 flex items-center justify-center">
              <p
                className={`text-xl md:text-2xl text-slate-300 font-light max-w-3xl transition-all duration-700 ${
                  isTextTransitioning
                    ? "opacity-0 translate-y-4"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {ROTATING_TAGLINES[currentTaglineIndex]}
              </p>
            </div>

            {/* Stats Dashboard */}
            <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-12">
              {[
                {
                  label: "Departments",
                  value: stats.totalDepts,
                  icon: <FiGrid size={24} />,
                },
                {
                  label: "Sectors",
                  value: stats.totalSectors,
                  icon: <FiCpu size={24} />,
                },
                {
                  label: "Citizen Rating",
                  value: `${stats.avgRating} ★`,
                  icon: <FiStar className="text-yellow-400" size={24} />,
                },
              ].map((item, idx) => (
                <div key={idx} className="text-center group cursor-default">
                  <div className="text-white/30 mb-2 group-hover:text-emerald-400 transition-colors">
                    {item.icon}
                  </div>
                  <p className="text-4xl md:text-5xl font-black text-white">
                    {item.value}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-2">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={scrollToSearch}
              className="group mt-16 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg flex items-center gap-3 transition-all hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95 shadow-2xl"
            >
              Explore Services
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Carousel Controls */}
          <div className="absolute bottom-8 right-8 flex items-center gap-4 z-30">
            <div className="flex gap-1">
              {BACKGROUND_ASSETS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    currentMediaIndex === idx
                      ? "w-8 bg-emerald-400"
                      : "w-3 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 text-white transition"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/15 text-white transition"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* ========== SEARCH & WAYFINDING SECTION ========== */}
        <div
          id="search-section"
          className="relative z-20 -mt-16 container mx-auto px-6"
        >
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-2 border border-slate-200">
              <div className="relative flex items-center">
                <div className="absolute left-6 text-emerald-500">
                  <FiSearch size={28} />
                </div>
                <input
                  type="text"
                  placeholder="Search for a department, service, or building location..."
                  className="w-full pl-20 pr-32 py-6 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className="absolute right-6 text-slate-400 text-xs font-mono border-l border-slate-200 pl-4">
                  Press Enter
                </div>
              </div>

              {showResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      🔍 System Results
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {searchResults.length} departments found
                    </span>
                  </div>
                  {searchResults.map((dept) => (
                    <Link
                      key={dept.id}
                      to={`/department/${dept.id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-6 p-6 hover:bg-emerald-50/30 transition border-b border-slate-50 last:border-0"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-emerald-600">
                        <FiMapPin size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-lg">
                          {dept.name}
                        </h4>
                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                          <span>Building {dept.building}</span>
                          <span>{getFloorLabel(dept.floor)}</span>
                          <span>Room {dept.room}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <FiStar
                          className="text-yellow-500 fill-yellow-500"
                          size={14}
                        />
                        <span className="font-bold text-slate-700">
                          {dept.rating}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== SECTOR GRID ========== */}
        <section className="container mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold uppercase tracking-wider mb-4">
                <FiCompass /> Our Structure
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Explore by <span className="text-emerald-600">Sector</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mt-4">
                Navigate the Ministry through its functional sectors – each
                responsible for a key area of innovation and technology.
              </p>
            </div>
            <Link
              to="/sectors"
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 transition-transform hover:-translate-y-1"
            >
              All Sectors <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sectors.map((sector, index) => (
              <Link
                key={sector.id}
                to={`/sector/${sector.id}`}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      sector.image ||
                      sectorSplashImages[sector.id] ||
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop"
                    }
                    alt={sector.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {sector.building} • Sector {sector.id}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl leading-tight group-hover:text-emerald-300 transition">
                      {sector.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white/80 text-xs flex items-center gap-1">
                        <FiUsers size={12} /> {sector.departmentCount || 0}{" "}
                        units
                      </span>
                      <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full text-white text-xs font-bold">
                        <FiStar
                          size={10}
                          className="fill-yellow-400 text-yellow-400"
                        />{" "}
                        {(sector.avgRating || 4.8).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== IMPACT & FEEDBACK ========== */}
        <section className="bg-slate-900 py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <FiAward className="text-emerald-500 text-4xl" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Help Us Shape the Future
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mt-6">
                Your feedback drives our digital transformation. Share your
                experience with any department or service – every voice matters.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-12">
                <Link
                  to="/feedback"
                  className="px-10 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg flex items-center gap-2"
                >
                  <FiStar /> Leave Feedback
                </Link>
                <div className="px-8 py-4 border border-white/10 rounded-xl text-white/70 flex items-center gap-2">
                  <FiShield /> Secured & Anonymous
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== FOOTER NOTE (Ministry Address) ========== */}
        <div className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-sm">
          <div className="container mx-auto px-6">
            <p>
              © {new Date().getFullYear()} Ministry of Innovation and Technology
              – Federal Democratic Republic of Ethiopia
            </p>
            <p className="text-xs mt-2">
              Bole International Airport, Addis Ababa | info@mint.gov.et
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Layout>
  );
};

export default Home;
