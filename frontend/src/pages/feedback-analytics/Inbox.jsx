import React, { useState, useEffect } from "react";
import {
  FiInbox,
  FiStar,
  FiFilter,
  FiSearch,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiCalendar,
  FiRefreshCw,
  FiX,
  FiSend,
  FiAlertCircle
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { departmentService } from "../../services/departmentService";
import { toast, Toaster } from "react-hot-toast";

const Inbox = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    building: "all",
    rating: "all",
    department: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [filters, pagination.page]);

  const loadData = async () => {
    try {
      const depts = await departmentService.getAll();
      setDepartments(depts || []);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to load departments registry");
    }
  };

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status !== "all" ? filters.status : undefined,
        building: filters.building !== "all" ? filters.building : undefined,
        rating: filters.rating !== "all" ? parseInt(filters.rating) : undefined,
        department: filters.department !== "all" ? filters.department : undefined,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await analyticsService.getInbox(params);
      setFeedbacks(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to query feedback records");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Error: Response body cannot be empty");
      return;
    }

    try {
      await analyticsService.respondToFeedback(selectedFeedback._id, responseText);
      toast.success("Official response recorded successfully");
      setShowResponseModal(false);
      loadFeedbacks();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("System error: Failed to record response");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (feedback) => {
    if (feedback.response) {
      return (
        <span className="px-2 py-0.5 border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 leading-tight rounded-sm">
          <FiCheckCircle strokeWidth={3} /> RESPONDED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 border border-amber-300 bg-amber-50 text-amber-800 text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 leading-tight rounded-sm">
        <FiClock strokeWidth={3} /> ACTION PENDING
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Case Management Inbox
          </h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            Review, Process, and Reply to Official Public Submissions
          </p>
        </div>
        <button
          onClick={loadFeedbacks}
          className="mt-4 md:mt-0 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-medium"
        >
          <FiRefreshCw className="text-gray-500" /> Sync Records
        </button>
      </div>

      {/* Stats Summary Array */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Case Volume" value={pagination.total} icon={<FiInbox />} />
        <StatBox title="Requires Action" value={feedbacks.filter((f) => !f.response).length} icon={<FiClock />} isAlert={feedbacks.filter((f) => !f.response).length > 0} />
        <StatBox title="Resolved Cases" value={feedbacks.filter((f) => f.response).length} icon={<FiCheckCircle />} />
        <StatBox title="Avg Resolution Time" value="8.3 hrs" icon={<FiClock />} />
      </div>

      {/* Control Panel / Filter Matrix */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded shadow-sm">
        <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase mb-3 tracking-wider">
          <FiFilter className="text-gray-500" /> Filter Case Registry
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Query submission text..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium text-gray-700"
          >
            <option value="all">S: All Statuses</option>
            <option value="pending">S: Pending Action</option>
            <option value="responded">S: Responded</option>
          </select>

          <select
            value={filters.building}
            onChange={(e) => setFilters({ ...filters, building: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium text-gray-700"
          >
            <option value="all">F: All Facilities</option>
            <option value="A">F: Zone A</option>
            <option value="B">F: Zone B</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium text-gray-700"
          >
            <option value="all">R: All Ratings</option>
            <option value="5">R: 5 (Excellent)</option>
            <option value="4">R: 4 (Good)</option>
            <option value="3">R: 3 (Neutral)</option>
            <option value="2">R: 2 (Poor)</option>
            <option value="1">R: 1 (Critical)</option>
          </select>

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium text-gray-700"
          >
            <option value="all">D: All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name?.en || 'Unknown'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inbox Data Array */}
      {loading ? (
        <div className="flex items-center justify-center p-12 border border-gray-200 border-dashed rounded bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mx-auto"></div>
            <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest">Accessing Submissions...</p>
          </div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-12 text-center text-gray-500">
          <FiAlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="font-semibold text-lg text-gray-700">No records found</p>
          <p className="text-sm mt-1">The filtered query returned zero matching submissions.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {feedbacks.map((feedback) => (
              <li key={feedback._id} className={`p-5 transition hover:bg-gray-50 ${!feedback.response ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-600'}`}>

                <div className="flex justify-between items-start">

                  {/* Left Column: Metadata & Details */}
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm uppercase">Case #{feedback._id.substring(feedback._id.length - 6).toUpperCase()}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-700 text-sm font-semibold">{feedback.deptName}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 text-sm font-bold bg-gray-100 px-1 inline-block border border-gray-200">
                        {feedback.building === 'A' ? 'ZONE A' : feedback.building === 'B' ? 'ZONE B' : 'UNKNOWN'}
                      </span>
                      {getStatusBadge(feedback)}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-sm font-bold">
                        <span className={`mr-1 ${feedback.rating <= 2 ? 'text-red-700' : feedback.rating >= 4 ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {feedback.rating}.0
                        </span>
                        <div className="flex text-yellow-500 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={i < feedback.rating ? "fill-current" : "text-gray-300"} size={14} />
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-300 text-xs">•</span>
                      <div className="text-xs text-gray-500 font-medium tracking-tight flex items-center gap-1">
                        <FiUser /> {feedback.visitor || "Anonymous Citizen"}
                      </div>
                      <span className="text-gray-300 text-xs">•</span>
                      <div className="text-xs text-gray-500 font-medium tracking-tight flex items-center gap-1">
                        <FiCalendar /> {formatDate(feedback.createdAt)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-800 leading-relaxed font-medium bg-white p-3 border border-gray-200 rounded">
                      "{feedback.comment || "No written body text provided."}"
                    </div>

                    {feedback.response && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded mt-2">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FiCheckCircle /> Official Response Recorded
                        </div>
                        <p className="text-sm text-emerald-900 font-medium">
                          {feedback.response}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Act Button */}
                  <div className="pl-4">
                    <button
                      onClick={() => handleRespond(feedback)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded transition-colors ${feedback.response
                          ? 'border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-800'
                          : 'border-emerald-700 text-emerald-700 bg-white hover:bg-emerald-700 hover:text-white'
                        }`}
                    >
                      {feedback.response ? "Edit Reply" : "PROCESS / REPLY"}
                    </button>
                  </div>
                </div>

              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Showing Rows {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-white border border-gray-300 text-xs font-bold rounded shadow-sm hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  PREV
                </button>
                <div className="px-3 py-1 bg-gray-200 border border-gray-300 text-gray-700 text-xs font-bold rounded shadow-sm flex items-center">
                  PG {pagination.page} / {pagination.pages}
                </div>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 bg-white border border-gray-300 text-xs font-bold rounded shadow-sm hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-gray-300 max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 p-4 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                Action Registry: Formulate Response
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-500 hover:text-gray-800 transition p-1"
              >
                <FiX size={18} strokeWidth={3} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded p-3">
                <div className="grid grid-cols-2 gap-4 mb-2 border-b border-gray-200 pb-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Dept ID</p>
                    <p className="font-medium text-sm text-gray-800">{selectedFeedback.deptName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rating / Severity</p>
                    <p className="font-medium text-sm text-gray-800 flex items-center gap-1">
                      {selectedFeedback.rating} <FiStar className="text-yellow-500 fill-current" size={12} />
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Citizen Submission</p>
                  <p className="text-sm font-medium text-gray-800 mt-1 italic border-l-2 border-amber-400 pl-2">
                    "{selectedFeedback.comment || "N/A"}"
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                  Official Statement / Resolution
                </label>
                <textarea
                  rows="5"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 focus:outline-none"
                  placeholder="Formulate official public response here..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 mt-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-100 transition"
                >
                  Abort
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className="px-4 py-2 bg-emerald-700 text-white border border-emerald-800 text-xs font-bold uppercase tracking-wider rounded shadow-sm hover:bg-emerald-800 flex items-center gap-2 transition"
                >
                  <FiSend size={14} /> Commit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified Statistical Box
const StatBox = ({ title, value, icon, isAlert = false }) => (
  <div className={`bg-white border ${isAlert ? 'border-amber-400 border-b-4' : 'border-gray-200'} p-4 rounded shadow-sm hover:border-emerald-700 transition`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className={`text-[10px] uppercase font-bold tracking-widest ${isAlert ? 'text-amber-600' : 'text-gray-500'}`}>{title}</h3>
      <div className={isAlert ? 'text-amber-500' : 'text-gray-400'}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-black text-gray-900 mt-2">{value}</p>
  </div>
);

export default Inbox;
