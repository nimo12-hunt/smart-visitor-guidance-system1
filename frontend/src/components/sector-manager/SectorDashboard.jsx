/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiMessageSquare,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiSend,
  FiX,
  FiUser,
  FiMail,
  FiAlertCircle,
  FiTrendingUp,
  FiLogOut,
  FiBell,
  FiMenu,
  FiHome,
  FiBarChart2,
  FiSettings,
  FiFileText,
  FiEye,
  FiDownload,
  FiPrinter,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiLock,
  FiRefreshCw,
  FiCalendar,
  FiPlus,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SectorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sector, setSector] = useState(null);

  // Stats State
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgRating: 0,
    responseRate: 0,
    pendingCount: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    weeklyActivity: [],
    monthlyActivity: [],
  });

  // Feedback State
  const [feedbacks, setFeedbacks] = useState([]);

  // Performance Tab State
  const [timeRange, setTimeRange] = useState("30days");
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  // Reports Tab State
  const [reportDateRange, setReportDateRange] = useState({
    preset: "last30",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportType, setReportType] = useState("summary");
  const [includeOptions, setIncludeOptions] = useState({
    ratingChart: true,
    departmentRankings: true,
    feedbackComments: true,
    responseRates: true,
  });
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleEmails, setScheduleEmails] = useState(["sector@mint.gov.et"]);
  const [newEmail, setNewEmail] = useState("");

  const [generating, setGenerating] = useState(false);
  const [recentReports] = useState([
    {
      id: 1,
      name: "Sector Report",
      date: new Date().toLocaleDateString(),
      size: "2.3 MB",
      type: "pdf",
    },
  ]);

  // Pagination & Filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    search: "",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueAlertDismissed, setOverdueAlertDismissed] = useState(false);

  // Settings States
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("adminUser") || "{}");
    if (!userData.role || userData.role !== "sector_manager") {
      navigate("/admin/login");
      return;
    }

    setUser(userData); // Update state for UI
    setProfileForm({
      name: userData.name || userData.username || "",
      email: userData.email || "",
      avatar: userData.avatar || "",
    });

    const sectorNames = {
      1: "Executive Leadership",
      2: "Innovation & Technology",
      3: "Finance & Administration",
      4: "Human Resources",
      5: "Operations",
      6: "Public Relations",
    };

    setSector(sectorNames[userData.sectorId] || "Unknown Sector");

    // PASS the sectorId directly to avoid the race condition
    const sId = userData.sectorId || 1;
    fetchAllData(sId);
  }, []);

  useEffect(() => {
    if (activeTab === "feedback") {
      fetchAllFeedback();
    }
  }, [filters, pagination.page, activeTab]);

  useEffect(() => {
    const sectorId = user?.sectorId;
    if (!sectorId) return;

    const refreshCounts = async () => {
      await Promise.all([fetchPendingCount(sectorId), fetchStats(sectorId)]);
    };

    // Keep counters fresh without requiring bell click.
    const intervalId = setInterval(refreshCounts, 15000);

    const handleWindowFocus = () => {
      refreshCounts();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCounts();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.sectorId]);

  const fetchAllData = async (sId) => {
    await Promise.all([
      fetchStats(sId),
      fetchRecentFeedback(sId),
      fetchPendingCount(sId),
    ]);
  };
  const fetchStats = async (sId) => {
    try {
      const response = await API.get(`/sector/${sId}/stats`);
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentFeedback = async (sId) => {
    try {
      const response = await API.get(`/sector/${sId}/feedback`, {
        params: { limit: 5 },
      });
      setFeedbacks(response.data.feedbacks || response.data.data || []);
      setDepartmentPerformance(response.data.departmentPerformance || []);
    } catch (error) {
      console.error("Error fetching recent feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFeedback = async () => {
    try {
      setLoading(true);
      const sectorId = user.sectorId || 1;
      const params = {
        status: filters.status !== "all" ? filters.status : undefined,
        department:
          filters.department !== "all" ? filters.department : undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      };
      const response = await API.get(`/sector/${sectorId}/feedback`, {
        params,
      });
      setAllFeedbacks(response.data.feedbacks || response.data.data || []);
      setPagination(
        response.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 },
      );
      setDepartmentsList(response.data.filters?.departments || []);
    } catch (error) {
      console.error("Error fetching all feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async (sId) => {
    try {
      // Use the passed ID or fallback to localStorage directly
      const sectorId =
        sId || JSON.parse(localStorage.getItem("adminUser"))?.sectorId || 1;

      // 1. Get the official pending count from backend (support nested response shapes)
      const countResponse = await API.get(`/sector/${sectorId}/pending-count`);
      const count =
        countResponse?.data?.pendingCount ??
        countResponse?.data?.data?.pendingCount ??
        countResponse?.data?.count ??
        0;
      setPendingCount(count);

      // 2. Fetch actual pending feedbacks for notification list
      const feedbackResponse = await API.get(`/sector/${sectorId}/feedback`, {
        params: { status: "pending", limit: 20 },
      });

      const responseData = feedbackResponse?.data;
      const listCandidates = [
        responseData?.feedbacks,
        responseData?.data,
        responseData?.results,
        responseData?.items,
        responseData?.docs,
        responseData?.data?.feedbacks,
        responseData?.data?.items,
        responseData?.data?.docs,
      ];
      let pendingData =
        listCandidates.find((item) => Array.isArray(item)) || [];

      if (pendingData.length > 0) {
        pendingData = pendingData.filter(
          (f) => f && (f.status === "pending" || (!f.response && !f.resolved)),
        );
      }

      if (pendingData.length === 0) {
        const fallbackPool = [...allFeedbacks, ...feedbacks];
        const uniqueFallback = Array.from(
          new Map(fallbackPool.map((f) => [f?._id, f])).values(),
        ).filter(Boolean);

        pendingData = uniqueFallback
          .filter((f) => f.status === "pending" || (!f.response && !f.resolved))
          .slice(0, 20);
      }

      // Update the notification list
      const newNotifications = pendingData.map((f) => ({
        id: f._id,
        title: `New ${f.rating}-star feedback`,
        message: f.comment || "No comment",
        time: new Date(f.createdAt).toLocaleString(),
        createdAt: f.createdAt,
        rating: f.rating || 0,
        departmentName: f.departmentName || "General Department",
        feedback: f,
        read: false,
        dismissed: false,
        feedbackId: f._id,
      }));

      setNotifications(newNotifications);

      console.log(
        `Updated: pendingCount=${count}, notifications=${newNotifications.length}`,
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // ============================================
  // ACTIONS
  // ============================================

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.put(
        `/sector/feedback/${selectedFeedback._id}/respond`,
        {
          response: responseText,
        },
      );
      if (res?.data?.emailSent) {
        toast.success("Response sent! Email notification delivered.");
      } else {
        toast.success(
          "Response saved. Email not sent (email is not configured).",
        );
      }
      setShowResponseModal(false);
      await fetchAllData();
      if (activeTab === "feedback") await fetchAllFeedback();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to send response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (feedbackId) => {
    try {
      await API.put(`/sector/feedback/${feedbackId}/resolve`);
      toast.success("Feedback marked as resolved");
      await fetchAllData();
      if (activeTab === "feedback") await fetchAllFeedback();
    } catch (error) {
      toast.error("Failed to mark as resolved");
    }
  };

  const handleExportPDF = () => {
    const dataToExport = activeTab === "feedback" ? allFeedbacks : feedbacks;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sector ${user.sectorId} Feedback Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #10b981; }
          .header h1 { color: #0B2A4A; margin-bottom: 10px; }
          .stats { display: flex; gap: 20px; margin: 30px 0; flex-wrap: wrap; }
          .stat-card { background: #f3f4f6; padding: 20px; border-radius: 12px; flex: 1; text-align: center; }
          .stat-card h3 { color: #10b981; font-size: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #0B2A4A; color: white; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MINT Navigator - Sector ${user.sectorId} Report</h1>
          <p>${sector || "Sector Dashboard"}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <div class="stats">
          <div class="stat-card"><h3>${stats.totalFeedback || 0}</h3><p>Total Feedback</p></div>
          <div class="stat-card"><h3>${stats.avgRating || 0} ★</h3><p>Average Rating</p></div>
          <div class="stat-card"><h3>${stats.responseRate || 0}%</h3><p>Response Rate</p></div>
        </div>
        <h2>All Feedback</h2>
        <table>
          <thead><tr><th>Date</th><th>Rating</th><th>Visitor</th><th>Department</th><th>Comment</th><th>Status</th></tr></thead>
          <tbody>
            ${dataToExport
              .map(
                (f) => `
              <tr>
                <td>${new Date(f.createdAt).toLocaleDateString()}</td>
                <td>${f.rating} ★</td>
                <td>${f.visitor || "Anonymous"}</td>
                <td>${f.departmentName || "N/A"}</td>
                <td>${f.comment || ""}</td>
                <td>${f.resolved ? "Resolved" : f.response ? "Responded" : "Pending"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer"><p>Ministry of Innovation & Technology - Building a Digital Ethiopia 🇪🇹</p></div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success("PDF report generated");
  };

  const handleExportCSV = async () => {
    try {
      const sectorId = user.sectorId || 1;
      const response = await API.get(`/sector/${sectorId}/export/csv`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sector-${sectorId}-feedback-${Date.now()}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    try {
      await API.put("/sector/profile/update", {
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar,
      });
      const updatedUser = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
      };
      localStorage.setItem("adminUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      await API.put("/sector/profile/change-password", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      setPasswordForm({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const dismissNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, dismissed: true, read: true } : n,
      ),
    );
    setPendingCount((prev) => Math.max(0, prev - 1));
  };

  const markAllNotificationsRead = () => {
    // In this panel, "MARK ALL" should clear the list the same way users expect.
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, dismissed: true })),
    );
    setPendingCount(0);
    setOverdueAlertDismissed(true);
  };
  const activeNotifications = notifications.filter((n) => !n.dismissed);
  const overdueNotifications = activeNotifications.filter((n) => {
    if (!n.createdAt) return false;
    const ageMs = Date.now() - new Date(n.createdAt).getTime();
    return ageMs >= 48 * 60 * 60 * 1000;
  });
  const showOverdueAlert =
    overdueNotifications.length > 0 && !overdueAlertDismissed;
  const bellNotificationCount = Math.max(
    activeNotifications.length + (showOverdueAlert ? 1 : 0),
    pendingCount,
  );

  const formatTimeAgo = (dateValue) => {
    if (!dateValue) return "Just now";
    const now = Date.now();
    const created = new Date(dateValue).getTime();
    const diffMs = Math.max(0, now - created);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "Just now";
    if (diffMs < hour) {
      const mins = Math.floor(diffMs / minute);
      return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    }
    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    const days = Math.floor(diffMs / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const openPendingNotifications = () => {
    setFilters((prev) => ({ ...prev, status: "pending" }));
    setActiveTab("feedback");
    setShowNotifications(false);
  };

  const handleNotificationToggle = async () => {
    if (!showNotifications) {
      const sectorId = user?.sectorId || 1;
      await fetchPendingCount(sectorId);
    }
    setShowNotifications((prev) => !prev);
  };

  const getStatusBadge = (feedback) => {
    if (feedback.resolved) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
          <FiCheckCircle size={10} /> Resolved
        </span>
      );
    }
    if (feedback.response) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
          <FiMail size={10} /> Responded
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
        <FiClock size={10} /> Pending
      </span>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
    {
      id: "feedback",
      label: "All Feedback",
      icon: <FiMessageSquare size={18} />,
    },
    {
      id: "performance",
      label: "Performance",
      icon: <FiBarChart2 size={18} />,
    },
    { id: "reports", label: "Reports", icon: <FiFileText size={18} /> },
    { id: "settings", label: "Settings", icon: <FiSettings size={18} /> },
  ];

  // ============================================
  // RENDER COMPONENTS
  // ============================================

  const renderDashboardTab = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {user.name || "Sector Manager"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening in {sector}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalFeedback || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <FiMessageSquare className="text-emerald-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-amber-500">
                {stats.avgRating || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <FiStar className="text-amber-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Response Rate</p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.responseRate || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <FiTrendingUp className="text-emerald-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.pendingCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FiClock className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Recent Feedback</h2>
            <p className="text-gray-500 text-sm">
              Latest feedback from visitors
            </p>
          </div>
          <button
            onClick={() => setActiveTab("feedback")}
            className="text-emerald-600 text-sm hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {feedbacks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">No feedback yet</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="p-5 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`text-sm ${star <= feedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {feedback.rating}.0
                      </span>
                      {getStatusBadge(feedback)}
                    </div>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {feedback.comment || "No comment provided"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUser size={10} /> {feedback.visitor || "Anonymous"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.departmentName && (
                      <div className="mt-2 text-xs text-emerald-600">
                        📍 {feedback.departmentName}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewFeedback(feedback)}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      title="View"
                    >
                      <FiEye size={14} />
                    </button>
                    {!feedback.response && (
                      <button
                        onClick={() => handleRespond(feedback)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                      >
                        Respond
                      </button>
                    )}
                    {!feedback.resolved && feedback.response && (
                      <button
                        onClick={() => handleResolve(feedback._id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                {feedback.response && (
                  <div className="mt-3 pl-4 border-l-2 border-emerald-500 bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-emerald-700 font-medium">
                      Your Response:
                    </p>
                    <p className="text-sm text-emerald-600">
                      {feedback.response}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Department Performance
          </h2>
          <p className="text-gray-500 text-sm">Breakdown by department</p>
        </div>
        <div className="p-5">
          {departmentPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No department data available
            </p>
          ) : (
            <div className="space-y-4">
              {departmentPerformance.map((dept) => (
                <div key={dept.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {dept.name}
                      </span>
                      <span className="text-sm font-bold text-amber-500">
                        {dept.rating} ★
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {dept.feedbackCount} feedback
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(dept.rating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderFeedbackTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Filter Bar */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">All Feedback</h2>
            <p className="text-gray-500 text-sm">
              Complete list of feedback for your sector
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >
            <FiFilter size={14} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value, page: 1 })
              }
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search by visitor or comment..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="department">Sort by Department</option>
              </select>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
                  })
                }
                className="px-3 py-2 border rounded-lg"
              >
                {filters.sortOrder === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading...</p>
          </div>
        ) : allFeedbacks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No feedback found</p>
          </div>
        ) : (
          allFeedbacks.map((feedback) => (
            <div key={feedback._id} className="p-5 hover:bg-gray-50 transition">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`text-sm ${star <= feedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {feedback.rating}.0
                    </span>
                    {getStatusBadge(feedback)}
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    {feedback.comment || "No comment provided"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiUser size={10} /> {feedback.visitor || "Anonymous"}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {feedback.departmentName && (
                    <div className="mt-2 text-xs text-emerald-600">
                      📍 {feedback.departmentName}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewFeedback(feedback)}
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    title="View"
                  >
                    <FiEye size={14} />
                  </button>
                  {!feedback.response && (
                    <button
                      onClick={() => handleRespond(feedback)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                    >
                      Respond
                    </button>
                  )}
                  {!feedback.resolved && feedback.response && (
                    <button
                      onClick={() => handleResolve(feedback._id)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
              {feedback.response && (
                <div className="mt-3 pl-4 border-l-2 border-emerald-500 bg-emerald-50 p-3 rounded-lg">
                  <p className="text-xs text-emerald-700 font-medium">
                    Your Response:
                  </p>
                  <p className="text-sm text-emerald-600">
                    {feedback.response}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              <FiChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
          <select
            value={pagination.limit}
            onChange={(e) =>
              setPagination({
                ...pagination,
                limit: parseInt(e.target.value),
                page: 1,
              })
            }
            className="px-2 py-1 border rounded-lg text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => {
    // Calculate rating distribution percentages
    const totalFeedbacks = stats.totalFeedback || 1;
    const ratingData = [
      {
        stars: 5,
        count: stats.ratingDistribution?.[5] || 0,
        color: "bg-emerald-500",
        bgLight: "bg-emerald-50",
      },
      {
        stars: 4,
        count: stats.ratingDistribution?.[4] || 0,
        color: "bg-blue-500",
        bgLight: "bg-blue-50",
      },
      {
        stars: 3,
        count: stats.ratingDistribution?.[3] || 0,
        color: "bg-yellow-500",
        bgLight: "bg-yellow-50",
      },
      {
        stars: 2,
        count: stats.ratingDistribution?.[2] || 0,
        color: "bg-orange-500",
        bgLight: "bg-orange-50",
      },
      {
        stars: 1,
        count: stats.ratingDistribution?.[1] || 0,
        color: "bg-red-500",
        bgLight: "bg-red-50",
      },
    ];

    // Mock monthly trend data (will come from API in real app)
    const monthlyTrend = [
      { month: "Jan", avgRating: 4.2, count: 12 },
      { month: "Feb", avgRating: 4.4, count: 15 },
      { month: "Mar", avgRating: 4.3, count: 18 },
      { month: "Apr", avgRating: 4.6, count: 22 },
      { month: "May", avgRating: 4.7, count: 25 },
      { month: "Jun", avgRating: 4.8, count: 28 },
    ];

    const maxCount = Math.max(...monthlyTrend.map((m) => m.count), 1);
    const maxRating = 5;

    return (
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <FiCalendar className="text-emerald-600" size={18} />
            <span className="text-sm font-medium text-gray-700">
              Date Range:
            </span>
            <div className="flex gap-2">
              {["7days", "30days", "quarter"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    timeRange === range
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range === "7days"
                    ? "Last 7 Days"
                    : range === "30days"
                      ? "Last 30 Days"
                      : "This Quarter"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalFeedback || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ +12% from last month
                </p>
              </div>
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Rating</p>
                <p className="text-3xl font-bold text-amber-500">
                  {stats.avgRating || 0} ★
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ +0.3 from last month
                </p>
              </div>
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                <FiStar className="text-amber-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Response Rate</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.responseRate || 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ +5% from last month
                </p>
              </div>
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Departments</p>
                <p className="text-3xl font-bold text-gray-800">
                  {departmentPerformance.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  → Same as last month
                </p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiBarChart2 className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution & Monthly Trend - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-800">
                Rating Distribution
              </h2>
            </div>
            <div className="space-y-4">
              {ratingData.map((item) => {
                const percentage = (
                  (item.count / totalFeedbacks) *
                  100
                ).toFixed(0);
                return (
                  <div key={item.stars}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">
                          {item.stars} ★
                        </span>
                        <span className="text-xs text-gray-400">
                          ({item.count})
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-800">Monthly Trend</h2>
            </div>
            <div className="relative h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400">
                <span>5.0</span>
                <span>4.0</span>
                <span>3.0</span>
                <span>2.0</span>
                <span>1.0</span>
              </div>
              {/* Chart area */}
              <div className="ml-12 h-full relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="border-t border-gray-100 w-full"
                    ></div>
                  ))}
                </div>
                {/* Bars and Line */}
                <div className="absolute inset-0 flex items-end justify-between pb-6">
                  {monthlyTrend.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center w-full"
                    >
                      {/* Bar */}
                      <div
                        className="w-8 bg-emerald-500 rounded-t-lg transition-all duration-500 hover:bg-emerald-600"
                        style={{ height: `${(item.count / maxCount) * 120}px` }}
                      />
                      {/* Line point (hidden - for visual only) */}
                      <div className="relative">
                        <div
                          className="absolute bottom-full mb-2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 left-1/2"
                          style={{
                            bottom: `${(item.avgRating / maxRating) * 140}px`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pt-2">
                  {monthlyTrend.map((item, idx) => (
                    <span key={idx} className="w-full text-center">
                      {item.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-xs text-gray-500">Feedback Count</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Average Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">
                  Department Performance
                </h2>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Breakdown by department in your sector
              </p>
            </div>
            <button className="text-emerald-600 text-sm hover:underline">
              View All →
            </button>
          </div>
          <div className="p-5">
            {departmentPerformance.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-gray-500">No department data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {departmentPerformance.map((dept) => {
                  const ratingPercent = (dept.rating / 5) * 100;
                  const ratingColor =
                    dept.rating >= 4.5
                      ? "bg-emerald-500"
                      : dept.rating >= 4
                        ? "bg-blue-500"
                        : dept.rating >= 3
                          ? "bg-yellow-500"
                          : "bg-red-500";

                  return (
                    <div key={dept.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">
                            {dept.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <FiStar
                              className="text-amber-500 fill-amber-500"
                              size={14}
                            />
                            <span className="text-sm font-bold text-amber-600">
                              {dept.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FiMessageSquare size={12} />
                            <span>{dept.feedbackCount} feedback</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FiMail size={12} />
                            <span>{dept.responseRate || 0}% response</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${ratingColor} h-2 rounded-full transition-all duration-500 group-hover:opacity-80`}
                          style={{ width: `${ratingPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    const datePresets = [
      { id: "thisWeek", label: "This Week", getDays: () => null },
      { id: "thisMonth", label: "This Month", getDays: () => null },
      { id: "thisYear", label: "This Year", getDays: () => null },
      { id: "last7", label: "Last 7 Days", getDays: () => 7 },
      { id: "last30", label: "Last 30 Days", getDays: () => 30 },
      { id: "last90", label: "Last 90 Days", getDays: () => 90 },
      { id: "thisQuarter", label: "This Quarter", getDays: () => null },
      { id: "lastYear", label: "Last Year", getDays: () => 365 },
    ];

    const handlePresetChange = (presetId) => {
      const preset = datePresets.find((p) => p.id === presetId);
      if (preset && preset.getDays()) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - preset.getDays());
        setReportDateRange({
          preset: presetId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        });
      } else if (presetId === "thisQuarter") {
        const now = new Date();
        const quarterStart = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1,
        );
        setReportDateRange({
          preset: presetId,
          startDate: quarterStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        });
      } else if (presetId === "thisWeek") {
        const now = new Date();
        const day = now.getDay();
        const mondayOffset = day === 0 ? 6 : day - 1;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - mondayOffset);
        setReportDateRange({
          preset: presetId,
          startDate: weekStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        });
      } else if (presetId === "thisMonth") {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setReportDateRange({
          preset: presetId,
          startDate: monthStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        });
      } else if (presetId === "thisYear") {
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        setReportDateRange({
          preset: presetId,
          startDate: yearStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        });
      }
    };

    const filteredFeedbacks = allFeedbacks.filter((f) => {
      const fDate = new Date(f.createdAt).toISOString().split("T")[0];
      return (
        fDate >= reportDateRange.startDate && fDate <= reportDateRange.endDate
      );
    });

    const totalInRange = filteredFeedbacks.length;
    const pendingInRange = filteredFeedbacks.filter(
      (f) => !f.resolved && !f.response,
    ).length;
    const respondedInRange = filteredFeedbacks.filter(
      (f) => f.response && !f.resolved,
    ).length;
    const resolvedInRange = filteredFeedbacks.filter((f) => f.resolved).length;
    const avgRatingInRange =
      totalInRange > 0
        ? (
            filteredFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
            totalInRange
          ).toFixed(1)
        : "0.0";
    const responseRateInRange =
      totalInRange > 0
        ? Math.round(
            ((respondedInRange + resolvedInRange) / totalInRange) * 100,
          )
        : 0;

    const groupedDepartments = filteredFeedbacks.reduce((acc, f) => {
      const key = f.departmentName || "Unknown";
      if (!acc[key]) {
        acc[key] = { total: 0, ratingSum: 0, pending: 0, responded: 0 };
      }
      acc[key].total += 1;
      acc[key].ratingSum += f.rating || 0;
      if (!f.response && !f.resolved) acc[key].pending += 1;
      if (f.response && !f.resolved) acc[key].responded += 1;
      return acc;
    }, {});

    const departmentInsights = Object.entries(groupedDepartments)
      .map(([name, values]) => ({
        name,
        feedbackCount: values.total,
        avgRating: values.total
          ? (values.ratingSum / values.total).toFixed(1)
          : "0.0",
        pending: values.pending,
        responded: values.responded,
        responseRate: values.total
          ? Math.round(
              ((values.responded +
                (values.total - values.pending - values.responded)) /
                values.total) *
                100,
            )
          : 0,
      }))
      .sort((a, b) => b.feedbackCount - a.feedbackCount);

    const topDepartments = departmentInsights.slice(0, 6);

    const addEmail = () => {
      if (newEmail && !scheduleEmails.includes(newEmail)) {
        setScheduleEmails([...scheduleEmails, newEmail]);
        setNewEmail("");
      }
    };

    const removeEmail = (email) => {
      setScheduleEmails(scheduleEmails.filter((e) => e !== email));
    };

    const handleExportPDF = async () => {
      setGenerating(true);
      toast.loading("Generating PDF report...", { id: "pdf" });

      try {
        // Generate department rankings
        const deptRankings = [...departmentPerformance]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sector ${user.sectorId} Report</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1f2937; }
            .flag { display: flex; height: 4px; margin-bottom: 30px; }
            .flag-green { flex: 1; background: #078930; }
            .flag-yellow { flex: 1; background: #FCDD09; }
            .flag-red { flex: 1; background: #DA121A; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #0B2A4A; font-size: 28px; }
            .header .sector { color: #10b981; font-size: 14px; margin-top: 5px; }
            .date-range { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; }
            .stat-value { font-size: 28px; font-weight: bold; color: #10b981; }
            .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
            .section-title { font-size: 18px; font-weight: bold; color: #0B2A4A; margin: 30px 0 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .rating-bar { display: flex; align-items: center; margin: 10px 0; gap: 10px; }
            .rating-label { width: 60px; font-weight: 600; }
            .bar { flex: 1; height: 24px; background: #e5e7eb; border-radius: 12px; overflow: hidden; }
            .bar-fill { height: 100%; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background: #f3f4f6; font-weight: 600; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="flag"><div class="flag-green"></div><div class="flag-yellow"></div><div class="flag-red"></div></div>
          <div class="header">
            <h1>MINT Navigator - Performance Report</h1>
            <div class="sector">${sector || `Sector ${user.sectorId}`}</div>
          </div>
          <div class="date-range">Period: ${reportDateRange.startDate} to ${reportDateRange.endDate} | Generated: ${new Date().toLocaleString()}</div>
          
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-value">${totalInRange}</div><div class="stat-label">Total Feedback</div></div>
            <div class="stat-card"><div class="stat-value">${avgRatingInRange} ★</div><div class="stat-label">Avg Rating</div></div>
            <div class="stat-card"><div class="stat-value">${stats.responseRate || 0}%</div><div class="stat-label">Response Rate</div></div>
            <div class="stat-card"><div class="stat-value">${departmentPerformance.length}</div><div class="stat-label">Departments</div></div>
          </div>
          
          ${
            includeOptions.ratingChart
              ? `
          <div class="section-title">⭐ Rating Distribution</div>
          ${[5, 4, 3, 2, 1]
            .map((rating) => {
              const count = stats.ratingDistribution?.[rating] || 0;
              const percentage =
                stats.totalFeedback > 0
                  ? (count / stats.totalFeedback) * 100
                  : 0;
              return `<div class="rating-bar"><div class="rating-label">${rating} ★</div><div class="bar"><div class="bar-fill" style="width: ${percentage}%">${count}</div></div></div>`;
            })
            .join("")}
          `
              : ""
          }
          
          ${
            includeOptions.departmentRankings
              ? `
          <div class="section-title">🏆 Department Rankings</div>
          <table>
            <thead><tr><th>Rank</th><th>Department</th><th>Rating</th><th>Feedback</th><th>Response Rate</th></tr></thead>
            <tbody>
              ${deptRankings
                .map(
                  (dept, idx) => `
                <tr><td>${idx + 1}</td><td>${dept.name}</td><td>${dept.rating} ★</td><td>${dept.feedbackCount}</td><td>${dept.responseRate || 0}%</td></tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          `
              : ""
          }
          
          ${
            includeOptions.feedbackComments
              ? `
          <div class="section-title">💬 Recent Feedback</div>
          <table>
            <thead><tr><th>Date</th><th>Rating</th><th>Visitor</th><th>Department</th><th>Comment</th><th>Status</th></tr></thead>
            <tbody>
              ${filteredFeedbacks
                .slice(0, 20)
                .map(
                  (f) => `
                <tr>
                  <td>${new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>${f.rating} ★</td>
                  <td>${f.visitor || "Anonymous"}</td>
                  <td>${f.departmentName || "N/A"}</td>
                  <td>${f.comment?.substring(0, 100) || ""}</td>
                  <td>${f.resolved ? "Resolved" : f.response ? "Responded" : "Pending"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          `
              : ""
          }
          
          <div class="footer">
            <p>Ministry of Innovation & Technology - Building a Digital Ethiopia 🇪🇹</p>
            <p>This is an official report generated by MINT Navigator System</p>
          </div>
        </body>
        </html>
      `);
        printWindow.document.close();
        printWindow.print();
        toast.success("PDF report generated", { id: "pdf" });
      } catch (error) {
        console.error("PDF Error:", error);
        toast.error("Failed to generate PDF", { id: "pdf" });
      } finally {
        setGenerating(false);
      }
    };

    const handleExportCSV = async () => {
      try {
        const headers = [
          "Date",
          "Rating",
          "Department",
          "Visitor",
          "Email",
          "Comment",
          "Response",
          "Status",
        ];
        const rows = filteredFeedbacks.map((f) => [
          new Date(f.createdAt).toLocaleString(),
          f.rating || 0,
          f.departmentName || "Unknown",
          f.visitor || "Anonymous",
          f.visitorEmail || "",
          `"${(f.comment || "").replace(/"/g, '""')}"`,
          `"${(f.response || "").replace(/"/g, '""')}"`,
          f.resolved ? "Resolved" : f.response ? "Responded" : "Pending",
        ]);
        const csvContent = [headers, ...rows]
          .map((r) => r.join(","))
          .join("\n");
        const url = window.URL.createObjectURL(
          new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `sector-${user.sectorId}-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("CSV exported successfully");
      } catch {
        toast.error("Failed to export CSV");
      }
    };

    const handleSaveSchedule = () => {
      toast.success(
        `Report schedule saved! Will be sent ${scheduleEnabled ? "weekly" : "manually"} to ${scheduleEmails.length} recipients.`,
      );
    };

    return (
      <div className="space-y-6">
        {/* Date Range Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiCalendar className="text-emerald-600" /> 1. Select Date Range
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  reportDateRange.preset === preset.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={reportDateRange.startDate}
              onChange={(e) =>
                setReportDateRange({
                  ...reportDateRange,
                  startDate: e.target.value,
                  preset: "custom",
                })
              }
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={reportDateRange.endDate}
              onChange={(e) =>
                setReportDateRange({
                  ...reportDateRange,
                  endDate: e.target.value,
                  preset: "custom",
                })
              }
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-emerald-600" /> Report Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-gray-500">Total Feedback</p>
              <p className="text-2xl font-bold text-emerald-700">
                {totalInRange}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-xs text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-amber-600">
                {avgRatingInRange}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-gray-500">Response Rate</p>
              <p className="text-2xl font-bold text-blue-700">
                {responseRateInRange}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingInRange}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-xs text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-purple-700">
                {resolvedInRange}
              </p>
            </div>
          </div>
        </div>

        {/* Report Type Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiFileText className="text-emerald-600" /> 2. Report Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => setReportType("summary")}
              className={`p-4 rounded-xl border-2 transition ${
                reportType === "summary"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-bold text-lg">📊 Summary</div>
              <div className="text-xs text-gray-500">Statistics only</div>
            </button>
            <button
              onClick={() => setReportType("detailed")}
              className={`p-4 rounded-xl border-2 transition ${
                reportType === "detailed"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-bold text-lg">📋 Detailed</div>
              <div className="text-xs text-gray-500">With all comments</div>
            </button>
            <button
              onClick={() => setReportType("department")}
              className={`p-4 rounded-xl border-2 transition ${
                reportType === "department"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-bold text-lg">🏛️ By Department</div>
              <div className="text-xs text-gray-500">
                Per department breakdown
              </div>
            </button>
          </div>
        </div>

        {/* Include Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600" /> 3. Include in Report
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(includeOptions).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setIncludeOptions({
                      ...includeOptions,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiDownload className="text-emerald-600" /> 4. Export
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportPDF}
              disabled={generating}
              className="flex items-center justify-center gap-3 p-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
            >
              <FiFileText size={20} />
              <span>
                {generating ? "Generating..." : "Generate PDF Report"}
              </span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              <FiDownload size={20} />
              <span>Export CSV File</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-600" /> 5. Department Insights
          </h2>
          {topDepartments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No report data in selected range.
            </p>
          ) : (
            <div className="space-y-3">
              {topDepartments.map((dept) => (
                <div
                  key={dept.name}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">{dept.name}</p>
                    <p className="text-xs text-gray-500">
                      {dept.feedbackCount} feedback
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-white rounded p-2 border border-gray-100">
                      <p className="text-gray-500">Avg Rating</p>
                      <p className="font-semibold text-amber-600">
                        {dept.avgRating}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-100">
                      <p className="text-gray-500">Pending</p>
                      <p className="font-semibold text-orange-600">
                        {dept.pending}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-100">
                      <p className="text-gray-500">Responded</p>
                      <p className="font-semibold text-blue-600">
                        {dept.responded}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-100">
                      <p className="text-gray-500">Response %</p>
                      <p className="font-semibold text-emerald-600">
                        {dept.responseRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiClock className="text-emerald-600" /> 6. Schedule Report
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm">Enable weekly report</span>
            </label>
          </div>

          {scheduleEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Recipients
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {scheduleEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add email address"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={addEmail}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Schedule
              </button>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiClock className="text-emerald-600" /> Recent Reports
          </h2>
          <div className="space-y-2">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {report.type === "pdf" ? (
                    <FiFileText className="text-red-500" />
                  ) : (
                    <FiDownload className="text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-gray-400">
                      {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="text-emerald-600 text-sm hover:underline"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiUser className="text-emerald-600" /> Profile Information
        </h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profileForm.name?.charAt(0) || user.username?.charAt(0) || "SM"}
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {user.name || user.username}
            </p>
            <p className="text-sm text-gray-500">
              Sector Manager • Sector {user.sectorId}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <button
          onClick={handleUpdateProfile}
          disabled={updatingProfile}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          {updatingProfile ? (
            "Saving..."
          ) : (
            <>
              <FiSave /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiLock className="text-emerald-600" /> Change Password
        </h2>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={passwordForm.current}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, current: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordForm.new}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, new: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordForm.confirm}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirm: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleChangePassword}
            disabled={updatingPassword}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            {updatingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading && activeTab === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-center" />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#0B2A4A] to-[#1A3A5C] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src="/ministry-logo.png"
                alt="Ministry of Innovation and Technology logo"
                className="h-10 w-auto object-contain rounded-md bg-white/10 p-1"
              />
              <div>
                <h2 className="font-bold text-lg">MINT Navigator</h2>
                <p className="text-xs text-white/60">Sector Manager</p>
              </div>
            </div>
          </div>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {user.name?.charAt(0) || user.username?.charAt(0) || "SM"}
              </div>
              <div>
                <p className="font-semibold">{user.name || user.username}</p>
                <p className="text-xs text-white/60">{sector}</p>
                <p className="text-xs text-emerald-400 mt-1">
                  Sector {user.sectorId}
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
            >
              <FiLogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <FiMenu size={20} />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={handleNotificationToggle}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <FiBell size={20} className="text-gray-600" />
                  {bellNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {bellNotificationCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        🔔 Notifications
                      </h3>
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        MARK ALL
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {activeNotifications.length === 0 && !showOverdueAlert ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        <>
                          {activeNotifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-gray-100 transition ${!notif.read ? "bg-emerald-50/40" : "bg-white"}`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={`${notif.id}-${star}`}
                                      className={`text-sm ${star <= notif.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {notif.title}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500">
                                {notif.departmentName} •{" "}
                                {formatTimeAgo(notif.createdAt)}
                              </p>
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                "{notif.message}"
                              </p>
                              <div className="mt-3 flex gap-2">
                                <button
                                  onClick={() => {
                                    markNotificationRead(notif.id);
                                    handleRespond(notif.feedback);
                                    setShowNotifications(false);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                                >
                                  RESPOND
                                </button>
                                <button
                                  onClick={() => dismissNotification(notif.id)}
                                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50"
                                >
                                  DISMISS
                                </button>
                              </div>
                            </div>
                          ))}

                          {showOverdueAlert && (
                            <div className="p-4 bg-amber-50 border-b border-amber-100">
                              <div className="flex items-start gap-2">
                                <FiAlertCircle className="text-amber-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-amber-800">
                                    Response needed:{" "}
                                    {overdueNotifications.length} feedback
                                    pending (48h+)
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    Overdue response alert
                                  </p>
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={openPendingNotifications}
                                      className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700"
                                    >
                                      VIEW PENDING
                                    </button>
                                    <button
                                      onClick={() =>
                                        setOverdueAlertDismissed(true)
                                      }
                                      className="px-3 py-1.5 border border-amber-300 text-amber-700 text-xs rounded-lg hover:bg-amber-100"
                                    >
                                      DISMISS
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0) || user.username?.charAt(0) || "SM"}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {user.name || user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    Sector {user.sectorId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {activeTab === "dashboard" && renderDashboardTab()}
          {activeTab === "feedback" && renderFeedbackTab()}
          {activeTab === "performance" && renderPerformanceTab()}
          {activeTab === "reports" && renderReportsTab()}
          {activeTab === "settings" && renderSettingsTab()}
        </main>
      </div>

      {/* View Modal */}
      {showViewModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Feedback Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-2xl ${i < selectedFeedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {selectedFeedback.rating}.0 / 5.0
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">
                  "{selectedFeedback.comment || "No comment provided"}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiUser className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Visitor</p>
                    <p className="font-medium">
                      {selectedFeedback.visitor || "Anonymous"}
                    </p>
                  </div>
                </div>
                {selectedFeedback.visitorEmail && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiMail className="text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">
                        {selectedFeedback.visitorEmail}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiClock className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="font-medium">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedFeedback.departmentName && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiFileText className="text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-medium">
                        {selectedFeedback.departmentName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {selectedFeedback.response && (
                <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">
                    Your Response:
                  </p>
                  <p className="text-emerald-700">
                    {selectedFeedback.response}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Respond to Feedback
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-sm ${i < selectedFeedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  {selectedFeedback.comment || "No comment provided"}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  — {selectedFeedback.visitor || "Anonymous"}
                </p>
                {selectedFeedback.visitorEmail && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <FiMail size={10} /> {selectedFeedback.visitorEmail}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  rows="4"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Type your response here..."
                />
              </div>
              {selectedFeedback.visitorEmail && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    📧 Email notification will be sent to{" "}
                    {selectedFeedback.visitorEmail}
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResponse}
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <FiSend /> Send Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorDashboard;
