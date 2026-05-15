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
  FiTrendingUp,
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ============ ETHIOPIAN COLORS (MINT WEBSITE COLORS) ============
// Gold/Yellow: #FFD700 (Primary)
// Blue: #1E3A8A (Secondary - Deep Government Blue)
// Red: #DC2626 (Accent - Ethiopian Red)
// White: #FFFFFF
// Dark: #0F172A (Text/Backgrounds)

// ============ PREMIUM HERO BACKGROUND ASSETS ============
const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-technology-circuit-board-connections-31201-large.mp4",
    title: "Technology Innovation",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&q=90",
    title: "Digital Government",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1920&h=1080&fit=crop&q=90",
    title: "Advanced Technology",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop&q=90",
    title: "Innovation Hub",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&q=90",
    title: "Government Infrastructure",
  },
];

const AUTO_ROTATE_INTERVAL = 8000;
const TAGLINE_TRANSITION_INTERVAL = 5000;

// ============ GOVERNMENT TAGLINES ============
const ROTATING_TAGLINES = [
  "Innovating Ethiopia's Digital Future",
  "Technology for National Development",
  "Science, Innovation & Digital Transformation",
  "Building Tomorrow's Ethiopia Today",
  "Ministry of Innovation & Technology - Serving Citizens",
];

// ============ UNIQUE SECTOR IMAGES (ETHIOPIAN GOVERNMENT THEME) ============
const sectorSplashImages = {
  1: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=90",
  2: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=500&fit=crop&q=90",
  3: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop&q=90",
  4: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&q=90",
  5: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop&q=90",
  6: "https://images.unsplash.com/photo-1488229297570-58520e90b832?w=800&h=500&fit=crop&q=90",
  7: "https://images.unsplash.com/photo-1547921f-3b15-4b2c-8d8b-7c5b5e5c5f5e?w=800&h=500&fit=crop&q=90",
  8: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=500&fit=crop&q=90",
};

// ============ ETHIOPIAN FLAG COLORS ============
const ETHIOPIAN_FLAG = {
  green: "#239B56",
  yellow: "#FFD700",
  red: "#DC2626",
};

// ============ GOVERNMENT BLUE & GOLD ============
const GOVT_COLORS = {
  primary: "#1E3A8A", // Deep Government Blue
  secondary: "#FFD700", // Gold/Yellow
  accent: "#DC2626", // Red
  light: "#F8FAFC", // Light slate
  dark: "#0F172A", // Very dark
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
    <div className="relative h-[90vh] min-h-[650px] w-full overflow-hidden group">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 right-20 w-64 h-64 bg-gradient-to-l from-red-600/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Background Media */}
      <BackgroundMedia
        asset={currentAsset}
        videoRef={videoRef}
        isTransitioning={isTransitioning}
      />

      {/* Premium Gradient Overlay - Ethiopian Government Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/88 via-[#1F2937]/85 to-[#111827]/90 backdrop-blur-[3px]" />

      {/* Ethiopian Flag Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 flex z-30 shadow-lg">
        <div className="w-1/3 bg-[#239B56]" />
        <div className="w-1/3 bg-[#FFD700]" />
        <div className="w-1/3 bg-[#DC2626]" />
      </div>

      {/* Carousel Navigation Buttons */}
      <CarouselControls onPrevious={onPrevious} onNext={onNext} />

      {/* Main Hero Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <div className="max-w-5xl mx-auto w-full space-y-8 animate-fadeInDown">
          {/* Government Badge with Icon */}
          <div className="inline-flex items-center gap-3 bg-white/[0.08] backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl hover:bg-white/[0.12] transition-all duration-300 animate-slideInUp">
            <FiHomeIcon className="text-yellow-400 animate-bounce" size={20} />
            <span className="text-sm md:text-base font-bold tracking-wider text-white/95">
              MINISTRY OF INNOVATION & TECHNOLOGY
            </span>
            <span className="text-xs font-semibold text-yellow-300 ml-2">
              🇪🇹 ETHIOPIA
            </span>
          </div>

          {/* Main Title with Bold Styling */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight animate-slideInUp animation-delay-100 drop-shadow-2xl">
              Welcome to
            </h1>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 animate-shimmer drop-shadow-2xl leading-tight">
              MINT NAVIGATOR
            </h2>
            <p className="text-base md:text-lg text-white/90 font-semibold">
              Ethiopian Government's Premier Digital Innovation Platform
            </p>
          </div>

          {/* Animated Rotating Tagline */}
          <div className="h-16 md:h-20 overflow-hidden relative px-4">
            <p
              className={`text-lg md:text-2xl font-bold text-yellow-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ${
                isTextTransitioning
                  ? "opacity-0 translate-y-8"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {ROTATING_TAGLINES[currentTaglineIndex]}
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <StatsGrid stats={stats} />

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 animate-slideInUp animation-delay-300">
            <button
              onClick={onScrollToSectors}
              className="group relative px-8 md:px-10 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-blue-900 font-black text-base md:text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/50 hover:-translate-y-1 active:translate-y-0"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <FiTrendingUp size={20} />
                EXPLORE SECTORS
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <Link
              to="/feedback"
              className="group relative px-8 md:px-10 py-4 bg-white/10 backdrop-blur-md text-white font-black text-base md:text-lg rounded-xl border-2 border-white/30 overflow-hidden transition-all duration-300 hover:bg-white/20 hover:border-yellow-400 hover:shadow-lg hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FiStar size={20} />
                FEEDBACK
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-yellow-400 flex justify-center bg-white/5 backdrop-blur">
          <div className="w-1.5 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {BACKGROUND_ASSETS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {}}
            className={`transition-all duration-300 rounded-full ${
              idx === currentMediaIndex
                ? "w-8 h-2 bg-yellow-400"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${idx + 1}`}
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
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
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
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 bg-cover bg-center ${
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
      className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-yellow-400/20 hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
      aria-label="Previous slide"
    >
      <FiChevronLeft
        size={28}
        className="group-hover:scale-125 transition-transform"
      />
    </button>
    <button
      onClick={onNext}
      className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-yellow-400/20 hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
      aria-label="Next slide"
    >
      <FiChevronRight
        size={28}
        className="group-hover:scale-125 transition-transform"
      />
    </button>
  </>
);

// ============ PREMIUM STATS GRID ============
const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto">
    {[
      {
        value: stats.totalDepts,
        label: "DEPARTMENTS",
        color: "from-yellow-400 to-amber-500",
        icon: "🏛️",
      },
      {
        value: stats.totalSectors,
        label: "SECTORS",
        color: "from-blue-400 to-blue-600",
        icon: "🌐",
      },
      {
        value: stats.avgRating,
        label: "RATING",
        color: "from-red-400 to-red-600",
        icon: "⭐",
      },
    ].map((stat, index) => (
      <div
        key={index}
        className="group relative rounded-2xl border-2 border-white/20 bg-white/[0.08] backdrop-blur-xl px-6 py-6 text-center hover:bg-white/[0.15] hover:border-white/40 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />
        <div className="relative z-10">
          <p className="text-3xl md:text-4xl font-black text-white mb-2">
            {stat.value}
          </p>
          <p className="text-xs md:text-sm font-black tracking-widest text-yellow-300 group-hover:text-yellow-200 transition-colors">
            {stat.icon} {stat.label}
          </p>
        </div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
      </div>
    ))}
  </div>
);

// ============ ANNOUNCEMENTS TICKER ============
const AnnouncementsTicker = ({ announcements }) => {
  if (announcements.length === 0) return null;

  const getPriorityStyles = (priority) => {
    const styles = {
      urgent: "bg-red-900/30 text-red-200 border-red-500/50",
      high: "bg-orange-900/30 text-orange-200 border-orange-500/50",
      medium: "bg-yellow-900/30 text-yellow-200 border-yellow-500/50",
      default: "bg-blue-900/30 text-blue-200 border-blue-500/50",
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
    <div className="bg-gradient-to-r from-blue-900/40 via-blue-800/40 to-blue-900/40 backdrop-blur-md border-b-2 border-yellow-400/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex items-center gap-2 text-yellow-300 text-sm md:text-base font-bold flex-shrink-0">
            <FiBell size={18} className="animate-bounce" /> ALERTS:
          </div>
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg text-xs md:text-sm font-bold border-2 flex-shrink-0 backdrop-blur-sm transition-all hover:shadow-lg hover:border-yellow-400 ${getPriorityStyles(announcement.priority)}`}
            >
              <span className="text-lg">{getTypeIcon(announcement.type)}</span>
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
  );
};

// ============ PREMIUM SEARCH SECTION ============
const SearchSection = ({
  searchQuery,
  searchResults,
  showResults,
  onSearchChange,
  onResultClick,
  getFloorLabel,
}) => (
  <div className="container mx-auto px-4 -mt-8 md:-mt-10 relative z-20">
    <div className="max-w-3xl mx-auto relative">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border-2 border-yellow-300/30 hover:border-yellow-400/50 transition-all duration-300 group">
        <div className="relative flex items-center min-w-0">
          <FiSearch
            className="absolute left-5 text-blue-600 pointer-events-none z-10 group-hover:scale-110 transition-transform"
            size={22}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search departments, services, buildings..."
            className="w-full min-w-0 pl-14 pr-32 md:pr-40 py-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-blue-900 placeholder-blue-400 font-semibold transition-all duration-300"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-900 px-6 md:px-8 py-2.5 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 active:scale-95 text-sm md:text-base"
          >
            SEARCH
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-2xl border-2 border-yellow-300/30 z-50 mt-4 overflow-hidden animate-slideInUp">
          {searchResults.map((dept) => (
            <Link
              key={dept.id}
              to={`/department/${dept.id}`}
              onClick={onResultClick}
              className="block px-5 py-4 hover:bg-blue-50 transition-colors border-b border-blue-100 last:border-b-0 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-blue-900 group-hover:text-yellow-600 transition-colors text-base">
                    {dept.name}
                  </div>
                  <div className="text-xs text-blue-600 flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 font-semibold">
                      <FiMapPin className="text-yellow-500" size={13} />
                      Bldg {dept.building}
                    </span>
                    <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    <span>{getFloorLabel(dept.floor)}</span>
                    <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    <span>Rm {dept.room}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full">
                  <FiStar className="fill-current text-yellow-500 text-sm" />
                  <span className="text-sm font-bold text-blue-900">
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

// ============ PREMIUM SECTOR CARD ============
const SectorCard = ({ sector, sectorImage }) => (
  <Link
    to={`/sector/${sector.id}`}
    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-blue-100 hover:border-yellow-400"
  >
    {/* Image Container */}
    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
      <img
        src={sectorImage}
        alt={sector.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=90";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/30 to-transparent group-hover:from-blue-900/60 transition-all duration-300" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="inline-block px-4 py-2 text-xs md:text-sm font-black text-white rounded-lg shadow-lg bg-gradient-to-r from-yellow-500 to-amber-600 drop-shadow-lg">
          Sector {sector.id}
        </span>
        <span className="inline-block px-3 py-2 text-xs font-bold text-yellow-300 bg-blue-900/60 rounded-lg border border-yellow-400/50 backdrop-blur">
          {sector.building}
        </span>
      </div>

      {/* Rating Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg hover:bg-yellow-400 transition-colors duration-300">
        <FiStar className="fill-yellow-400 text-yellow-400 text-lg" size={16} />
        <span className="font-black text-blue-900">
          {(sector.avgRating || 4.8).toFixed(1)}
        </span>
      </div>
    </div>

    {/* Card Content */}
    <div className="p-6 bg-gradient-to-br from-white to-blue-50">
      <h3 className="font-black text-blue-900 text-xl md:text-2xl mb-2 group-hover:text-yellow-600 transition-colors leading-tight">
        {sector.name}
      </h3>
      <p className="text-blue-600 text-sm mb-5 line-clamp-2 leading-relaxed font-semibold">
        {sector.description?.substring(0, 80) ||
          "Ethiopian government sector providing essential services..."}
      </p>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm font-bold border-t-2 border-blue-100 pt-4 mt-4">
        <div className="flex items-center gap-2 text-yellow-600">
          <FiMapPin size={16} className="text-yellow-500" />
          <span>
            {Math.max(2, Math.round((sector.departmentCount || 4) / 2))} min
          </span>
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <FiUsers size={16} className="text-red-500" />
          <span>{sector.departmentCount || 0} Departments</span>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-5 flex items-center justify-between group/btn">
        <span className="text-xs font-black tracking-widest text-blue-400 uppercase group-hover/btn:text-yellow-600 transition-colors">
          VIEW SECTOR
        </span>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-blue-900 flex items-center justify-center font-bold group-hover/btn:bg-red-600 group-hover/btn:text-white transition-all group-hover/btn:translate-x-1 shadow-lg">
          <FiArrowRight size={18} />
        </div>
      </div>
    </div>
  </Link>
);

// ============ SECTORS SECTION ============
const SectorsSection = ({ sectors }) => (
  <main
    id="sectors"
    className="container mx-auto px-4 py-16 md:py-24 scroll-mt-24"
  >
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-5 py-2.5 rounded-full mb-5 border-2 border-yellow-300">
          <FiGrid className="text-yellow-600 animate-spin" size={20} />
          <span className="text-yellow-900 text-sm md:text-base font-black tracking-wider">
            GOVERNMENT SECTORS
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-900 mb-4 leading-tight">
          Explore Our{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-600">
            Sectors
          </span>
        </h2>
        <p className="text-blue-600 text-base md:text-lg max-w-3xl mx-auto font-bold leading-relaxed">
          Navigate through Ethiopian government departments organized by
          functional sectors with seamless one-tap navigation
        </p>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-12 border-2 border-yellow-400/30 shadow-2xl text-center">
      <p className="text-white/90 text-lg font-bold mb-6">
        Help us improve your experience with MINT Navigator
      </p>
      <Link
        to="/feedback"
        className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-900 font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
      >
        <FiStar size={24} />
        SHARE YOUR FEEDBACK
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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-red-600 rounded-full animate-spin mx-auto" />
            <p className="text-white text-lg font-bold">
              Loading MINT Navigator...
            </p>
            <p className="text-yellow-300 text-sm font-semibold">
              Ethiopian Government Digital Platform
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ============ RENDER ============
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
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

      {/* Global Advanced Styles */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
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
            opacity: 0.6;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-bounce {
          animation: bounce 1.5s infinite;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .drop-shadow-2xl {
          filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));
        }

        /* Text shadows for bold effect */
        h1,
        h2,
        h3 {
          text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Layout>
  );
};

export default Home;
