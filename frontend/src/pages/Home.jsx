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
  FiZap,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ============ PREMIUM HERO BACKGROUND ASSETS ============
const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-technology-circuit-board-connections-31201-large.mp4",
    title: "Innovation Hub",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&q=90",
    title: "Digital Transformation",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop&q=90",
    title: "Smart Government",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop&q=90",
    title: "Future Technology",
  },
];

// ============ UNIQUE HD SECTOR SPLASH IMAGES (Government/Ministry Theme) ============
const sectorSplashImages = {
  1: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=90",
  2: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop&q=90",
  3: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=500&fit=crop&q=90",
  4: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=500&fit=crop&q=90",
  5: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&q=90",
  6: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&q=90",
  7: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&h=500&fit=crop&q=90",
  8: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=500&fit=crop&q=90",
};

// ============ CONSTANTS ============
const AUTO_ROTATE_INTERVAL = 8000;
const TAGLINE_TRANSITION_INTERVAL = 5000;

// ============ ROTATING TAGLINES (Government Focus) ============
const ROTATING_TAGLINES = [
  "Empowering Digital Government Services",
  "Innovation in Public Administration",
  "Navigate with Confidence, Serve with Excellence",
  "Technology for Better Public Service",
  "Your Portal to Government Innovation",
];

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
    <div className="hero-section relative w-full overflow-hidden">
      {/* Background Media with Advanced Filters */}
      <BackgroundMedia
        asset={currentAsset}
        videoRef={videoRef}
        isTransitioning={isTransitioning}
      />

      {/* Premium Gradient Overlay */}
      <div className="hero-gradient absolute inset-0" />

      {/* Animated Particles Background */}
      <div className="particles-container absolute inset-0 opacity-30">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
      </div>

      {/* Nigeria Flag Bar */}
      <div className="flag-bar absolute top-0 left-0 right-0 h-2 flex z-30">
        <div className="flex-1 bg-emerald-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-600" />
      </div>

      {/* Navigation Buttons */}
      <CarouselControls onPrevious={onPrevious} onNext={onNext} />

      {/* Main Hero Content */}
      <div className="hero-content relative z-10 container mx-auto px-4 min-h-[85vh] flex flex-col justify-center items-center text-center">
        <div className="max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
          {/* Government Badge */}
          <div className="badge-container inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/30 shadow-2xl hover:bg-white/15 transition-all duration-500 cursor-default group">
            <div className="badge-icon-wrapper relative">
              <FiShield
                className="text-emerald-400 group-hover:scale-110 transition-transform"
                size={18}
              />
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-sm font-bold tracking-widest text-white/95 uppercase">
              Ministry of Innovation & Technology
            </span>
            <FiZap className="text-amber-400 text-xs animate-pulse" />
          </div>

          {/* Main Title with Advanced Typography */}
          <div className="title-container space-y-4">
            <p className="text-emerald-300 text-xs md:text-sm font-bold tracking-[0.3em] uppercase animate-fadeInUp [animation-delay:0.1s]">
              Welcome to the Future
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] animate-fadeInUp [animation-delay:0.2s]">
              <span className="block">MINT</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-300 animate-shimmer">
                Navigator
              </span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-transparent mx-auto mt-4 animate-fadeInUp [animation-delay:0.3s]" />
          </div>

          {/* Animated Tagline with Transition */}
          <div className="tagline-container h-16 md:h-20 relative overflow-hidden">
            <p
              className={`text-lg md:text-2xl font-semibold text-white/90 max-w-3xl mx-auto leading-relaxed transition-all duration-700 transform ${
                isTextTransitioning
                  ? "opacity-0 translate-y-6"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {ROTATING_TAGLINES[currentTaglineIndex]}
            </p>
          </div>

          {/* Advanced Stats Grid */}
          <StatsGrid stats={stats} />

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-5 animate-fadeInUp [animation-delay:0.5s]">
            <button
              onClick={onScrollToSectors}
              className="cta-button-primary group relative px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-lg overflow-hidden shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Services
                <FiArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </span>
            </button>
            <button className="cta-button-secondary group relative px-10 py-4 bg-white/10 backdrop-blur-md text-white font-bold text-lg rounded-lg border-2 border-white/30 hover:border-white/60 overflow-hidden transition-all duration-300">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Learn More
                <FiTrendingUp size={20} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator />

      {/* Media Indicator Dots */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {BACKGROUND_ASSETS.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-500 ${
              index === currentMediaIndex
                ? "w-8 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
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
      className="carousel-btn carousel-btn-prev group absolute left-6 top-1/2 -translate-y-1/2 z-30"
      aria-label="Previous slide"
    >
      <FiChevronLeft size={28} />
    </button>
    <button
      onClick={onNext}
      className="carousel-btn carousel-btn-next group absolute right-6 top-1/2 -translate-y-1/2 z-30"
      aria-label="Next slide"
    >
      <FiChevronRight size={28} />
    </button>
  </>
);

// ============ STATS GRID COMPONENT ============
const StatsGrid = ({ stats }) => {
  const statItems = [
    { icon: FiGrid, value: stats.totalDepts, label: "Departments" },
    { icon: FiUsers, value: stats.totalSectors, label: "Sectors" },
    {
      icon: FiStar,
      value: stats.avgRating,
      label: "Avg Rating",
      color: "text-amber-300",
    },
  ];

  return (
    <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto animate-fadeInUp [animation-delay:0.4s]">
      {statItems.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="stat-card group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-5 text-center hover:bg-white/20 hover:border-white/40 transition-all duration-500 cursor-default overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <IconComponent
                className="text-emerald-300 group-hover:scale-125 transition-transform duration-300"
                size={20}
              />
              <p
                className={`text-3xl md:text-4xl font-black ${stat.color || "text-white"}`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-white/70 font-bold tracking-widest uppercase">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============ SCROLL INDICATOR ============
const ScrollIndicator = () => (
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
    <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center relative">
      <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse absolute" />
      <div
        className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse absolute animate-bounce"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  </div>
);

// ============ ANNOUNCEMENTS TICKER ============
const AnnouncementsTicker = ({ announcements }) => {
  if (announcements.length === 0) return null;

  const getPriorityStyles = (priority) => {
    const styles = {
      urgent: "bg-red-600/20 text-red-300 border-red-500/30",
      high: "bg-orange-600/20 text-orange-300 border-orange-500/30",
      medium: "bg-amber-600/20 text-amber-300 border-amber-500/30",
      default: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
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
    <div className="ticker-bg bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md border-b border-emerald-500/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-emerald-400 font-bold flex-shrink-0 uppercase text-sm">
            <FiBell size={16} className="animate-pulse" />
            Announcements
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`announcement-badge inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border backdrop-blur-sm flex-shrink-0 transition-all hover:shadow-lg ${getPriorityStyles(announcement.priority)}`}
              >
                <span className="text-lg">
                  {getTypeIcon(announcement.type)}
                </span>
                <span>{announcement.title}</span>
                <span className="hidden sm:inline text-white/60">•</span>
                <span className="hidden sm:inline text-white/80 truncate max-w-xs">
                  {announcement.message}
                </span>
              </div>
            ))}
          </div>
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
}) => (
  <div className="search-section container mx-auto px-4 -mt-10 relative z-30">
    <div className="max-w-3xl mx-auto">
      <div className="search-box bg-white rounded-xl shadow-2xl border border-slate-200 p-1 backdrop-blur-xl hover:shadow-3xl transition-all duration-500">
        <div className="relative flex items-center min-w-0">
          <FiSearch
            className="absolute left-5 text-emerald-600 pointer-events-none z-10 font-bold"
            size={22}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search departments, services, or facilities…"
            className="w-full min-w-0 pl-14 pr-32 py-4 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-base text-slate-900 placeholder-slate-400 font-medium transition-all"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-sm">
            Search
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-4 right-4 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 mt-3 overflow-hidden animate-fadeInUp max-h-96 overflow-y-auto">
          {searchResults.map((dept) => (
            <Link
              key={dept.id}
              to={`/department/${dept.id}`}
              onClick={onResultClick}
              className="block px-5 py-4 hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0 group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-base">
                    {dept.name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <FiMapPin className="text-emerald-600" size={12} />
                      <strong>Bldg</strong> {dept.building}
                    </span>
                    <span className="bg-slate-100 px-2 py-1 rounded">
                      <strong>{getFloorLabel(dept.floor)}</strong>
                    </span>
                    <span className="bg-slate-100 px-2 py-1 rounded">
                      <strong>Rm</strong> {dept.room}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full flex-shrink-0">
                  <FiStar className="fill-current text-amber-500" size={14} />
                  <span className="text-sm font-bold text-amber-900">
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
    className="sector-card-link group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-emerald-400"
  >
    {/* Image Container with Advanced Effects */}
    <div className="sector-image-wrapper relative h-52 overflow-hidden bg-slate-200">
      <img
        src={sectorImage}
        alt={sector.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-100"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=90";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/60 transition-all duration-500" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4">
        <span className="inline-block px-4 py-2 text-xs font-bold text-white rounded-lg shadow-lg backdrop-blur-md bg-emerald-600/80 group-hover:bg-emerald-600 transition-all">
          <strong>Sector {sector.id}</strong> • {sector.building}
        </span>
      </div>

      {/* Rating Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold border border-white/30 group-hover:bg-white/30 transition-all">
        <FiStar className="fill-amber-400 text-amber-400" size={12} />
        <span>{(sector.avgRating || 4.8).toFixed(1)}</span>
      </div>
    </div>

    {/* Card Content */}
    <div className="sector-card-content p-6 space-y-4">
      {/* Title */}
      <div>
        <h3 className="font-black text-slate-900 text-xl mb-2 group-hover:text-emerald-600 transition-colors leading-tight">
          {sector.name}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-medium">
          {sector.description?.substring(0, 85) ||
            "Ministry sector providing essential services..."}
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
          <FiMapPin size={13} />
          <span>
            {Math.max(2, Math.round((sector.departmentCount || 4) / 2))} min
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          <FiUsers size={13} />
          <span>
            <strong>{sector.departmentCount || 0}</strong> Departments
          </span>
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase group-hover:text-emerald-600 transition-colors">
          View Details
        </span>
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:bg-emerald-700 transition-all group-hover:translate-x-1 shadow-lg">
          <FiArrowRight size={14} />
        </div>
      </div>
    </div>
  </Link>
);

// ============ SECTORS SECTION ============
const SectorsSection = ({ sectors }) => (
  <main
    id="sectors"
    className="sectors-section container mx-auto px-4 py-16 scroll-mt-24"
  >
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-4 border border-emerald-200">
          <FiGrid className="text-emerald-600 font-bold" size={16} />
          <span className="text-emerald-700 text-xs font-bold tracking-widest uppercase">
            Organized by Sector
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 leading-tight">
          Explore Our <span className="text-emerald-600">Sectors</span>
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
          Navigate ministry departments organized by functional sectors with
          advanced wayfinding and one-tap access
        </p>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sectors.map((sector) => {
          const sectorImage =
            sector.image ||
            sectorSplashImages[sector.id] ||
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=90";

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
  <div className="feedback-section container mx-auto px-4 py-16">
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div>
        <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
          We Value Your <span className="text-emerald-600">Feedback</span>
        </h3>
        <p className="text-slate-600 font-medium text-lg">
          Help us improve your experience with the MINT Navigator
        </p>
      </div>
      <Link
        to="/feedback"
        className="inline-block group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <FiStar size={18} /> Leave Your Feedback
        </span>
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
      setSearchResults(results.slice(0, 8));
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
          <div className="text-center space-y-4">
            <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-lg">
              Loading your experience...
            </p>
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
        />

        {/* Sectors Section */}
        <SectorsSection sectors={sectors} />

        {/* Feedback CTA */}
        <FeedbackCTA />
      </div>

      {/* ============ ADVANCED CSS ANIMATIONS & STYLES ============ */}
      <style jsx>{`
        /* ========== KEYFRAME ANIMATIONS ========== */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes rotateGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* ========== HERO SECTION STYLES ========== */
        .hero-section {
          height: 90vh;
          min-height: 700px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          position: relative;
        }

        .hero-gradient {
          background: linear-gradient(
            135deg,
            rgba(11, 42, 74, 0.88) 0%,
            rgba(16, 52, 87, 0.75) 50%,
            rgba(26, 58, 92, 0.8) 100%
          );
          backdrop-filter: blur(3px);
        }

        .hero-content {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          background-size: 2000px 100%;
          animation: shimmer 8s ease-in-out infinite;
        }

        .animate-bounce {
          animation: bounce 1.5s infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* ========== FLAG BAR ========== */
        .flag-bar {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* ========== BADGE STYLES ========== */
        .badge-container {
          animation: slideIn 0.8s ease-out forwards;
          opacity: 0;
          animation-delay: 0s;
        }

        .badge-icon-wrapper {
          position: relative;
        }

        /* ========== TITLE STYLES ========== */
        .title-container {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          animation-delay: 0.1s;
        }

        .title-container h1 {
          letter-spacing: -0.02em;
          font-weight: 900;
          text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* ========== STATS GRID ========== */
        .stats-grid {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          animation-delay: 0.3s;
        }

        .stat-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2);
        }

        /* ========== CTA BUTTONS ========== */
        .cta-button-primary {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          animation-delay: 0.5s;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 10px;
        }

        .cta-button-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
        }

        .cta-button-secondary {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          animation-delay: 0.55s;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-button-secondary:hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
        }

        /* ========== CAROUSEL CONTROLS ========== */
        .carousel-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 30;
        }

        .carousel-btn:hover {
          background-color: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        /* ========== SEARCH SECTION ========== */
        .search-section {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        .search-box {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-box:focus-within {
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .search-box input::placeholder {
          font-weight: 500;
        }

        /* ========== SECTOR CARDS ========== */
        .sector-card-link {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .sector-image-wrapper {
          position: relative;
          overflow: hidden;
        }

        .sector-card-link:hover .sector-image-wrapper img {
          filter: brightness(1.1);
        }

        .sector-card-content {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sector-card-link:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15);
        }

        /* ========== ANNOUNCEMENTS ========== */
        .ticker-bg {
          animation: slideIn 0.8s ease-out forwards;
        }

        .announcement-badge {
          animation: slideIn 0.6s ease-out forwards;
          opacity: 0;
        }

        /* ========== SECTIONS ========== */
        .sectors-section {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .feedback-section {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        /* ========== SCROLLBAR HIDE ========== */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* ========== PARTICLES ========== */
        .particles-container {
          pointer-events: none;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(16, 185, 129, 0.4) 0%,
            transparent 70%
          );
        }

        .particle-1 {
          width: 300px;
          height: 300px;
          top: -150px;
          left: -150px;
          animation: float 20s ease-in-out infinite;
        }

        .particle-2 {
          width: 200px;
          height: 200px;
          bottom: -100px;
          right: -100px;
          animation: float 25s ease-in-out infinite 2s;
        }

        .particle-3 {
          width: 250px;
          height: 250px;
          top: 50%;
          right: -125px;
          animation: float 22s ease-in-out infinite 1s;
        }

        /* ========== RESPONSIVE DESIGN ========== */
        @media (max-width: 768px) {
          .hero-section {
            height: 85vh;
            min-height: 600px;
          }

          .carousel-btn {
            width: 40px;
            height: 40px;
          }

          .title-container h1 {
            font-size: 2.5rem;
          }

          .stats-grid {
            gap: 1rem;
          }

          .sector-card-link {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
        }

        @media (max-width: 640px) {
          .hero-gradient {
            background: linear-gradient(
              135deg,
              rgba(11, 42, 74, 0.92) 0%,
              rgba(16, 52, 87, 0.85) 100%
            );
          }

          .carousel-btn {
            display: none;
          }

          .title-container h1 {
            font-size: 2rem;
          }

          .badge-container {
            flex-direction: column;
            width: 90%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Home;
