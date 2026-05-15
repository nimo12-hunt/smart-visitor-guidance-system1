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
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ============ PREMIUM BACKGROUND ASSETS ============
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

const AUTO_ROTATE_INTERVAL = 7000;
const TAGLINE_TRANSITION_INTERVAL = 4000;

// ============ ROTATING TAGLINES ============
const ROTATING_TAGLINES = [
  "Find Your Way. Get the Service You Need.",
  "Navigate Departments & Services with Ease.",
  "Where to Go? Search. Locate. Visit.",
  "Discover Services • Find Locations • Leave Feedback.",
  "Your Smart Guide Inside the Ministry.",
];

// ============ SECTOR SPLASH IMAGES ============
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

// ============ HERO SECTION COMPONENT ============
const HeroSection = ({
  currentMediaIndex,
  currentTaglineIndex,
  isTransitioning,
  isTextTransitioning,
  stats,
  onPrevious,
  onNext,
  onScrollToSectors,
  videoRef,
}) => {
  const currentAsset = BACKGROUND_ASSETS[currentMediaIndex];

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden group">
      {/* Background Media */}
      <BackgroundMedia
        asset={currentAsset}
        videoRef={videoRef}
        isTransitioning={isTransitioning}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A4A]/85 via-[#103457]/75 to-[#1A3A5C]/80 backdrop-blur-[2px]" />

      {/* Flag Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
        <div className="w-1/3 bg-[#078930]" />
        <div className="w-1/3 bg-[#FCDD09]" />
        <div className="w-1/3 bg-[#DA121A]" />
      </div>

      {/* Navigation Buttons */}
      <CarouselControls onPrevious={onPrevious} onNext={onNext} />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/30 shadow-lg animate-fadeInUp hover:bg-white/20 transition-colors cursor-default">
            <FiHomeIcon className="text-emerald-400" size={16} />
            <span className="text-sm font-medium tracking-wide text-white/90">
              MINISTRY OF INNOVATION & TECHNOLOGY
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fadeInUp [animation-delay:0.1s]">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-pulse">
              MINT
            </span>{" "}
            Navigator
          </h1>

          {/* Animated Tagline */}
          <div className="h-20 md:h-24 overflow-hidden relative">
            <p
              className={`text-base md:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed font-medium transition-all duration-500 ${
                isTextTransitioning
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {ROTATING_TAGLINES[currentTaglineIndex]}
            </p>
          </div>

          {/* Stats Grid */}
          <StatsGrid stats={stats} />

          {/* CTA Button */}
          <div className="flex flex-wrap justify-center gap-4 animate-fadeInUp [animation-delay:0.4s]">
            <button
              onClick={onScrollToSectors}
              className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <FiArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={16}
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center">
          <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ============ BACKGROUND MEDIA COMPONENT ============
const BackgroundMedia = ({ asset, videoRef, isTransitioning }) => {
  if (asset.type === "video") {
    return (
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        key={asset.url}
      >
        <source src={asset.url} type="video/mp4" />
      </video>
    );
  }

  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 bg-cover bg-center ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundImage: `url(${asset.url})` }}
    />
  );
};

// ============ CAROUSEL CONTROLS ============
const CarouselControls = ({ onPrevious, onNext }) => (
  <>
    <button
      onClick={onPrevious}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg"
      aria-label="Previous slide"
    >
      <FiChevronLeft size={24} />
    </button>
    <button
      onClick={onNext}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg"
      aria-label="Next slide"
    >
      <FiChevronRight size={24} />
    </button>
  </>
);

// ============ STATS GRID COMPONENT ============
const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto animate-fadeInUp [animation-delay:0.3s]">
    {[
      { value: stats.totalDepts, label: "Departments", color: "text-white" },
      { value: stats.totalSectors, label: "Sectors", color: "text-white" },
      { value: stats.avgRating, label: "Avg Rating", color: "text-amber-300" },
    ].map((stat, index) => (
      <div
        key={index}
        className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 text-center hover:bg-white/20 transition-colors duration-300"
      >
        <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
          {stat.value}
        </p>
        <p className="text-[11px] text-white/80 uppercase tracking-wide mt-1">
          {stat.label}
        </p>
      </div>
    ))}
  </div>
);

// ============ ANNOUNCEMENTS TICKER ============
const AnnouncementsTicker = ({ announcements }) => {
  if (announcements.length === 0) return null;

  const getPriorityStyles = (priority) => {
    const styles = {
      urgent: "bg-red-100 text-red-700 border-red-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      default: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return styles[priority] || styles.default;
  };

  const getTypeIcon = (type) => {
    const icons = {
      holiday: "🎉",
      event: "🎪",
      maintenance: "🔧",
      alert: "⚠️",
      default: "📢",
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex items-center gap-1 text-amber-700 text-sm font-semibold flex-shrink-0">
            <FiBell size={14} /> Announcements:
          </div>
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityStyles(announcement.priority)}`}
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
  );
};

// ============ SEARCH SECTION ============
const SearchSection = ({
  searchQuery,
  searchResults,
  showResults,
  onSearchChange,
  onResultClick,
  getFloorLabel,
}) => (
  <div className="container mx-auto px-4 -mt-7 sm:-mt-8 relative z-20">
    <div className="max-w-2xl mx-auto relative">
      <div className="bg-white rounded-2xl shadow-xl p-1.5 border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="relative flex items-center min-w-0">
          <FiSearch
            className="absolute left-4 text-slate-500 pointer-events-none z-10"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search departments, services, or buildings…"
            className="w-full min-w-0 pl-11 pr-[5.5rem] sm:pr-28 py-3.5 bg-white border-0 rounded-[0.875rem] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm text-slate-900 placeholder-slate-400 transition-all duration-300"
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-5 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:shadow-lg text-xs sm:text-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 mt-2 overflow-hidden animate-fadeInUp">
          {searchResults.map((dept) => (
            <Link
              key={dept.id}
              to={`/department/${dept.id}`}
              onClick={onResultClick}
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
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{getFloorLabel(dept.floor)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
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
);

// ============ SECTOR CARD ============
const SectorCard = ({ sector, sectorImage }) => (
  <Link
    to={`/sector/${sector.id}`}
    className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-emerald-300"
  >
    {/* Image Container */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={sectorImage}
        alt={sector.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4">
        <span
          className="inline-block px-3 py-1 text-[10px] font-bold text-white rounded-full shadow-md"
          style={{ backgroundColor: sector.color || "#0B2A4A" }}
        >
          {sector.building} • Sector {sector.id}
        </span>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white text-[10px] font-bold">
        <FiStar className="fill-yellow-400 text-yellow-400" size={10} />
        {(sector.avgRating || 4.8).toFixed(1)}
      </div>
    </div>

    {/* Card Content */}
    <div className="p-5">
      <h3 className="font-extrabold text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors leading-tight">
        {sector.name}
      </h3>
      <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
        {sector.description?.substring(0, 80) ||
          "Ministry sector providing essential services..."}
      </p>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3 mt-1">
        <div className="flex items-center gap-1.5 font-semibold">
          <FiMapPin size={11} className="text-emerald-500" />
          <span>
            {Math.max(2, Math.round((sector.departmentCount || 4) / 2))} min
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-amber-600">
          <FiUsers size={11} />
          <span>{sector.departmentCount || 0} units</span>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase group-hover:text-emerald-600 transition-colors">
          View Details
        </span>
        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center group-hover:bg-emerald-600 transition-all group-hover:translate-x-1">
          <FiArrowRight size={12} />
        </div>
      </div>
    </div>
  </Link>
);

// ============ SECTORS SECTION ============
const SectorsSection = ({ sectors }) => (
  <main id="sectors" className="container mx-auto px-4 py-12 scroll-mt-24">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full mb-3">
          <FiGrid className="text-emerald-600" size={14} />
          <span className="text-emerald-700 text-xs font-semibold tracking-wide">
            ORGANIZED BY SECTOR
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Explore Our Sectors
        </h2>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">
          Navigate through ministry departments organized by functional sectors
          with one‑tap navigation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sectors.map((sector) => {
          const sectorImage =
            sector.image ||
            sectorSplashImages[sector.id] ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop";

          return (
            <SectorCard
              key={sector.id}
              sector={sector}
              sectorImage={sectorImage}
            />
          );
        })}
      </div>
    </div>
  </main>
);

// ============ FEEDBACK CTA ============
const FeedbackCTA = () => (
  <div className="container mx-auto px-4 pb-16">
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        to="/feedback"
        className="group px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
      >
        <FiStar size={14} /> Leave General Feedback
      </Link>
    </div>
  </div>
);

// ============ MAIN HOME COMPONENT ============
const Home = () => {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 0,
  });

  // Refs
  const videoRef = useRef(null);
  const autoTimerRef = useRef(null);
  const taglineTimerRef = useRef(null);

  // ============ CAROUSEL HANDLERS ============
  const startAutoRotate = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
    }, AUTO_ROTATE_INTERVAL);
  }, []);

  const stopAutoRotate = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const resetAutoRotate = useCallback(() => {
    stopAutoRotate();
    startAutoRotate();
  }, [stopAutoRotate, startAutoRotate]);

  const handlePrevious = useCallback(() => {
    stopAutoRotate();
    setCurrentMediaIndex(
      (prev) =>
        (prev - 1 + BACKGROUND_ASSETS.length) % BACKGROUND_ASSETS.length,
    );
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
    resetAutoRotate();
  }, [stopAutoRotate, resetAutoRotate]);

  const handleNext = useCallback(() => {
    stopAutoRotate();
    setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
    resetAutoRotate();
  }, [stopAutoRotate, resetAutoRotate]);

  // Auto-rotate media
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
  }, [currentMediaIndex, resetAutoRotate, stopAutoRotate]);

  // ============ TAGLINE ROTATION ============
  useEffect(() => {
    if (taglineTimerRef.current) clearInterval(taglineTimerRef.current);
    taglineTimerRef.current = setInterval(() => {
      setIsTextTransitioning(true);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setTimeout(() => setIsTextTransitioning(false), 300);
      }, 200);
    }, TAGLINE_TRANSITION_INTERVAL);

    return () => {
      if (taglineTimerRef.current) clearInterval(taglineTimerRef.current);
    };
  }, []);

  // ============ DATA FETCHING ============
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

  // ============ SEARCH HANDLERS ============
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

  const scrollToSectors = () => {
    const sectorsSection = document.getElementById("sectors");
    if (sectorsSection) {
      sectorsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-gray-500 text-sm">Loading experience...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ============ RENDER ============
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <AnnouncementBanner />

        {/* Announcements Ticker */}
        <AnnouncementsTicker announcements={announcements} />

        {/* Hero Section */}
        <HeroSection
          currentMediaIndex={currentMediaIndex}
          currentTaglineIndex={currentTaglineIndex}
          isTransitioning={isTransitioning}
          isTextTransitioning={isTextTransitioning}
          stats={stats}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onScrollToSectors={scrollToSectors}
          videoRef={videoRef}
        />

        {/* Search Section */}
        <SearchSection
          searchQuery={searchQuery}
          searchResults={searchResults}
          showResults={showResults}
          onSearchChange={handleSearchChange}
          onResultClick={handleResultClick}
          getFloorLabel={getFloorLabel}
        />

        {/* Sectors Section */}
        <SectorsSection sectors={sectors} />

        {/* Feedback CTA */}
        <FeedbackCTA />
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-bounce {
          animation: bounce 1.5s infinite;
        }

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
