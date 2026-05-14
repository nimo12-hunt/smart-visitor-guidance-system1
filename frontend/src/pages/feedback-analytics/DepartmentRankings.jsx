import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiSearch,
  FiDownload,
  FiEye,
  FiFilter,
  FiChevronUp,
  FiChevronDown
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { toast, Toaster } from "react-hot-toast";

const DepartmentRankings = () => {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [filteredRankings, setFilteredRankings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadRankings();
  }, []);

  useEffect(() => {
    filterRankings();
  }, [rankings, searchTerm, buildingFilter]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getRankings({
        sortBy,
        order: sortOrder,
      });

      const rankingsData = Array.isArray(data) ? data : [];
      setRankings(rankingsData);
      setFilteredRankings(rankingsData);
    } catch (error) {
      console.error("Error loading rankings:", error);
      toast.error("Failed to load official rankings.");
      setRankings([]);
      setFilteredRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRankings = () => {
    let filtered = [...rankings];

    if (buildingFilter !== "all") {
      filtered = filtered.filter((d) => d?.building === buildingFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((d) => {
        const deptName = d?.name?.en || d?.name || "";
        return deptName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredRankings(filtered);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);

    const sorted = [...filteredRankings].sort((a, b) => {
      let aVal = a?.[field];
      let bVal = b?.[field];

      if (field === "name") {
        aVal = a?.name?.en || a?.name || "";
        bVal = b?.name?.en || b?.name || "";
      }

      if (newOrder === "desc") {
        return aVal < bVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    setFilteredRankings(sorted);
  };

  const handleExport = () => {
    // Simulating an export download
    const promise = new Promise((resolve) => setTimeout(resolve, 800));
    toast.promise(promise, {
      loading: 'Generating official report...',
      success: 'Rankings exported as CSV.',
      error: 'Export failed!',
    });
  };

  const getTrendUI = (trend) => {
    if (trend > 0.1) return <span className="text-emerald-700 font-bold flex items-center gap-1"><FiTrendingUp /> +{trend.toFixed(2)}</span>;
    if (trend < -0.1) return <span className="text-red-700 font-bold flex items-center gap-1"><FiTrendingDown /> {trend.toFixed(2)}</span>;
    return <span className="text-gray-500 font-bold flex items-center gap-1"><FiMinus /> 0.00</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Querying institutional records...</p>
        </div>
      </div>
    );
  }

  const topPerformer = [...rankings].sort((a, b) => (b?.rating || 0) - (a?.rating || 0))[0];
  const mostResponsive = [...rankings].sort((a, b) => (b?.responseRate || 0) - (a?.responseRate || 0))[0];
  const mostFeedback = [...rankings].sort((a, b) => (b?.totalFeedback || 0) - (a?.totalFeedback || 0))[0];

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Departmental Rankings
          </h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            Official Performance & Compliance Leaderboard
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="mt-4 md:mt-0 px-4 py-2 bg-emerald-700 text-white text-sm rounded shadow-sm hover:bg-emerald-800 transition flex items-center justify-center gap-2 font-medium"
        >
          <FiDownload /> Export Dataset
        </button>
      </div>

      {/* Analytics Summary */}
      {!rankings || rankings.length === 0 ? null : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryBlock
            title="Highest Rated Office"
            value={topPerformer?.name?.en || "N/A"}
            subValue={`Rating: ${(topPerformer?.rating || 0).toFixed(1)} / 5.0`}
          />
          <SummaryBlock
            title="Most Responsive"
            value={mostResponsive?.name?.en || "N/A"}
            subValue={`Response Rate: ${mostResponsive?.responseRate || 0}%`}
          />
          <SummaryBlock
            title="Highest Volume"
            value={mostFeedback?.name?.en || "N/A"}
            subValue={`Total Cases: ${mostFeedback?.totalFeedback || 0}`}
          />
        </div>
      )}

      {/* Control Panel (Filters & Search) */}
      <div className="bg-white border border-gray-200 shadow-sm rounded flex flex-col md:flex-row p-4 gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-700 font-bold text-sm w-full md:w-auto">
          <FiFilter className="text-gray-500" />
          FILTERS:
        </div>
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by department name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-700 focus:outline-none"
          />
        </div>
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium"
        >
          <option value="all">Facility: All Zones</option>
          <option value="A">Facility: Building A (Main)</option>
          <option value="B">Facility: Building B (Annex)</option>
        </select>
      </div>

      {/* Rankings Table */}
      {!rankings || rankings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
          <p className="font-semibold text-lg">No official data available.</p>
          <p className="text-sm mt-1">Please ensure departments and feedback are populated in the system.</p>
          <Link
            to="/admin/departments"
            className="inline-block mt-4 px-4 py-2 bg-emerald-700 text-white rounded text-sm shadow hover:bg-emerald-800 transition"
          >
            Manage Departments
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3">Rank</th>
                  <SortableHeader label="Department Name" field="name" currentSort={sortBy} order={sortOrder} onClick={handleSort} />
                  <th className="px-6 py-3">Facility</th>
                  <SortableHeader label="Avg Rating" field="rating" currentSort={sortBy} order={sortOrder} onClick={handleSort} />
                  <SortableHeader label="Case Vol." field="totalFeedback" currentSort={sortBy} order={sortOrder} onClick={handleSort} />
                  <SortableHeader label="Resolution %" field="responseRate" currentSort={sortBy} order={sortOrder} onClick={handleSort} />
                  <th className="px-6 py-3">Efficiency Trend</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRankings.map((dept, index) => (
                  <tr key={dept?.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900 text-lg">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 uppercase tracking-tight text-sm">
                        {dept?.name?.en || dept?.name || "UNSPECIFIED"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Floor {dept?.floor || "-"} | Rm {dept?.room || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded text-xs font-bold border border-gray-300 bg-gray-100 text-gray-700">
                        {dept?.building === "A" ? "ZONE-A" : dept?.building === "B" ? "ZONE-B" : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-emerald-700 text-base">
                        {(dept?.rating || 0).toFixed(1)} <FiStar className="inline pb-1" />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {dept?.totalFeedback || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900 w-10">
                          {dept?.responseRate || 0}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-sm h-1.5">
                          <div
                            className="bg-emerald-700 h-1.5 rounded-sm"
                            style={{ width: `${dept?.responseRate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTrendUI(dept?.trend || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/feedback-analytics/department/${dept?.id}`}
                        className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded text-xs font-bold shadow-sm inline-flex items-center gap-1 transition"
                      >
                        <FiEye /> View File
                      </Link>
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

// Sub-components for cleaner code
const SummaryBlock = ({ title, value, subValue }) => (
  <div className="bg-white border border-gray-200 p-4 rounded shadow-sm hover:border-emerald-700 transition">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
    <p className="text-lg font-black text-gray-900 mt-1 truncate">{value}</p>
    <p className="text-sm font-medium text-emerald-700 mt-1">{subValue}</p>
  </div>
);

const SortableHeader = ({ label, field, currentSort, order, onClick }) => (
  <th
    className="px-6 py-3 cursor-pointer hover:bg-gray-200 transition select-none group"
    onClick={() => onClick(field)}
  >
    <div className="flex items-center gap-1">
      {label}
      <div className="flex flex-col text-gray-400 group-hover:text-gray-600">
        <FiChevronUp strokeWidth={3} className={`w-3 h-3 -mb-1 max-h-3 ${currentSort === field && order === 'asc' ? 'text-emerald-700' : ''}`} />
        <FiChevronDown strokeWidth={3} className={`w-3 h-3 mt-0 max-h-3 ${currentSort === field && order === 'desc' ? 'text-emerald-700' : ''}`} />
      </div>
    </div>
  </th>
);

export default DepartmentRankings;
