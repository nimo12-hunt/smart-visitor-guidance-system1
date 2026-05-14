import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getFloorLabel, getFloorBadgeClasses } from "../utils/floorLabels";
import { departmentService } from "../services/departmentService";
import { sectorService } from "../services/sectorService";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiMapPin,
  FiChevronRight,
  FiLayers,
  FiClock,
  FiTarget,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";

/** Left accent color per sector (switch on sector id). */
const getSectorAccentColor = (sectorId) => {
  switch (sectorId) {
    case 1:
      return "#1E3A5F";
    case 2:
      return "#078930";
    case 3:
      return "#F59E0B";
    case 4:
      return "#8B5CF6";
    case 5:
      return "#EC4899";
    case 6:
      return "#14B8A6";
    case 7:
      return "#3B82F6";
    case 8:
      return "#6B7280";
    default:
      return "#64748B";
  }
};

// Splash images for departments (fallback)
const fallbackImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=160&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=160&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=160&fit=crop",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=160&fit=crop",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=160&fit=crop",
];

const Sector = () => {
  const { id } = useParams();
  const [sector, setSector] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSectorData = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const sectorId = parseInt(id, 10);

        // Fetch sector from API
        const sectorData = await sectorService.getPublicSectorById(sectorId);
        setSector(sectorData);

        // Fetch departments for this sector
        const allDepartments = await departmentService.getAll();
        const sectorDepartments = (allDepartments || [])
          .filter((d) => d.sectorId === sectorId)
          .map((d) => ({
            id: d.id,
            name: d.name?.en || "Unnamed Department",
            description: d.description?.en || "",
            building: d.building || "A",
            floor: d.floor ?? 0,
            room: d.room || "",
            head: d.head || "",
            services: Array.isArray(d.services?.en) ? d.services.en : [],
            walkingTime: d.walkingTime || "",
            rating: d.rating || 0,
            image:
              d.departmentImage ||
              d.image ||
              fallbackImages[(d.id || 0) % fallbackImages.length],
          }));

        setDepartments(sectorDepartments);
      } catch (error) {
        console.error("Failed to load sector data:", error);
        setSector(null);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    loadSectorData();
  }, [id]);

  const departmentsByBuilding = useMemo(() => {
    const map = {};
    for (const d of departments) {
      const b = d.building || "A";
      if (!map[b]) map[b] = [];
      map[b].push(d);
    }
    return map;
  }, [departments]);

  const buildingKeys = useMemo(
    () => Object.keys(departmentsByBuilding).sort(),
    [departmentsByBuilding],
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!sector) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold">Sector Not Found</h2>
            <Link to="/" className="text-emerald-600 mt-3 inline-block">
              ← Back Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-12">
        {/* --- HERO HEADER --- */}
        <div className="bg-[#0F172A] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="w-1/3 bg-[#078930]" />
            <div className="w-1/3 bg-[#FCDD09]" />
            <div className="w-1/3 bg-[#DA121A]" />
          </div>

          <div className="container mx-auto px-4 py-10 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl bg-white/10 p-2 rounded-xl">
                    {sector.icon || "🏛️"}
                  </span>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                    {sector.name}
                  </h1>
                </div>
                <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                  {sector.description}
                </p>
              </div>

              <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">
                    {(sector.avgRating || 4.5).toFixed(1)}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">
                    Rating
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">
                    {departments.length}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">
                    Departments
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="container mx-auto px-4 -mt-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md px-5 py-4 shadow-lg shadow-slate-900/5">
            <div>
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FiTarget className="text-emerald-600" aria-hidden />
                {sector.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Departments in this sector — grouped by building.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              {departments.length}{" "}
              {departments.length === 1 ? "Department" : "Departments"}
            </span>
          </div>

          {buildingKeys.map((building) => (
            <section key={building} className="mb-12 last:mb-4">
              {buildingKeys.length > 1 && (
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-emerald-500" aria-hidden />
                  Building {building}
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {departmentsByBuilding[building].map((dept, idx) => {
                  const accent = getSectorAccentColor(sector.id);
                  const floorLabel = getFloorLabel(dept.floor);
                  const floorBadge = getFloorBadgeClasses(dept.floor, dept.id);
                  const isRestricted = !dept.head || dept.head === "TBD";

                  return (
                    <motion.article
                      key={dept.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="group relative rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4"
                      style={{ borderLeftColor: accent }}
                    >
                      <span
                        className={`absolute top-3 right-3 z-20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border ${
                          isRestricted
                            ? "bg-amber-500/25 text-amber-950 border-amber-400/40"
                            : "bg-emerald-500/25 text-emerald-950 border-emerald-400/40"
                        }`}
                      >
                        {isRestricted ? "Restricted" : "Active"}
                      </span>

                      <div className="h-36 w-full overflow-hidden relative">
                        <img
                          src={dept.image}
                          alt={dept.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = fallbackImages[0];
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
                      </div>

                      <div className="p-5 pt-4 relative">
                        <h3 className="text-xl font-bold text-slate-900 leading-snug mb-2 pr-16">
                          {dept.name}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                          {dept.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${floorBadge}`}
                          >
                            <FiLayers size={13} aria-hidden />
                            {floorLabel}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-500/10 px-2.5 py-1 rounded-lg border border-slate-200/80">
                            <FiClock size={13} className="text-slate-500" />
                            {dept.walkingTime || "3–5 min walk"}
                          </span>
                        </div>

                        {dept.head && dept.head !== "TBD" && (
                          <div className="flex items-start gap-2 mb-3 text-sm text-slate-700">
                            <FiUser
                              className="text-slate-400 mt-0.5 shrink-0"
                              size={16}
                            />
                            <div>
                              <span className="font-semibold text-slate-800">
                                {dept.head}
                              </span>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                Department head
                              </span>
                            </div>
                          </div>
                        )}

                        {dept.services && dept.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {dept.services.slice(0, 2).map((service, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md"
                              >
                                {service}
                              </span>
                            ))}
                            {dept.services.length > 2 && (
                              <span className="text-[11px] font-bold text-emerald-700">
                                +{dept.services.length - 2} more
                              </span>
                            )}
                          </div>
                        )}

                        <Link
                          to={`/department/${dept.id}`}
                          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
                        >
                          View Details
                          <FiChevronRight size={16} aria-hidden />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          ))}

          {/* --- Wayfinding strip + help (compact) --- */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl px-5 py-4 border border-white/70 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FiMapPin className="text-emerald-600" aria-hidden />
                  Quick Floor Directory
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                  Reference levels in this ministry complex
                </p>
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {["G", 1, 2, 3, 4, 5].map((lvl) => {
                  const label =
                    lvl === "G" ? getFloorLabel(0) : getFloorLabel(lvl);
                  return (
                    <div
                      key={String(lvl)}
                      className="px-3 py-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-900 text-xs font-bold tabular-nums"
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl px-5 py-4 border border-emerald-200/50 bg-gradient-to-br from-emerald-600/95 to-teal-700/95 backdrop-blur-md text-white shadow-lg shadow-emerald-900/15 flex flex-col justify-center gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white/15 p-2 shrink-0">
                  <FiBriefcase className="text-white" size={20} aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    Need guidance?
                  </h3>
                  <p className="text-white/85 text-xs mt-1 leading-relaxed">
                    Visit the information desk — Main Lobby, Building{" "}
                    {sector.building}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto sm:self-start bg-white text-emerald-800 py-2.5 px-4 rounded-full text-xs font-bold shadow-md hover:bg-emerald-50 transition-colors"
              >
                Contact support
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sector;
