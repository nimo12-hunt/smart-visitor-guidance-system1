import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiStar,
  FiMessageSquare,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock as FiPending
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { toast, Toaster } from "react-hot-toast";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadOverview();
  }, [dateRange]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const overviewData = await analyticsService.getOverview(dateRange);
      setData(overviewData);
    } catch (error) {
      toast.error("Failed to load analytics data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading official records...</p>
        </div>
      </div>
    );
  }

  // Mock table data for demonstration of the "Critical Action Desk"
  const recentFeedbackTable = [
    { id: "FB-1049", date: "2026-04-17", dept: "Immigration Office", rating: 2, snippet: "Wait times were over 3 hours despite appointment.", status: "Pending", urgency: "High" },
    { id: "FB-1048", date: "2026-04-16", dept: "Land Registry", rating: 5, snippet: "The new digital map system is excellent and fast.", status: "Reviewed", urgency: "Low" },
    { id: "FB-1047", date: "2026-04-16", dept: "Tax & Revenue", rating: 1, snippet: "System crashed during my submission. Lost all data.", status: "Action Required", urgency: "Critical" },
    { id: "FB-1046", date: "2026-04-15", dept: "Civil Registration", rating: 4, snippet: "Staff was helpful but the waiting room was crowded.", status: "Reviewed", urgency: "Medium" },
    { id: "FB-1045", date: "2026-04-15", dept: "Immigration Office", rating: 2, snippet: "Signage inside the building is very confusing.", status: "Pending", urgency: "Medium" },
  ];

  const handleExport = () => {
    toast.loading("Compiling Executive Report...", { id: 'export' });
    
    setTimeout(() => {
      // Generate actual CSV content
      const headers = "Case ID,Date,Department,Rating,Comments,Status,Urgency\n";
      const rows = recentFeedbackTable.map(item => 
        `"${item.id}","${item.date}","${item.dept}",${item.rating},"${item.snippet}","${item.status}","${item.urgency}"`
      ).join("\n");
      
      // Create a verifiable Blob and force real Chrome download
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `MINT_Executive_Summary_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report dataset securely downloaded.", { id: 'export' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header with Date Range */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Executive Summary
          </h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            Official Feedback Records & Institutional Performance
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-300 text-sm rounded focus:ring-2 focus:ring-emerald-700 focus:outline-none shadow-sm"
          >
            <option value={7}>Past 7 Days</option>
            <option value={30}>Past 30 Days</option>
            <option value={90}>Past 1 Quarter</option>
          </select>
          <button
            onClick={loadOverview}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition shadow-sm flex items-center gap-2 font-medium"
          >
            <FiRefreshCw className="text-gray-500" /> Refresh Data
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-emerald-700 text-white text-sm rounded hover:bg-emerald-800 transition shadow-sm flex items-center gap-2 font-medium">
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards - The "Executive View" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Submissions"
          value={data?.totalFeedback || 0}
          icon={<FiMessageSquare />}
          trend="+12%"
        />
        <KPICard
          title="Avg Satisfaction"
          value={data?.avgRating || 0}
          suffix="/5"
          icon={<FiStar />}
          trend={data?.avgRating > 4.5 ? "+0.2" : "-0.1"}
        />
        <KPICard
          title="Processing Rate"
          value={`${data?.responseRate || 0}%`}
          icon={<FiClock />}
          trend="+5%"
        />
        <KPICard
          title="Active Departments"
          value={data?.totalDepartments || 0}
          icon={<FiTrendingUp />}
        />
        <KPICard
          title="Public Sentiment"
          value="78%"
          icon={<FiTrendingUp />}
          trend="+8%"
        />
      </div>

      {/* Actionable Data Table instead of Charts */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Recent Case Registry
          </h2>
          <button className="text-sm text-emerald-700 font-semibold hover:underline">
            View All Cases →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Case ID</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Rating</th>
                <th className="px-6 py-3 font-semibold">Feedback Snippet</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentFeedbackTable.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                    {item.urgency === "Critical" && <FiAlertCircle className="text-red-600" />}
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {item.dept}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${item.rating <= 2 ? 'text-red-600' : item.rating >= 4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.rating}
                      </span>
                      <FiStar className={item.rating <= 2 ? 'text-red-600' : item.rating >= 4 ? 'text-emerald-600' : 'text-amber-600'} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                    "{item.snippet}"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        item.status === "Action Required" 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simplified, Professional KPI Card Component
const KPICard = ({ title, value, suffix = "", icon, trend }) => {
  const isPositive = trend && !trend.includes("-");

  return (
    <div className="bg-white border border-gray-200 rounded p-5 shadow-sm hover:border-emerald-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wide">{title}</h3>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between mt-4">
        <div className="text-2xl font-black text-gray-900">
          {value}{suffix}
        </div>
        {trend && (
          <div className={`text-xs font-bold flex items-center gap-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
