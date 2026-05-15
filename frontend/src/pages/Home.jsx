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
} from "react-icons/fi";
import axios from "axios";

// ----------------------------------------------------------------------
// CONFIGURATION & ASSETS
// ----------------------------------------------------------------------

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-digital-circuit-board-with-glowing-connections-31202-large.mp4",
    title: "Innovation Hub",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    title: "Global Connectivity",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80",
    title: "Digital Security",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
    title: "Future Tech",
  },
];

const ROTATING_TAGLINES = [
  "Igniting Innovation. Powering Ethiopia.",
  "Your Digital Gateway to Excellence.",
  "Streamlining Navigation for a Smarter Tomorrow.",
  "Empowering Citizens through Technology.",
  "The Future of Governance is Digital.",
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const Home = () => {
  // State: Data & Loading
  const [sectors, setSectors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 4.9,
  });

  // State: UI & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // State: Hero Carousel
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);

  const videoRef = useRef(null);
  const autoTimerRef = useRef(null);

  // ----------------------------------------------------------------------
  // LOGIC: HELPERS
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
    if (hour >= 8 && hour <= 17) return "High Traffic";
    return "Optimized Access";
  }, []);

  // ----------------------------------------------------------------------
  // LOGIC: CAROUSEL & ANIMATIONS
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
    autoTimerRef.current = setInterval(handleNext, 7000);
    return () => clearInterval(autoTimerRef.current);
  }, [handleNext]);

  useEffect(() => {
    const taglineTimer = setInterval(() => {
      setIsTextTransitioning(true);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setIsTextTransitioning(false);
      }, 500);
    }, 4500);
    return () => clearInterval(taglineTimer);
  }, []);

  // ----------------------------------------------------------------------
  // LOGIC: DATA FETCHING
  // ----------------------------------------------------------------------

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        const [sectorsData, deptsData] = await Promise.all([
          sectorService.getPublicSectors(),
          departmentService.getAll(),
        ]);

        setSectors(sectorsData || []);

        // Fetch Real-time Feedback if possible
        let dynamicRating = 4.9;
        try {
          const res = await API.get("/feedback/stats");
          dynamicRating = res.data?.average || 4.9;
        } catch (e) {
          console.log("Stats offline, using defaults.");
        }

        setStats({
          totalDepts: deptsData?.length || 0,
          totalSectors: sectorsData?.length || 0,
          avgRating: parseFloat(dynamicRating).toFixed(1),
        });

        // Announcements
        const annRes = await API.get("/announcements?active=true");
        setAnnouncements((annRes.data.data || []).slice(0, 3));
      } catch (error) {
        console.error("MInT Portal Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = searchDepartments(searchQuery);
      setSearchResults(results.slice(0, 6));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  // ----------------------------------------------------------------------
  // RENDER: LOADING STATE
  // ----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617]">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-emerald-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 w-24 h-24 border-t-2 border-emerald-500 rounded-full animate-spin" />
        </div>
        <h2 className="mt-8 text-emerald-500 font-mono text-sm tracking-[0.5em] uppercase animate-pulse">
          Secure Portal Loading...
        </h2>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: MAIN UI
  // ----------------------------------------------------------------------

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <AnnouncementBanner />

        {/* Dynamic Ticker */}
        {announcements.length > 0 && (
          <div className="bg-slate-900 py-3 border-b border-white/5">
            <div className="container mx-auto px-6 flex items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest shrink-0">
                <FiActivity className="animate-pulse" /> Live Status:
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide no-scrollbar">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className={`px-4 py-1 rounded-full border text-xs font-bold flex items-center gap-2 whitespace-nowrap ${getPriorityStyles(ann.priority)}`}
                  >
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                    {ann.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== ELITE HERO SECTION ========== */}
        <section className="relative h-[90vh] min-h-[700px] w-full overflow-hidden bg-black">
          {/* Media Engine */}
          <div className="absolute inset-0 z-0">
            {BACKGROUND_ASSETS[currentMediaIndex].type === "video" ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isTransitioning ? "opacity-0" : "opacity-60"}`}
                key={BACKGROUND_ASSETS[currentMediaIndex].url}
              >
                <source
                  src={BACKGROUND_ASSETS[currentMediaIndex].url}
                  type="video/mp4"
                />
              </video>
            ) : (
              <div
                className={`w-full h-full bg-cover bg-center transition-all duration-1000 scale-110 ${isTransitioning ? "opacity-0" : "opacity-60"}`}
                style={{
                  backgroundImage: `url(${BACKGROUND_ASSETS[currentMediaIndex].url})`,
                }}
              />
            )}
            {/* Layers of Sophistication */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
          </div>

          {/* Ethiopian Sovereign Line */}
          <div className="absolute top-0 left-0 w-full h-1 z-50 flex">
            <div className="h-full w-1/3 bg-[#078930]" />
            <div className="h-full w-1/3 bg-[#FCDD09]" />
            <div className="h-full w-1/3 bg-[#DA121A]" />
          </div>

          {/* Hero Main Content */}
          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
            <div className="mb-6 px-6 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full inline-flex items-center gap-3 animate-fade-in-down">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-white text-[10px] font-black tracking-[0.4em] uppercase">
                Ministry of Innovation & Technology
              </span>
            </div>

            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8">
              MINT{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
                NAVIGATOR
              </span>
            </h1>

            <div className="h-20 flex items-center">
              <p
                className={`text-xl md:text-3xl text-slate-300 font-light tracking-wide transition-all duration-700 ${isTextTransitioning ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}
              >
                {ROTATING_TAGLINES[currentTaglineIndex]}
              </p>
            </div>

            {/* Portal Stats HUD */}
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 my-16">
              {[
                {
                  label: "Departments",
                  val: stats.totalDepts,
                  icon: <FiGrid />,
                },
                { label: "Sectors", val: stats.totalSectors, icon: <FiCpu /> },
                {
                  label: "User Rating",
                  val: stats.avgRating,
                  icon: <FiStar className="text-amber-400" />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center group cursor-default"
                >
                  <div className="text-white/20 mb-2 transition-colors group-hover:text-emerald-400">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white">
                    {stat.val}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("search-anchor")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="group px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg flex items-center gap-4 transition-all hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              Start Exploring{" "}
              <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Carousel HUD Controls */}
          <div className="absolute bottom-12 right-12 flex items-center gap-6 z-20">
            <div className="flex gap-2">
              {BACKGROUND_ASSETS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 transition-all duration-700 rounded-full ${currentMediaIndex === idx ? "w-12 bg-emerald-500" : "w-3 bg-white/20"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={handleNext}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* ========== SEARCH INTELLIGENCE ========== */}
        <div
          id="search-anchor"
          className="relative z-30 -mt-16 container mx-auto px-6"
        >
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] p-4 border border-slate-100 relative group">
              <div className="relative flex items-center">
                <div className="absolute left-8 text-emerald-600 transition-transform group-focus-within:scale-110">
                  <FiSearch size={32} />
                </div>
                <input
                  type="text"
                  placeholder="Search for departments, floor locations, or digital services..."
                  className="w-full pl-24 pr-12 py-8 text-2xl font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-6 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs font-bold hidden md:block">
                  ESC TO CLOSE
                </div>
              </div>

              {/* Dynamic Dropdown Results */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-fade-in-up">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      System Matches
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">
                      {searchResults.length} Departments Found
                    </span>
                  </div>
                  {searchResults.map((dept) => (
                    <Link
                      key={dept.id}
                      to={`/department/${dept.id}`}
                      className="flex items-center gap-8 p-8 hover:bg-emerald-50/50 transition-all group border-b border-slate-50 last:border-0"
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <FiGrid size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-xl mb-1">
                          {dept.name}
                        </h4>
                        <div className="flex gap-6 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-2">
                            <FiMapPin className="text-emerald-500" /> Bldg{" "}
                            {dept.building}
                          </span>
                          <span>Level {getFloorLabel(dept.floor)}</span>
                          <span>Room {dept.room}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
                        <FiStar
                          className="text-amber-500"
                          fill="currentColor"
                        />
                        <span className="text-amber-700 font-bold text-sm">
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

        {/* ========== SECTOR ARCHITECTURE ========== */}
        <section className="container mx-auto px-6 py-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] tracking-[0.3em] uppercase mb-4">
                <FiZap /> System Architecture
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter mb-8">
                Institutional <br />{" "}
                <span className="text-emerald-600">Verticals.</span>
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
                The Ministry is organized into strategic technology sectors.
                Explore each domain to access specialized personnel and digital
                resources.
              </p>
            </div>
            <Link
              to="/sectors"
              className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold flex items-center gap-3 transition-transform hover:-translate-y-1"
            >
              All Sectors <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {sectors.map((sector, idx) => (
              <Link
                key={sector.id || idx}
                to={`/sector/${sector.id}`}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl transition-all duration-700 hover:-translate-y-4 hover:shadow-emerald-900/10"
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={
                      sector.image ||
                      `https://images.unsplash.com/photo-1581092160607-9c6e6b4e2b2b?w=800`
                    }
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={sector.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Status Overlay */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full self-start">
                      {sector.building || "MInT-HQ"}
                    </div>
                    <div className="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      {getSectorPulse(sector)}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-10 transform transition-all duration-500 group-hover:pb-12">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
                    <FiUsers /> {sector.departmentCount || 8} Active Units
                  </div>
                  <h3 className="text-3xl font-black text-white mb-6 leading-tight transition-colors group-hover:text-emerald-400">
                    {sector.name}
                  </h3>
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-amber-400 font-black">
                      <FiStar fill="currentColor" size={16} />
                      {(sector.avgRating || 4.9).toFixed(1)}
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-white group-hover:bg-emerald-500 transition-colors">
                      <FiArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== TRUST & FEEDBACK ========== */}
        <section className="container mx-auto px-6 pb-32">
          <div className="bg-slate-950 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden text-center">
            {/* Visual Flair */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-12">
                <FiAward size={48} />
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                Enhance Ethiopia's <br />{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Digital Experience.
                </span>
              </h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                Your feedback directly influences the quality of service at the
                Ministry. Connect with us to share your navigation experience
                and suggestions for improvement.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link
                  to="/feedback"
                  className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-emerald-400 hover:text-white transition-all shadow-2xl"
                >
                  Submit Feedback
                </Link>
                <div className="flex items-center gap-4 text-white/50 px-8 py-5 border border-white/10 rounded-2xl">
                  <FiShield className="text-emerald-400" /> Secure Data
                  Encryption
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOM ANIMATION STYLES */}
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fade-in-down {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-fade-in-down {
            animation: fade-in-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Home;
