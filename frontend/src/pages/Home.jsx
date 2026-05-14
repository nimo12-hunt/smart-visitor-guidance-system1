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
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ========== PREMIUM BACKGROUND ASSETS (4K/8K ready) ==========
const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-technology-circuit-board-connections-31201-large.mp4",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1920&h=1080&fit=crop",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop",
  },
];

const AUTO_ROTATE_INTERVAL = 7000; // 7 seconds

// ========== ROTATING TAGLINES (wayfinding focus) ==========
const ROTATING_TAGLINES = [
  "Find your way, find your service.",
  "Discover departments & services instantly.",
  "Navigate the Ministry with ease.",
  "Your journey starts here.",
  "Leave feedback, help us improve.",
];

const Home = () => {
  // ========== STATE ==========
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel & video
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);
  const autoTimerRef = useRef(null);

  // Rotating text
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 0,
  });

  // ========== AUTO‑ROTATE & MANUAL CONTROLS ==========
  const startAutoRotate = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
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
    setTimeout(() => setIsTransitioning(false), 300);
    resetAutoRotate();
  };

  const goNext = () => {
    stopAutoRotate();
    setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
    resetAutoRotate();
  };

  // Video handling on switch
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

  // Rotating tagline effect
  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setIsTextTransitioning(true);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setTimeout(() => setIsTextTransitioning(false), 300);
      }, 200);
    }, 4000);
    return () => clearInterval(taglineInterval);
  }, []);

  // ========== FETCH DATA ==========
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
        console.error("Error fetching sectors:", error);
        setSectors([]);
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
      const activeAnnouncements = data.filter((a) => {
        if (!a.isActive) return false;
        if (a.endDate && new Date(a.endDate) < now) return false;
        return true;
      });
      setAnnouncements(activeAnnouncements.slice(0, 3));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    }
  };

  // ========== SEARCH ==========
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

  // ========== UTILITIES ==========
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "holiday":
        return "🎉";
      case "event":
        return "🎪";
      case "maintenance":
        return "🔧";
      case "alert":
        return "⚠️";
      default:
        return "📢";
    }
  };

  const getSectorPulse = (sector) => {
    const deptCount = sector.departmentCount || 4;
    return `${Math.max(2, Math.round(deptCount / 2))} min`;
  };

  const scrollToSectors = () => {
    const sectorsSection = document.getElementById("sectors");
    if (sectorsSection) {
      sectorsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentAsset = BACKGROUND_ASSETS[currentMediaIndex];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">
              Loading experience...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <AnnouncementBanner />

        {/* Live Announcements Bar */}
        {announcements.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex items-center gap-1 text-amber-700 text-sm font-semibold">
                  <FiBell size={14} /> Announcements:
                </div>
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyles(announcement.priority)}`}
                  >
                    <span>{getTypeIcon(announcement.type)}</span>
                    <span className="font-semibold">{announcement.title}</span>
                    <span className="hidden sm:inline text-gray-600">•</span>
                    <span className="hidden sm:inline text-gray-500 truncate max-w-md">
                      {announcement.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== HERO SECTION WITH CAROUSEL ========== */}
        <div className="relative h-[85vh] min-h-[650px] w-full overflow-hidden group">
          {/* Background Media with crossfade */}
          {currentAsset.type === "video" ? (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
              key={currentAsset.url}
            >
              <source src={currentAsset.url} type="video/mp4" />
            </video>
          ) : (
            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 bg-cover bg-center ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
              style={{ backgroundImage: `url(${currentAsset.url})` }}
            />
          )}

          {/* Dark Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A4A]/85 via-[#103457]/75 to-[#1A3A5C]/80 backdrop-blur-[2px]"></div>

          {/* Ethiopian Flag Stripes */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
            <div className="w-1/3 bg-[#078930]"></div>
            <div className="w-1/3 bg-[#FCDD09]"></div>
            <div className="w-1/3 bg-[#DA121A]"></div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous background"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next background"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full mb-6 border border-white/30 shadow-lg animate-fadeInUp"></div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 tracking-tight leading-tight animate-fadeInUp [animation-delay:0.1s]">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  MINT
                </span>{" "}
                Navigator
              </h1>

              {/* Rotating Tagline - Wayfinding focused */}
              <div className="h-20 md:h-24 overflow-hidden relative mb-6">
                <p
                  className={`absolute inset-x-0 text-base md:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed font-medium transition-all duration-500 ${
                    isTextTransitioning
                      ? "opacity-0 translate-y-4"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  {ROTATING_TAGLINES[currentTaglineIndex]}
                </p>
              </div>

              {/* Stats Cards (real data) */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10 animate-fadeInUp [animation-delay:0.3s]">
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 text-center transition-transform hover:scale-105 duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {stats.totalDepts}
                  </p>
                  <p className="text-[11px] text-white/80 uppercase tracking-wide">
                    Departments
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 text-center transition-transform hover:scale-105 duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {stats.totalSectors}
                  </p>
                  <p className="text-[11px] text-white/80 uppercase tracking-wide">
                    Sectors
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 text-center transition-transform hover:scale-105 duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-amber-300">
                    {stats.avgRating}
                  </p>
                  <p className="text-[11px] text-white/80 uppercase tracking-wide">
                    Avg Rating
                  </p>
                </div>
              </div>

              {/* CTA Buttons – Get Started only */}
              <div className="flex flex-wrap justify-center gap-4 animate-fadeInUp [animation-delay:0.4s]">
                <button
                  onClick={scrollToSectors}
                  className="group px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm transform hover:scale-105"
                >
                  Get Started
                  <FiArrowRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={16}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center">
              <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 -mt-7 sm:-mt-8 relative z-20">
          <div className="max-w-2xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-xl p-1.5 border border-slate-100">
              <div className="relative flex items-center min-w-0">
                <FiSearch
                  className="absolute left-4 text-slate-500 pointer-events-none z-10"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search departments, services, or buildings…"
                  className="w-full min-w-0 pl-11 pr-[5.5rem] sm:pr-28 py-3.5 bg-white border-0 rounded-[0.875rem] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm text-slate-900 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-5 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-sm shadow-md shrink-0"
                >
                  Search
                </button>
              </div>
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 mt-2 overflow-hidden animate-fadeInUp">
                {searchResults.map((dept) => (
                  <Link
                    key={dept.id}
                    to={`/department/${dept.id}`}
                    onClick={handleResultClick}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm">
                          {dept.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-emerald-500" size={11} />
                            Bldg {dept.building}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{getFloorLabel(dept.floor)}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>Rm {dept.room}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-full">
                        <FiStar className="fill-current text-yellow-500 text-xs" />
                        <span className="text-xs font-semibold text-gray-700">
                          {dept.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sectors Grid Section */}
        <main
          id="sectors"
          className="container mx-auto px-4 py-12 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full mb-3"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Explore Our Sectors
              </h2>
              <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                Navigate through ministry departments organized by functional
                sectors with one‑tap navigation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {sectors.map((sector, index) => (
                <Link
                  key={sector.id}
                  to={`/sector/${sector.id}`}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-emerald-300 hover:-translate-y-1 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  {/* Image Container */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={
                        sector.image ||
                        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop"
                      }
                      alt={sector.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Floating badges */}
                    <div
                      className="absolute left-3 top-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full shadow-md"
                      style={{ backgroundColor: sector.color || "#0B2A4A" }}
                    >
                      {sector.building}-{sector.floors?.[0] || 1}
                    </div>
                    <div className="absolute right-3 top-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full bg-rose-600 shadow-md">
                      {Math.max(
                        1,
                        Math.round((sector.departmentCount || 4) / 4),
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                          Room: {sector.building}
                          {sector.floors?.[0] || 1}0
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-full">
                        <FiStar
                          className="text-amber-500 fill-amber-500"
                          size={10}
                        />
                        <span className="text-[10px] font-bold text-amber-700">
                          {(sector.avgRating || 4.5).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-lg mb-1.5 group-hover:text-emerald-700 transition-colors leading-tight">
                      {sector.name}
                    </h3>
                    <p className="text-slate-500 text-xs mb-3 line-clamp-2 leading-relaxed">
                      {sector.description?.substring(0, 80) ||
                        "Ministry sector providing essential services..."}
                    </p>

                    {/* Department count & walking time */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 mt-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <FiMapPin size={11} className="text-emerald-500" />
                        <span>{getSectorPulse(sector)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                        <FiStar size={11} className="fill-amber-500" />
                        <span>{sector.departmentCount || 0} departments</span>
                      </div>
                    </div>

                    {/* View details button */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase group-hover:text-emerald-600 transition-colors">
                        View Details
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                        <FiArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Feedback CTA (only here) */}
        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/feedback"
              className="group px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md text-sm transform hover:scale-105"
            >
              <FiStar size={14} /> Leave General Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          opacity: 0;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
      `}</style>
    </Layout>
  );
};

export default Home;
