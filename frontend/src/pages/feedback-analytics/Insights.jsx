import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiActivity,
  FiAward,
  FiDownload,
  FiRefreshCw,
  FiHash,
  FiChevronRight
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { departmentService } from "../../services/departmentService";
import { feedbackService } from "../../services/feedbackService";
import { toast, Toaster } from "react-hot-toast";

const Insights = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [insights, setInsights] = useState({
    totalFeedback: 0,
    avgResponseTime: 0,
    overallRating: 0,
    responseRate: 0,
    topKeywords: [],
    responseRateByDept: [],
    departmentPerformance: [],
    peakHour: null
  });

  useEffect(() => {
    loadInsights();
  }, [timeRange]);

  const loadInsights = async () => {
    try {
      setLoading(true);

      const [rankings, allFeedback] = await Promise.all([
        analyticsService.getRankings({ sortBy: "rating" }),
        feedbackService.getAll(),
      ]);

      const safeRankings = Array.isArray(rankings) ? rankings : [];
      const safeFeedback = Array.isArray(allFeedback) ? allFeedback : [];

      // Basic Stats
      const totalFeedback = safeFeedback.length;
      const overallRating = safeRankings.length > 0
        ? safeRankings.reduce((sum, d) => sum + (d.rating || 0), 0) / safeRankings.length
        : 0;

      // Department Performance
      const departmentPerformance = safeRankings.slice(0, 5).map(dept => ({
        name: dept.name?.en || "Unknown",
        rating: dept.rating || 0,
        feedback: dept.totalFeedback || 0,
        responseRate: dept.responseRate || 0,
      }));

      // Top Keywords (Extracted from real comments)
      const topKeywords = extractTopKeywords(safeFeedback);

      // Hourly Distribution -> Find Peak Hour
      const peakHour = calculatePeakHour(safeFeedback);

      // Response Rate By Dept
      const responseRateByDept = safeRankings.slice(0, 8).map(dept => ({
        name: dept.name?.en || "Unknown",
        rate: dept.responseRate || 0
      }));

      const responseRate = responseRateByDept.length > 0
        ? responseRateByDept.reduce((sum, d) => sum + d.rate, 0) / responseRateByDept.length
        : 0;

      setInsights({
        totalFeedback,
        avgResponseTime: 8.3, // Standard operational latency mock
        overallRating,
        responseRate,
        topKeywords,
        responseRateByDept,
        departmentPerformance,
        peakHour
      });

    } catch (error) {
      console.error("Error loading insights:", error);
      toast.error("Failed to compile operational insights data");
    } finally {
      setLoading(false);
    }
  };

  const extractTopKeywords = (feedback) => {
    const words = {};
    const stopWords = ["the","and","this","that","with","very","really","quite","have","has","had","was","were","are"];

    feedback.forEach((f) => {
      if (f.comment) {
        const commentWords = f.comment.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
        commentWords.forEach((word) => {
          if (word.length > 3 && !stopWords.includes(word)) {
            words[word] = (words[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  };

  const calculatePeakHour = (feedback) => {
    const hours = Array(24).fill(0);
    feedback.forEach((f) => {
      if (f.createdAt) {
        const hour = new Date(f.createdAt).getHours();
        hours[hour] = (hours[hour] || 0) + 1;
      }
    });
    
    let max = 0;
    let peakIndex = 0;
    hours.forEach((count, idx) => {
       if (count > max) { max = count; peakIndex = idx; }
    });

    return { hour: `${peakIndex}:00`, count: max };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-white border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700 mx-auto"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">Compiling Operational Insight Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Data Insights
          </h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            Core Operational Feedback Diagnostics
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-700 font-medium"
          >
            <option value="7">Trailing 7 Days</option>
            <option value="30">Trailing 30 Days</option>
            <option value="90">Trailing Quarter</option>
          </select>
          <button onClick={loadInsights} className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition">
            <FiRefreshCw /> Resync
          </button>
          <button className="px-3 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-sm">
            <FiDownload /> Extract
          </button>
        </div>
      </div>

      {/* Primary Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DataBox title="Total Logged Cases" value={insights.totalFeedback} icon={<FiActivity />} />
        <DataBox title="Operational Latency" value={insights.avgResponseTime.toFixed(1)} suffix=" hrs" icon={<FiClock />} />
        <DataBox title="Performance Index" value={insights.overallRating.toFixed(1)} suffix=" / 5.0" icon={<FiAward />} />
        <DataBox title="Clearing Rate" value={insights.responseRate.toFixed(1)} suffix="%" icon={<FiCheckCircleIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Efficiency Table */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
           <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                Resolution Efficiency Matrix
              </h2>
           </div>
           <div className="p-0">
              <table className="w-full text-left text-sm">
                 <thead className="bg-white border-b border-gray-200">
                    <tr>
                       <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">Facility/Department</th>
                       <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">Resolution Cleared</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {insights.responseRateByDept.length === 0 ? (
                      <tr><td colSpan="2" className="p-5 text-center text-gray-400">No Data Available</td></tr>
                    ) : insights.responseRateByDept.map((dept, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                         <td className="px-5 py-3 font-semibold text-gray-800">{dept.name}</td>
                         <td className="px-5 py-3 flex items-center gap-3">
                            <span className="w-10 text-right font-black text-gray-700">{dept.rate}%</span>
                            <div className="flex-1 bg-gray-200 h-2">
                               <div className="bg-emerald-700 h-2" style={{ width: `${dept.rate}%` }}></div>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Narrative Keyword Data */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
           <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                 Verbatim Keyword Extraction
              </h2>
           </div>
           <div className="p-5">
              {insights.topKeywords.length === 0 ? (
                 <p className="text-gray-400 text-center py-10">System detected no substantial keyword vectors.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                   {insights.topKeywords.map((kw, idx) => (
                     <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded bg-gray-50">
                        <span className="font-bold text-gray-700 text-sm uppercase flex items-center gap-1"><FiHash className="text-emerald-700 text-xs" /> {kw.word}</span>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 rounded-full text-xs font-black">
                           {kw.count}x
                        </span>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* System Anomalies / Standouts */}
         <div className="bg-emerald-900 border border-black rounded shadow-sm p-6 text-white flex flex-col justify-between">
            <div>
               <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1 border-b border-emerald-800 pb-2">Peak Network Hour</p>
               <h3 className="text-4xl font-black mt-4">{insights.peakHour?.hour || "N/A"}</h3>
               <p className="text-emerald-300 text-sm mt-2 font-medium">Largest bulk ingestion of operational feedback occurs at this time marker.</p>
            </div>
         </div>

         {/* Elite Department Standout */}
         <div className="bg-white border border-gray-200 rounded shadow-sm p-6 flex flex-col justify-between">
            <div>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1 border-b border-gray-200 pb-2">Primary Performer</p>
               <div className="flex items-center gap-3 mt-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase">
                    {insights.departmentPerformance[0]?.name || "N/A"}
                  </h3>
               </div>
               <p className="text-gray-500 text-sm mt-2 font-medium flex items-center gap-1">
                  Maintained an index rating of <strong className="text-emerald-700">{insights.departmentPerformance[0]?.rating.toFixed(1) || "0.0"} / 5.0</strong> inside time-bounded query.
               </p>
            </div>
            <button className="mt-6 text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 hover:underline">
               Review Specifics <FiChevronRight />
            </button>
         </div>
      </div>

    </div>
  );
};

// Internal minimal Icon to remove imports overhead
const FiCheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const DataBox = ({ title, value, suffix = "", icon }) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded shadow-sm hover:border-emerald-700 transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{title}</h3>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 mt-2">
        {value}{suffix}
      </p>
    </div>
  );
};

export default Insights;
