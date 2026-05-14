import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiEye,
  FiStar,
  FiUsers,
  FiGrid,
  FiClock,
  FiThumbsUp,
  FiMessageCircle,
  FiAward,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { departmentService } from "../../services/departmentService";
import { feedbackService } from "../../services/feedbackService";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalFeedback: 0,
    avgRating: 0,
    pendingFeedback: 0,
    resolvedFeedback: 0,
    responseRate: 0,
    buildingA: { depts: 0, floors: 0, rating: 0 },
    buildingB: { depts: 0, floors: 0, rating: 0 },
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // Chart data states
  const [departmentRatings, setDepartmentRatings] = useState({
    labels: [],
    datasets: [],
  });
  const [feedbackDistribution, setFeedbackDistribution] = useState({
    labels: [],
    datasets: [],
  });
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: [],
  });
  const [topDepartments, setTopDepartments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [, setRecentFeedback] = useState([]);
  const [timeRange, setTimeRange] = useState("week");

  // ============= HELPER FUNCTIONS =============

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return new Date(date).toLocaleDateString();
  };

  const getDepartmentRatings = async () => {
    try {
      const depts = await departmentService.getAll();
      const topDepts = depts.slice(0, 8);
      return {
        labels: topDepts.map((d) => d.name?.en?.substring(0, 15) || "Unknown"),
        datasets: [
          {
            label: "Rating",
            data: topDepts.map((d) => d.rating || 4.5),
            backgroundColor: [
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(139, 92, 246, 0.8)",
              "rgba(236, 72, 153, 0.8)",
              "rgba(6, 182, 212, 0.8)",
              "rgba(249, 115, 22, 0.8)",
              "rgba(34, 197, 94, 0.8)",
            ],
            borderRadius: 8,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
        ],
      };
    } catch (error) {
      console.error("Error loading department ratings:", error);
      return { labels: [], datasets: [] };
    }
  };

  const calculateFeedbackDistribution = (feedbacks) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      distribution[f.rating]++;
    });
    setRatingDistribution(distribution);
    return {
      labels: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
      datasets: [
        {
          data: [
            distribution[5] || 0,
            distribution[4] || 0,
            distribution[3] || 0,
            distribution[2] || 0,
            distribution[1] || 0,
          ],
          backgroundColor: [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#f97316",
            "#ef4444",
          ],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    };
  };

  const generateMonthlyTrend = (feedbacks) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      last6Months.push(months[(currentMonth - i + 12) % 12]);
    }

    const monthlyRatings = last6Months.map((month, idx) => {
      const monthFeedbacks = feedbacks.filter((f) => {
        const date = new Date(f.createdAt);
        return date.getMonth() === (currentMonth - (5 - idx) + 12) % 12;
      });
      const avg =
        monthFeedbacks.length > 0
          ? monthFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
            monthFeedbacks.length
          : 4.0;
      return parseFloat(avg.toFixed(1));
    });

    return {
      labels: last6Months,
      datasets: [
        {
          label: "Average Rating",
          data: monthlyRatings,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getTopDepartments = async (feedbacks, departments) => {
    const deptMap = new Map();
    feedbacks.forEach((f) => {
      if (!deptMap.has(f.department)) {
        deptMap.set(f.department, { count: 0, total: 0 });
      }
      const data = deptMap.get(f.department);
      data.count++;
      data.total += f.rating;
    });
    const topDepts = Array.from(deptMap.entries())
      .map(([id, data]) => ({
        id,
        name: departments.find((d) => d.id === id)?.name?.en || "Unknown",
        rating: data.count > 0 ? (data.total / data.count).toFixed(1) : "0",
        feedback: data.count,
      }))
      .sort((a, b) => b.feedback - a.feedback)
      .slice(0, 5);
    return topDepts;
  };

  const generateRecentActivities = (recentFeed) => {
    return recentFeed.slice(0, 6).map((f) => ({
      id: f._id || f.id,
      user: f.visitor || "Anonymous",
      action: `Left feedback for ${f.deptName || `Department ${f.department}`}`,
      time: formatTimeAgo(f.createdAt),
      icon: "⭐",
      rating: f.rating,
      type: "feedback",
    }));
  };

  const handleExportReport = async () => {
    setExporting(true);
    toast.loading("Generating executive report...", { id: "export" });
    try {
      const feedbacks = await feedbackService.getAll();
      const departments = await departmentService.getAll();

      const csvData = [
        ["Report Generated", new Date().toLocaleString()],
        ["", ""],
        ["EXECUTIVE SUMMARY", ""],
        ["Total Departments", departments.length],
        ["Total Feedback", feedbacks.length],
        [
          "Average Rating",
          (
            feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length || 0
          ).toFixed(1),
        ],
        [
          "Response Rate",
          `${Math.round((feedbacks.filter((f) => f.response).length / feedbacks.length) * 100 || 0)}%`,
        ],
        ["", ""],
        ["DEPARTMENT RANKINGS", "", "", ""],
        ["Rank", "Department", "Rating", "Feedback Count"],
        ...topDepartments.map((d, i) => [i + 1, d.name, d.rating, d.feedback]),
        ["", ""],
        ["RATING DISTRIBUTION", "", "", ""],
        ["Rating", "Count", "Percentage", ""],
        ...Object.entries(ratingDistribution).map(([rating, count]) => [
          `${rating} Star`,
          count,
          ((count / feedbacks.length) * 100).toFixed(1) + "%",
          "",
        ]),
      ];

      const csv = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mint-executive-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Report exported successfully", { id: "export" });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to export report", { id: "export" });
    } finally {
      setExporting(false);
    }
  };

  // ============= MAIN DATA LOADING FUNCTION =============

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [departments, , buildingStats, allFeedback, deptRatings] =
        await Promise.all([
          departmentService.getAll(),
          feedbackService.getStats(),
          departmentService.getBuildingStats(),
          feedbackService.getAll(),
          getDepartmentRatings(),
        ]);

      const feedbacks = allFeedback || [];
      const totalFeedbacks = feedbacks.length;
      const avgRating =
        totalFeedbacks > 0
          ? (
              feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
            ).toFixed(1)
          : 0;
      const resolvedFeedbacks = feedbacks.filter((f) => f.resolved).length;
      const respondedFeedbacks = feedbacks.filter(
        (f) => f.response && !f.resolved,
      ).length;
      const responseRate =
        totalFeedbacks > 0
          ? Math.round(
              ((respondedFeedbacks + resolvedFeedbacks) / totalFeedbacks) * 100,
            )
          : 0;

      setStats({
        totalDepts: departments.length,
        totalFeedback: totalFeedbacks,
        avgRating: parseFloat(avgRating),
        pendingFeedback: feedbacks.filter((f) => !f.response && !f.resolved)
          .length,
        resolvedFeedback: resolvedFeedbacks,
        respondedFeedback: respondedFeedbacks,
        responseRate: responseRate,
        buildingA: buildingStats?.A || { depts: 0, floors: 0, rating: 0 },
        buildingB: buildingStats?.B || { depts: 0, floors: 0, rating: 0 },
      });

      setFeedbackDistribution(calculateFeedbackDistribution(feedbacks));
      setTrendData(generateMonthlyTrend(feedbacks));
      setDepartmentRatings(deptRatings);

      const topDepts = await getTopDepartments(feedbacks, departments);
      setTopDepartments(topDepts);

      const recentFeed = feedbacks.slice(0, 8);
      setRecentFeedback(recentFeed);
      setRecentActivities(generateRecentActivities(recentFeed));

      // Calculate monthly data for extra chart
      const monthlyStats = [];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      for (let i = 0; i < 6; i++) {
        const monthFeedbacks = feedbacks.filter(
          (f) => new Date(f.createdAt).getMonth() === i,
        );
        monthlyStats.push({
          month: months[i],
          count: monthFeedbacks.length,
          rating:
            monthFeedbacks.length > 0
              ? (
                  monthFeedbacks.reduce((a, b) => a + b.rating, 0) /
                  monthFeedbacks.length
                ).toFixed(1)
              : 0,
        });
      }
      setMonthlyData(monthlyStats);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Welcome Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's your comprehensive ministry performance
            overview.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDashboardData}
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleExportReport}
            disabled={exporting}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <FiDownload size={14} />{" "}
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1 - Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Total Departments"
          value={stats.totalDepts}
          icon={<FiGrid size={18} />}
          trend="+0"
          color="emerald"
        />
        <KpiCard
          label="Total Feedback"
          value={stats.totalFeedback}
          icon={<FiMessageCircle size={18} />}
          trend={`+${stats.totalFeedback > 0 ? Math.round(stats.totalFeedback * 0.12) : 0}%`}
          color="blue"
        />
        <KpiCard
          label="Avg Rating"
          value={`${stats.avgRating}`}
          suffix="★"
          icon={<FiStar size={18} />}
          trend={stats.avgRating > 4.5 ? "+0.2" : "-0.1"}
          color="amber"
        />
        <KpiCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          icon={<FiTrendingUp size={18} />}
          trend={`+${stats.responseRate > 50 ? 5 : 2}%`}
          color="teal"
        />
        <KpiCard
          label="Resolved"
          value={stats.resolvedFeedback}
          icon={<FiThumbsUp size={18} />}
          trend={`+${Math.round(stats.resolvedFeedback * 0.1)}`}
          color="green"
        />
        <KpiCard
          label="Pending"
          value={stats.pendingFeedback}
          icon={<FiClock size={18} />}
          trend={
            stats.pendingFeedback > 0
              ? `-${Math.round(stats.pendingFeedback * 0.2)}`
              : "0"
          }
          color="orange"
        />
      </div>

      {/* Building Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border p-5 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  MAIN BUILDING
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Building A</h3>
              <p className="text-gray-500 text-sm">
                {stats.buildingA.depts} departments • {stats.buildingA.floors}{" "}
                floors
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.buildingA.rating.toFixed(1)}
              </div>
              <div className="flex text-yellow-400 text-sm">★★★★★</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏢</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  ANNEX BUILDING
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Building B</h3>
              <p className="text-gray-500 text-sm">
                {stats.buildingB.depts} departments • {stats.buildingB.floors}{" "}
                floors
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {stats.buildingB.rating.toFixed(1)}
              </div>
              <div className="flex text-yellow-400 text-sm">★★★★★</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Ratings Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Department Ratings
              </h2>
            </div>
            <Link
              to="/admin/departments"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              View All →
            </Link>
          </div>
          <div className="h-72">
            {departmentRatings.labels.length > 0 ? (
              <Bar
                data={departmentRatings}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw} ★` } },
                  },
                  scales: {
                    y: {
                      max: 5,
                      title: { display: true, text: "Rating (1-5 Stars)" },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Monthly Rating Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Monthly Rating Trend
              </h2>
            </div>
            <div className="flex gap-1">
              {["week", "month", "quarter"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-1 text-xs rounded-md transition ${timeRange === range ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {range === "week"
                    ? "Weekly"
                    : range === "month"
                      ? "Monthly"
                      : "Quarterly"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.raw} ★` } },
                },
                scales: {
                  y: {
                    min: 3,
                    max: 5,
                    title: { display: true, text: "Average Rating" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Second Row - Rating Distribution & Top Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Distribution Doughnut Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">
              Rating Distribution
            </h2>
          </div>
          <div className="h-56">
            <Doughnut
              data={feedbackDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxWidth: 10, font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="text-center">
                <div className="text-xs font-bold text-gray-600">{rating}★</div>
                <div className="text-sm font-semibold text-gray-800">
                  {ratingDistribution[rating] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Departments List */}
        <div className="bg-white rounded-xl shadow-sm border p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Top Performing Departments
              </h2>
            </div>
            <Link
              to="/admin/departments"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {topDepartments.length > 0 ? (
              topDepartments.map((dept, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx === 0 ? "bg-gradient-to-r from-amber-500 to-orange-500" : idx === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500" : idx === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dept.name}</p>
                      <p className="text-xs text-gray-400">
                        {dept.feedback} feedback entries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar
                      className="text-amber-500 fill-amber-500"
                      size={14}
                    />
                    <span className="font-bold text-gray-800">
                      {dept.rating}
                    </span>
                    <span className="text-xs text-gray-400">/5</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No feedback data available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-base">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {activity.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<FiGrid />}
              title="Add Department"
              description="Create new department"
              color="emerald"
              link="/admin/departments"
            />
            <QuickActionCard
              icon={<FiStar />}
              title="View Feedback"
              description="Review recent feedback"
              color="amber"
              link="/admin/feedback"
            />
            <QuickActionCard
              icon={<FiUsers />}
              title="Manage Managers"
              description="Add sector managers"
              color="blue"
              link="/admin/sector-managers"
            />
            <QuickActionCard
              icon={<FiMegaphone />}
              title="Announcements"
              description="Post public updates"
              color="purple"
              link="/admin/announcements"
            />
            <QuickActionCard
              icon={<FiDownload />}
              title="Export Data"
              description="Download reports"
              color="teal"
              link="#"
              onClick={handleExportReport}
            />
            <QuickActionCard
              icon={<FiRefreshCw />}
              title="Refresh Data"
              description="Sync latest data"
              color="gray"
              link="#"
              onClick={loadDashboardData}
            />
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">
              Monthly Performance Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-center">Feedback Count</th>
                  <th className="px-4 py-2 text-center">Average Rating</th>
                  <th className="px-4 py-2 text-center">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyData.map((month, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{month.month}</td>
                    <td className="px-4 py-2 text-center">{month.count}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiStar
                          className="text-amber-500 fill-amber-500"
                          size={12}
                        />
                        <span className="font-semibold">{month.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full max-w-24">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${(month.rating / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {((month.rating / 5) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// KPI Card Component
const KpiCard = ({ label, value, suffix = "", icon, trend, color }) => {
  const isPositive = trend && !trend.includes("-");
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    teal: "bg-teal-100 text-teal-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-800">
            {value}
            {suffix}
          </p>
          {trend && (
            <p
              className={`text-[9px] mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {isPositive ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div
          className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({
  icon,
  title,
  description,
  color,
  link,
  onClick,
}) => {
  const colors = {
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    blue: "from-blue-500 to-indigo-500",
    purple: "from-purple-500 to-pink-500",
    teal: "from-teal-500 to-cyan-500",
    gray: "from-gray-500 to-gray-600",
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const Comp = link ? Link : "button";

  return (
    <Comp
      to={link}
      onClick={handleClick}
      className={`p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition group ${link ? "" : "cursor-pointer"}`}
    >
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-r ${colors[color]} text-white flex items-center justify-center text-base mb-2 group-hover:scale-110 transition`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
    </Comp>
  );
};

// Import missing icon
const FiMegaphone = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

export default Dashboard;
