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
  FiActivity,
  FiGlobe,
  FiZap,
} from "react-icons/fi";
import axios from "axios";

// API Configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Premium Assets representing Innovation & Technology
const BACKGROUND_ASSETS = [
  {
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-digital-circuit-board-with-glowing-connections-31202-large.mp4",
    poster:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    label: "Global Connectivity",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80",
    label: "Cyber Intelligence",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=80",
    label: "Future Dynamics",
  },
];

const ROTATING_TAGLINES = [
  "Pioneering Ethiopia's Digital Frontier.",
  "Where Innovation Meets Institutional Excellence.",
  "Streamlining Your Journey through Technology.",
  "Digital Transformation for Every Citizen.",
  "Building a Smart Ethiopia, One Step at a Time.",
];

const Home = () => {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 4.8,
  });

  const videoRef = useRef(null);
  const autoTimerRef = useRef(null);

  // Logic: Carousel Management
  const startAutoRotate = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      handleNext();
    }, 8000);
  }, []);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % BACKGROUND_ASSETS.length);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMediaIndex(
        (prev) =>
          (prev - 1 + BACKGROUND_ASSETS.length) % BACKGROUND_ASSETS.length,
      );
      setIsTransitioning(false);
    }, 500);
  };

  // Logic: Tagline Rotation
  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setIsTextTransitioning(true);
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setIsTextTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(taglineInterval);
  }, []);

  // Logic: Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectorsData, deptsData] = await Promise.all([
          sectorService.getPublicSectors(),
          departmentService.getAll(),
        ]);

        setSectors(sectorsData || []);

        let avg = 4.9;
        try {
          const res = await API.get("/feedback/stats");
          avg = res.data?.average || 4.9;
        } catch (e) {
          console.warn("Feedback offline");
        }

        setStats({
          totalDepts: deptsData?.length || 0,
          totalSectors: sectorsData?.length || 0,
          avgRating: parseFloat(avg).toFixed(1),
        });
      } catch (err) {
        console.error("Critical Fetch Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    startAutoRotate();
    return () => clearInterval(autoTimerRef.current);
  }, [startAutoRotate]);

  // Logic: Search Integration
  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = searchDepartments(searchQuery);
      setSearchResults(results.slice(0, 5));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-emerald-500 font-mono tracking-widest animate-pulse">
          INITIALIZING MINT NAVIGATOR...
        </p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <AnnouncementBanner />

        {/* Cinematic Hero Section */}
        <section className="relative h-[92vh] min-h-[750px] w-full bg-black overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            {BACKGROUND_ASSETS[currentMediaIndex].type === "video" ? (
              <video
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
            {/* Elite Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </div>

          {/* Ethiopian Sovereign Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 flex z-50">
            <div className="h-full w-1/3 bg-[#078930]" />
            <div className="h-full w-1/3 bg-[#FCDD09]" />
            <div className="h-full w-1/3 bg-[#DA121A]" />
          </div>

          {/* Hero Content Area */}
          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center">
            <div className="mb-8 animate-fade-in-down">
              <span className="px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-[0.3em] uppercase">
                Federal Democratic Republic of Ethiopia
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white text-center tracking-tighter leading-[0.9]">
              MINT{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                NAVIGATOR
              </span>
            </h1>

            <div className="h-24 flex items-center justify-center">
              <p
                className={`text-xl md:text-2xl text-slate-300 font-light tracking-wide transition-all duration-700 ${isTextTransitioning ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}
              >
                {ROTATING_TAGLINES[currentTaglineIndex]}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-12 md:gap-24 my-12">
              <div className="text-center group cursor-help">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  {stats.totalDepts}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Departments
                </div>
              </div>
              <div className="text-center group cursor-help">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {stats.totalSectors}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Sectors
                </div>
              </div>
              <div className="text-center group cursor-help">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                  {stats.avgRating}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  User Score
                </div>
              </div>
            </div>

            {/* Premium CTA */}
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              <button
                onClick={() =>
                  document
                    .getElementById("search-anchor")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                Get Started <FiArrowRight />
              </button>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="absolute bottom-12 right-12 z-20 flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="p-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              <FiChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
              {BACKGROUND_ASSETS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 transition-all duration-500 rounded-full ${currentMediaIndex === i ? "w-8 bg-emerald-500" : "w-2 bg-white/20"}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="p-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </section>

        {/* Advanced Search Interface */}
        <div
          id="search-anchor"
          className="relative z-30 -mt-20 container mx-auto px-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] p-3 border border-slate-100">
            <div className="relative flex items-center">
              <div className="absolute left-8 text-emerald-600">
                <FiSearch size={28} className="animate-pulse" />
              </div>
              <input
                type="text"
                placeholder="Which department or service are you looking for today?"
                className="w-full pl-20 pr-12 py-8 text-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none rounded-[2rem]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-6 hidden md:block">
                <kbd className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">
                  CTRL + K
                </kbd>
              </div>
            </div>

            {/* Dynamic Results Glass Card */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-6 bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden z-[100] animate-fade-in-up">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
                    Instant Match
                  </span>
                  <span className="text-xs text-emerald-600 font-bold px-4">
                    {searchResults.length} Results
                  </span>
                </div>
                {searchResults.map((res) => (
                  <Link
                    key={res.id}
                    to={`/department/${res.id}`}
                    className="flex items-center gap-6 p-6 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <FiGrid size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {res.name}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <FiMapPin size={14} className="text-emerald-500" />{" "}
                        Building {res.building}, Level{" "}
                        {getFloorLabel(res.floor)}
                      </p>
                    </div>
                    <FiArrowRight className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-emerald-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sectors Grid: Elite Cards */}
        <section className="container mx-auto px-6 py-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-6">
                Institutional <br />{" "}
                <span className="text-emerald-600">Verticals</span>
              </h2>
              <div className="w-24 h-2 bg-emerald-500 rounded-full mb-6" />
              <p className="text-xl text-slate-500 leading-relaxed">
                Navigate through specialized sectors of innovation. Each
                vertical is designed to provide seamless access to governmental
                technological services.
              </p>
            </div>
            <Link
              to="/sectors"
              className="flex items-center gap-3 font-bold text-slate-900 group"
            >
              View All Functional Areas{" "}
              <div className="p-3 bg-slate-900 text-white rounded-full group-hover:bg-emerald-600 transition-colors">
                <FiArrowRight />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {sectors.map((sector, idx) => (
              <Link
                key={sector.id || idx}
                to={`/sector/${sector.id}`}
                className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-emerald-900/10"
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={
                      sector.image ||
                      `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800`
                    }
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={sector.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

                  {/* Floating Tag */}
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                    {sector.building || "HQ-Block"}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">
                    <FiZap /> {sector.departmentCount || 12} Departments
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-400 transition-colors">
                    {sector.name}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <FiStar fill="currentColor" size={14} /> 4.8
                    </div>
                    <div className="text-white/40 text-xs font-medium">
                      EXPLORE <FiArrowRight className="inline ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Global Footer CTA */}
        <section className="container mx-auto px-6 pb-20">
          <div className="bg-slate-950 rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -mr-48 -mt-48" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 mb-10">
                <FiGlobe size={40} className="animate-spin-slow" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                Shape the Future <br /> of Service Innovation
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mb-12">
                Your interaction today helps us refine the digital experience
                for millions. Help us build a smarter Ministry.
              </p>
              <Link
                to="/feedback"
                className="group px-12 py-5 bg-white text-slate-950 rounded-full font-black text-lg hover:bg-emerald-400 hover:text-white transition-all flex items-center gap-3 shadow-2xl"
              >
                Submit Digital Feedback{" "}
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fade-in-down {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          .animate-fade-in-down {
            animation: fade-in-down 0.8s ease-out forwards;
          }
          .animate-spin-slow {
            animation: spin-slow 12s linear infinite;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Home;
