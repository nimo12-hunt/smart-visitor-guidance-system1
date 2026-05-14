import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { sectorsData } from "../data/sectorsData";
import { getFloorLabel, getFloorBadgeClasses } from "../utils/floorLabels";
import { departmentService } from "../services/departmentService";
import {
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiChevronRight,
  FiAward,
  FiBookOpen,
  FiNavigation,
  FiCheckCircle,
  FiTrendingUp,
  FiMessageCircle,
} from "react-icons/fi";

// Splash images for departments
const splashImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=250&fit=crop",
];

const DepartmentDetail = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [sector, setSector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDepartment = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const dept = await departmentService.getById(id);
        const normalizedDept = dept
          ? {
              ...dept,
              name: dept.name?.en || "Unnamed Department",
              description: dept.description?.en || "",
              services: Array.isArray(dept.services?.en) ? dept.services.en : [],
              directions: dept.directions?.en || "",
              phone: dept.contact || "",
              image: dept.departmentImage || dept.image || null,
            }
          : null;

        setDepartment(normalizedDept);

        if (normalizedDept) {
          const sectorData = sectorsData.find((s) => s.id === normalizedDept.sectorId);
          setSector(sectorData || null);
        } else {
          setSector(null);
        }
      } catch (error) {
        console.error("Failed to load department detail:", error);
        setDepartment(null);
        setSector(null);
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [id]);

  const getInitials = (name) => {
    if (!name || name === "TBD") return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-500 text-sm">
              Loading department details...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!department) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              Department Not Found
            </h2>
            <Link to="/" className="text-emerald-600 mt-3 inline-block text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const splashImage =
    department.image || splashImages[(department.id - 1) % splashImages.length];

  const getDirections = () => {
    if (department.directions) {
      return department.directions
        .split(".")
        .map((step) => step.trim())
        .filter(Boolean);
    }

    return [
      `Take elevator to ${getFloorLabel(department.floor)}`,
      department.floor % 2 === 0
        ? "Exit elevator and turn RIGHT"
        : "Exit elevator and turn LEFT",
      `Walk to Room ${department.room}`,
      `Look for "${department.name}" sign on the door`,
    ];
  };

  const directions = getDirections();
  const walkInServices = department.services?.slice(0, 3) || [];
  const appointmentServices = department.services?.slice(3) || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-12">
        {/* Hero — taller, lighter overlay so photography stays visible */}
        <div className="relative min-h-[15rem] sm:min-h-[17rem] md:min-h-[20rem] w-full overflow-hidden">
          <img
            src={splashImage}
            alt={department.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-slate-900/10" />

          <Link
            to={`/sector/${sector?.id}`}
            className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm font-semibold border border-white/30 hover:bg-white/35 transition-colors shadow-lg"
          >
            <FiArrowLeft size={14} /> Back to Sector
          </Link>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8 pointer-events-none">
            <p className="text-white/90 text-xs font-bold uppercase tracking-[0.2em] mb-1 drop-shadow">
              {sector?.name}
            </p>
            <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight drop-shadow-md max-w-3xl">
              {department.name}
            </h2>
          </div>
        </div>

        {/* Department Header — glass summary bar */}
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur-md shadow-xl shadow-slate-900/10 p-5 md:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 hidden sm:block">
                  Location & access
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold">
                    <FiMapPin size={13} className="text-emerald-600" /> Building{" "}
                    {department.building}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 rounded-full border text-xs ${getFloorBadgeClasses(department.floor, department.id)}`}
                  >
                    <FiTrendingUp size={13} aria-hidden />
                    {getFloorLabel(department.floor)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold">
                    <FiMapPin size={13} className="text-emerald-600" /> Room{" "}
                    {department.room}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/90 px-4 py-2.5 backdrop-blur-sm shadow-sm shrink-0">
                <FiStar className="fill-amber-400 text-amber-500" size={18} />
                <span className="font-bold text-slate-900 text-xl tabular-nums">
                  {department.rating}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {department.reviewCount || 0} reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-emerald-500 pl-3 -ml-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FiBookOpen className="text-emerald-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">About</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {department.description}
                </p>
              </div>

              {/* Directions */}
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-emerald-500 pl-3 -ml-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FiNavigation className="text-emerald-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    How to Find Us
                  </h2>
                </div>
                <div className="bg-slate-500/5 rounded-xl border border-slate-200/60 p-5 backdrop-blur-sm">
                  <div className="space-y-3">
                    {directions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-slate-700 text-sm leading-relaxed">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                    <FiClock className="text-emerald-600" size={14} />
                    <span className="text-sm text-gray-600">
                      Estimated walking time:{" "}
                      {department.walkingTime || "3-5 minutes"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-emerald-500 pl-3 -ml-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FiAward className="text-emerald-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Services Offered
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walkInServices.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                        <FiCheckCircle size={12} /> WALK-IN (No appointment)
                      </div>
                      <ul className="space-y-1.5">
                        {walkInServices.map((service, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {appointmentServices.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                        <FiCheckCircle size={12} /> BY APPOINTMENT
                      </div>
                      <ul className="space-y-1.5">
                        {appointmentServices.map((service, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Head of Department */}
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-emerald-500 pl-3 -ml-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FiUser className="text-emerald-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Head of Department
                  </h2>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 rounded-xl border border-emerald-100/50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {getInitials(department.head)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      {department.head}
                    </div>
                    <div className="text-sm text-gray-500">
                      {department.headTitle || "Department Head"}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  {department.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 bg-white/60 backdrop-blur-sm">
                      <FiPhone className="text-emerald-600" size={16} />
                      <div>
                        <div className="text-xs text-gray-400">Phone</div>
                        <div className="font-medium text-gray-800 text-sm">
                          {department.phone}
                        </div>
                      </div>
                    </div>
                  )}
                  {department.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 bg-white/60 backdrop-blur-sm">
                      <FiMail className="text-emerald-600" size={16} />
                      <div>
                        <div className="text-xs text-gray-400">Email</div>
                        <div className="font-medium text-gray-800 text-sm">
                          {department.email}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 bg-white/60 backdrop-blur-sm">
                    <FiMapPin className="text-emerald-600" size={16} />
                    <div>
                      <div className="text-xs text-gray-400">Location</div>
                      <div className="font-medium text-gray-800 text-sm">
                        Building {department.building},{" "}
                        {getFloorLabel(department.floor)}, Room{" "}
                        {department.room}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Bring */}
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-amber-400 pl-3 -ml-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <FiBookOpen className="text-amber-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    What to Bring
                  </h2>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Valid government ID
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Appointment confirmation (if applicable)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Relevant documents for your inquiry
                  </li>
                </ul>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-600/95 to-teal-700/95 backdrop-blur-md p-6 text-white shadow-lg shadow-emerald-900/20">
                <h3 className="text-sm font-semibold opacity-90 mb-3">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {department.reviewCount || 0}
                    </div>
                    <div className="text-xs opacity-80">Total Reviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {department.rating}
                    </div>
                    <div className="text-xs opacity-80">Average Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {department.walkingTime || "3 min"}
                    </div>
                    <div className="text-xs opacity-80">Walking Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold leading-tight">
                      {getFloorLabel(department.floor)}
                    </div>
                    <div className="text-xs opacity-80">Location</div>
                  </div>
                </div>
              </div>

              {/* Leave Feedback — premium card CTA */}
              <Link
                to={`/feedback/${department.id}`}
                className="group block w-full rounded-2xl border-2 border-emerald-400/50 bg-white/90 backdrop-blur-md p-5 shadow-lg shadow-emerald-900/10 hover:border-emerald-500/70 hover:shadow-xl hover:shadow-emerald-600/15 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white shadow-md shrink-0">
                    <FiMessageCircle size={22} strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-bold text-slate-900 text-base">
                      Leave feedback
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Rate your visit and help us improve services at this
                      department.
                    </p>
                  </div>
                  <FiChevronRight
                    className="text-emerald-600 shrink-0 group-hover:translate-x-1 transition-transform"
                    size={22}
                    strokeWidth={2.5}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentDetail;
