import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiAward,
  FiInbox,
  FiFileText,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSettings,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
const AnalyticsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  );
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const savedImage = localStorage.getItem("adminProfileImage");
    if (savedImage) setProfileImage(savedImage);
  }, []);
  // Polling / fetching for real notifications
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPendingNotifications();
    // Set up a simple interval to check for new feedback every 60 seconds
    const intervalId = setInterval(fetchPendingNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchPendingNotifications = async () => {
    try {
      // Fetch only 1 item just to get the 'total' pagination count of pending status
      const response = await analyticsService.getInbox({
        status: "pending",
        limit: 1,
      });

      if (
        response &&
        response.pagination &&
        typeof response.pagination.total === "number"
      ) {
        setPendingCount(response.pagination.total);
      } else if (response && Array.isArray(response.data)) {
        // Fallback if pagination is missing but data array exists
        const manualCount = response.data.filter((f) => !f?.response).length;
        setPendingCount(manualCount || 0);
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      // Silently catch so we don't spam red errors on the screen if the server reconnects
      console.error("Polling issue: Could not fetch pending count", error);
      setPendingCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const menuItems = [
    {
      path: "/feedback-analytics",
      icon: FiHome,
      label: "Executive Summary",
    },
    {
      path: "/feedback-analytics/rankings",
      icon: FiAward,
      label: "Department Rankings",
    },
    {
      path: "/feedback-analytics/inbox",
      icon: FiInbox,
      label: "Case Management",
      badge: pendingCount, // REAL Data!
    },
    {
      path: "/feedback-analytics/reports",
      icon: FiFileText,
      label: "Data & Export",
    },
    {
      path: "/feedback-analytics/insights",
      icon: FiBarChart2,
      label: "Deep Insights",
    },
    {
      path: "/feedback-analytics/settings",
      icon: FiSettings,
      label: "System Config",
    },
  ];
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-gray-900 font-sans selection:bg-emerald-200">
      {/* Sidebar - Sharp, Official Government Look */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 transform bg-slate-900
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-300 ease-in-out
          z-30 w-72 flex flex-col shadow-2xl md:shadow-none border-r border-slate-800
        `}
      >
        {/* Flag Header */}
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-[#078930]"></div>
          <div className="flex-1 bg-[#FCDD09]"></div>
          <div className="flex-1 bg-[#DA121A]"></div>
        </div>
        {/* Agency Title */}
        <div className="px-6 py-8 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <img
              src="/ministry-logo.png"
              alt="Ministry of Innovation and Technology logo"
              className="h-12 w-auto object-contain rounded-md bg-white/5 p-1"
            />
            <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase">
                M.IN.T
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                Analytics Bureau
              </p>
            </div>
          </div>
        </div>
        {/* Logged in User Profile Strip */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 border-2 border-emerald-500 overflow-hidden rounded-full">
            <img
              src={profileImage}
              alt="Duty Officer Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              Duty Officer
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              ID: FA-9042
            </p>
          </div>
        </div>
        {/* Dynamic Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">
            System Modules
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/feedback-analytics" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase tracking-wider transition-all
                  ${
                    isActive
                      ? "bg-emerald-700 text-white border-l-4 border-emerald-400"
                      : "text-slate-300 hover:bg-white/5 hover:text-emerald-400 border-l-4 border-transparent"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-emerald-300" : "text-slate-500"}
                />
                <div className="flex-1">{item.label}</div>

                {/* Dynamically inserted badge based on State */}
                {item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-black ${isActive ? "bg-red-500 text-white" : "bg-red-500/20 text-red-400"}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Official Footer / Log out */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded bg-red-900/40 text-red-400 hover:bg-red-800 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
          >
            <span>Terminate Session</span>
            <FiLogOut />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 shadow-sm flex-shrink-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-900 hover:text-emerald-700"
          >
            <FiMenu size={24} />
          </button>

          {/* Module Tite (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-4 w-4 bg-emerald-700 rounded-sm"></div>
            <span className="font-bold text-gray-900 uppercase tracking-widest text-sm">
              Central Feedback Engine
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest border border-emerald-300">
              Active
            </span>
          </div>

          {/* Right Side Tools */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Real Notification Bell */}
            <button
              onClick={() => navigate("/feedback-analytics/inbox")}
              className="relative p-1 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none group"
              title="Inbox Alerts"
            >
              <FiBell
                size={22}
                className="group-hover:fill-emerald-700 group-hover:text-emerald-700 transition"
              />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-white ring-2 ring-red-200 animate-pulse">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>

            {/* Admin Block */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-default">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                  Duty Officer
                </p>
                <p className="text-[10px] text-emerald-700 font-bold uppercase">
                  System Admin
                </p>
              </div>
              <div className="w-9 h-9 bg-gray-100 border border-emerald-600 rounded-full overflow-hidden">
                <img
                  src={profileImage}
                  alt="Duty Officer Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>
        {/* Scrollable Workspace View */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FA] p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
export default AnalyticsLayout;
