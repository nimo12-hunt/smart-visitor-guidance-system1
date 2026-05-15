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
  FiHome as FiHomeIcon,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import axios from "axios";

// ✅ FIXED: Use environment variable for API base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-digital-circuit-board-with-glowing-connections-31202-large.mp4",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&crop=center",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop&crop=center",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&h=1080&fit=crop&crop=center",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1581092160607-9c6e6b4e2b2b?w=1920&h=1080&fit=crop&crop=center",
  },
];

const AUTO_ROTATE_INTERVAL = 6500;

const ROTATING_TAGLINES = [
  "Igniting Innovation. Powering Ethiopia.",
  "Discover. Connect. Transform.",
  "Your gateway to Ministry services.",
  "Innovation starts with navigation.",
  "Excellence in every step.",
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);
  const autoTimerRef = useRef(null);

  // Tagline
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 0,
  });

  const startAutoRotate = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 600);
    }, AUTO_ROTATE_INTERVAL);
  }, []);

  const stopAutoRotate = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  const resetAutoRotate = () => {
    stopAutoRotate();
    startAutoRotate();
  };

  const goPrev = () => {
    stopAutoRotate();
    setCurrentMediaIndex(
      (prev) =>
        (prev - 1 + BACKGROUND_ASSETS.length) % BACKGROUND_ASSETS.length,
    );
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 600);
    resetAutoRotate();
  };

  const goNext = () => {
    stopAutoRotate();
    setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 600);
    resetAutoRotate();
  };

  useEffect(() => {
    if (
      BACKGROUND_ASSETS[currentMediaIndex].type === "video" &&
      videoRef.current
    ) {
      videoRef.current
        .play()
        .catch((e) => console.log("Video autoplay prevented:", e));
    }
    resetAutoRotate();
    return () => stopAutoRotate();
  }, [currentMediaIndex]);

  // Rotating tagline
  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setIsTextTransitioning(true);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setTimeout(() => setIsTextTransitioning(false), 400);
      }, 300);
    }, 4200);
    return () => clearInterval(taglineInterval);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sectorsData = await sectorService.getPublicSectors();
        setSectors(sectorsData || []);

        const departments = await departmentService.getAll();
        const totalDepts = departments?.length || 0;
        const totalSectors = sectorsData?.length || 0;

        let avgRating = 4.8;
        try {
          const feedbackStats = await API.get("/feedback/stats");
          avgRating = feedbackStats.data?.average || 4.8;
        } catch (err) {
          console.error("Error fetching feedback stats:", err);
        }

        setStats({
          totalDepts,
          totalSectors,
          avgRating: parseFloat(avgRating).toFixed(1),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchActiveAnnouncements();
  }, []);

  const fetchActiveAnnouncements = async () => {
    try {
      const response = await API.get("/announcements?active=true");
      const data = response.data.data || response.data || [];
      const now = new Date();
      const active = data.filter(
        (a) => a.isActive && (!a.endDate || new Date(a.endDate) >= now),
      );
      setAnnouncements(active.slice(0, 3));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    }
  };

  // Search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchDepartments(searchQuery);
      setSearchResults(results.slice(0, 6));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleResultClick = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "holiday":
        return "🎉";
      case "event":
        return "🎯";
      case "maintenance":
        return "🔧";
      case "alert":
        return "🚨";
      default:
        return "📢";
    }
  };

  const scrollToSectors = () => {
    document
      .getElementById("sectors")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentAsset = BACKGROUND_ASSETS[currentMediaIndex];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-emerald-100/80 font-medium tracking-wide">
              Loading MINT Experience...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <AnnouncementBanner />

        {/* Live Announcements */}
        {announcements.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-b border-amber-100 py-2.5">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm shrink-0">
                  <FiBell className="animate-pulse" /> LIVE:
                </div>
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className={`inline-flex items-center gap-3 px-5 py-1.5 rounded-2xl text-sm font-medium border shadow-sm ${getPriorityStyles(ann.priority)}`}
                  >
                    <span>{getTypeIcon(ann.type)}</span>
                    <span className="font-semibold">{ann.title}</span>
                    <span className="text-xs opacity-75 truncate max-w-xs hidden md:inline">
                      {ann.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== PREMIUM HERO SECTION ========== */}
        <div className="relative h-screen min-h-[680px] w-full overflow-hidden">
          {/* Background Media */}
          <div className="absolute inset-0">
            {currentAsset.type === "video" ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                key={currentAsset.url}
              >
                <source src={currentAsset.url} type="video/mp4" />
              </video>
            ) : (
              <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 scale-105 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ backgroundImage: `url(${currentAsset.url})` }}
              />
            )}
          </div>

          {/* Multi-layer Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(at_center,#0F766E_0%,transparent_70%)] opacity-40" />

          {/* Ethiopian Flag Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#078930] via-[#FCDD09] to-[#DA121A] z-20" />

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <FiChevronLeft size={28} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <FiChevronRight size={28} />
          </button>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-3xl border border-white/20 mb-6 text-sm font-medium text-white tracking-widest">
              🇪🇹 MINISTRY OF INNOVATION AND TECHNOLOGY
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tighter mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                MINT
              </span>
              <br /> Navigator
            </h1>

            <div className="h-20 md:h-28 flex items-center justify-center mb-8 overflow-hidden">
              <p
                className={`text-xl md:text-2xl text-white/90 font-light max-w-2xl transition-all duration-700 ${
                  isTextTransitioning
                    ? "-translate-y-6 opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
              >
                {ROTATING_TAGLINES[currentTaglineIndex]}
              </p>
            </div>

            {/* Live Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-white">
              <div className="text-center">
                <div className="text-4xl font-semibold text-emerald-300">
                  {stats.totalDepts}
                </div>
                <div className="text-xs uppercase tracking-[2px] text-white/70 mt-1">
                  Departments
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-semibold text-teal-300">
                  {stats.totalSectors}
                </div>
                <div className="text-xs uppercase tracking-[2px] text-white/70 mt-1">
                  Sectors
                </div>
              </div>
              <div className="text-center flex items-center gap-2">
                <div className="text-4xl font-semibold text-amber-300">
                  {stats.avgRating}
                </div>
                <div>
                  <FiStar className="text-amber-300 inline" />
                  <div className="text-xs uppercase tracking-[2px] text-white/70 mt-1">
                    Average Rating
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={scrollToSectors}
              className="group px-10 py-4 bg-white text-emerald-950 rounded-2xl font-semibold text-lg flex items-center gap-3 hover:bg-emerald-50 active:scale-95 transition-all duration-300 shadow-2xl shadow-emerald-900/30"
            >
              Explore Sectors
              <FiArrowRight
                className="group-hover:translate-x-1 transition-transform"
                size={22}
              />
            </button>
          </div>

          {/* Scroll Prompt */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="text-white/60 text-xs tracking-widest mb-3">
              SCROLL TO DISCOVER
            </div>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white rounded-full animate-scroll" />
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="container mx-auto px-6 -mt-8 relative z-30 pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-2 border border-slate-100">
              <div className="relative flex items-center">
                <FiSearch
                  className="absolute left-6 text-slate-400"
                  size={22}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search departments, services, floors or buildings..."
                  className="w-full pl-16 pr-6 py-5 bg-transparent border-0 focus:outline-none text-lg placeholder:text-slate-400"
                />
                <button className="absolute right-3 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-8 py-3.5 rounded-2xl font-semibold shadow-inner">
                  Search
                </button>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden py-2 z-50 max-h-[420px] overflow-y-auto">
                {searchResults.map((dept) => (
                  <Link
                    key={dept.id}
                    to={`/department/${dept.id}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-5 px-8 py-5 hover:bg-slate-50 transition-all group border-b border-slate-100 last:border-none"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700">
                        {dept.name}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="text-emerald-500" /> Bldg{" "}
                          {dept.building} • Floor {getFloorLabel(dept.floor)}
                        </span>
                        <span>Rm {dept.room}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-4 py-1 rounded-2xl">
                      <FiStar className="text-amber-500" />
                      <span className="font-semibold text-amber-700 text-sm">
                        {dept.rating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sectors Section - Premium Cards */}
        <main
          id="sectors"
          className="container mx-auto px-6 py-20 scroll-mt-20"
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2 rounded-3xl text-sm font-semibold tracking-wider mb-4">
              FUNCTIONAL AREAS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Our Innovation Sectors
            </h2>
            <p className="text-slate-600 mt-4 max-w-xl mx-auto text-lg">
              Organized excellence. Instant access to every department and
              service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sectors.map((sector, index) => (
              <Link
                key={sector.id || index}
                to={`/sector/${sector.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-100 hover:border-emerald-200 transition-all duration-500 hover:-translate-y-3"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      sector.image ||
                      `https://picsum.photos/id/${80 + index}/800/600`
                    }
                    alt={sector.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <div className="absolute top-5 left-5 bg-white/90 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-2xl backdrop-blur">
                    {sector.building || "MINT"}
                  </div>

                  <div className="absolute bottom-5 right-5 bg-emerald-600 text-white text-xs font-mono px-3 py-1 rounded-xl">
                    {sector.departmentCount || 8} DEPTS
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight mb-3">
                    {sector.name}
                  </h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3 mb-8">
                    {sector.description ||
                      "Driving Ethiopia’s digital and technological transformation through excellence and innovation."}
                  </p>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center text-emerald-600 text-sm font-medium">
                        <FiUsers className="mr-2" /> Quick Access
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Est. {getSectorPulse(sector)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <FiAward size={18} />
                      <span className="font-semibold text-sm">
                        {(sector.avgRating || 4.7).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* Final CTA */}
        <div className="bg-slate-900 py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <FiStar className="mx-auto text-amber-400 mb-6" size={48} />
              <h3 className="text-4xl font-bold mb-4">
                Help Us Serve You Better
              </h3>
              <p className="text-slate-400 mb-10">
                Your feedback shapes the future of public service innovation in
                Ethiopia.
              </p>
              <Link
                to="/feedback"
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-2xl font-semibold hover:bg-emerald-400 hover:text-white transition-all group text-lg"
              >
                Share Your Experience
                <FiArrowRight className="group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(12px);
            }
            100% {
              transform: translateY(0);
            }
          }
          .animate-scroll {
            animation: scroll 1.8s infinite;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Home;
