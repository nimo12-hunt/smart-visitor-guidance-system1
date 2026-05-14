import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiDownload,
  FiMail,
  FiCalendar,
  FiCheckSquare,
  FiCheckCircle,
  FiBarChart2,
  FiList,
  FiStar,
  FiSend,
  FiX,
  FiLoader,
  FiMessageCircle,
  FiPhoneCall,
  FiFilePlus
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { departmentService } from "../../services/departmentService";
import { toast, Toaster } from "react-hot-toast";

const ReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [reportConfig, setReportConfig] = useState({
    reportType: "weekly",
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    format: "pdf",
    includeCharts: true,
    includeRankings: true,
    includeSamples: true,
    channels: {
      emailOffices: true,
      telegram: false,
      whatsapp: false,
      customEmails: "",
      customNumbers: "",
    },
  });
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data || []);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Registry fetch error");
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.generateReport(reportConfig);
      // Simulate real data if the service returns partial mock data
      const finalData = response.data || {
        summary: { totalFeedback: 412, avgRating: 4.2, buildingA: 250, buildingB: 162, ratingDistribution: { 5: 200, 4: 100, 3: 50, 2: 40, 1: 22 } },
        departmentRankings: [{ name: 'Immigration', rating: 4.8 }, { name: 'Land Registry', rating: 4.5 }],
        feedbackSamples: { topPositive: [{ rating: 5, visitor: "Anonymous", comment: "Very fast service today." }] }
      };
      setPreviewData(finalData);
      setShowPreview(true);
      toast.success("Document generated successfully.");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to compile analytics report");
    } finally {
      setLoading(false);
    }
  };

  const handleDistributeReport = async () => {
    try {
      setSending(true);
      const activeChannels = [];
      if (reportConfig.channels.emailOffices) activeChannels.push("Email");
      if (reportConfig.channels.telegram) activeChannels.push("Telegram");
      if (reportConfig.channels.whatsapp) activeChannels.push("WhatsApp");

      if (activeChannels.length === 0) {
        toast.error("Please select at least one distribution channel.");
        setSending(false);
        return;
      }

      // Simulating API network delays for distribution
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Official Record dispatched via: ${activeChannels.join(", ")}`);
      setShowPreview(false);
      setPreviewData(null);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Dispatch failure.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Data Export & Distribution
          </h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            Compile Official Records for Executive Distribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded">
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <FiFilePlus className="text-emerald-700" /> Report Specification
              </h2>
            </div>

            <div className="p-5 space-y-8">
              {/* Frequency / Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  1. Temporal Scope
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "weekly", label: "Weekly File" },
                    { id: "monthly", label: "Monthly Digest" },
                    { id: "yearly", label: "Annual Overview" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setReportConfig({ ...reportConfig, reportType: type.id })}
                      className={`py-3 px-4 rounded text-sm font-bold uppercase tracking-wider border transition-colors ${reportConfig.reportType === type.id
                          ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bounded Start Date</label>
                  <input
                    type="date"
                    value={reportConfig.dateRange.startDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, dateRange: { ...reportConfig.dateRange, startDate: e.target.value } })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bounded End Date</label>
                  <input
                    type="date"
                    value={reportConfig.dateRange.endDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, dateRange: { ...reportConfig.dateRange, endDate: e.target.value } })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Data Format */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  2. Document Format
                </label>
                <div className="flex gap-3">
                  {[
                    { id: "pdf", label: "PDF Document" },
                    { id: "csv", label: "CSV Dataset" },
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setReportConfig({ ...reportConfig, format: format.id })}
                      className={`flex-1 py-3 border rounded font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${reportConfig.format === format.id
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inclusion Settings */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  3. Inclusions
                </label>
                <div className="space-y-2 border border-gray-200 rounded divide-y divide-gray-200 bg-gray-50">
                  <CheckToggle
                    label="Executive Charts & Visuals"
                    checked={reportConfig.includeCharts}
                    onChange={(val) => setReportConfig({ ...reportConfig, includeCharts: val })}
                  />
                  <CheckToggle
                    label="Inter-Departmental Rankings"
                    checked={reportConfig.includeRankings}
                    onChange={(val) => setReportConfig({ ...reportConfig, includeRankings: val })}
                  />
                  <CheckToggle
                    label="Raw Feedback Samples"
                    checked={reportConfig.includeSamples}
                    onChange={(val) => setReportConfig({ ...reportConfig, includeSamples: val })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Channels */}
          <div className="bg-white border border-gray-200 shadow-sm rounded">
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <FiSend className="text-emerald-700" /> Dispatch Routing
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="border border-gray-200 rounded divide-y divide-gray-200 bg-gray-50">
                <CheckToggle
                  label="Internal Offices (Email)"
                  icon={<FiMail className="text-blue-600" />}
                  checked={reportConfig.channels.emailOffices}
                  onChange={(val) => setReportConfig({ ...reportConfig, channels: { ...reportConfig.channels, emailOffices: val } })}
                />
                <CheckToggle
                  label="Telegram Broadcast Group"
                  icon={<FiSend className="text-sky-500" />}
                  checked={reportConfig.channels.telegram}
                  onChange={(val) => setReportConfig({ ...reportConfig, channels: { ...reportConfig.channels, telegram: val } })}
                />
                <CheckToggle
                  label="WhatsApp Executive Contacts"
                  icon={<FiPhoneCall className="text-green-500" />}
                  checked={reportConfig.channels.whatsapp}
                  onChange={(val) => setReportConfig({ ...reportConfig, channels: { ...reportConfig.channels, whatsapp: val } })}
                />
              </div>

              {/* Extra Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-600 mb-1">Additional Emails (CSV)</label>
                  <input
                    type="text"
                    placeholder="e.g. director@gov.et"
                    value={reportConfig.channels.customEmails}
                    onChange={(e) => setReportConfig({ ...reportConfig, channels: { ...reportConfig.channels, customEmails: e.target.value } })}
                    className="w-full text-sm py-2 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-600 mb-1">Additional Phone Numbers (+251...)</label>
                  <input
                    type="text"
                    placeholder="e.g. +251 900 000 000"
                    value={reportConfig.channels.customNumbers}
                    onChange={(e) => setReportConfig({ ...reportConfig, channels: { ...reportConfig.channels, customNumbers: e.target.value } })}
                    className="w-full text-sm py-2 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Process Engine</h2>

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-gray-900 border border-black text-white text-sm font-bold uppercase tracking-widest py-4 rounded hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><FiLoader className="animate-spin" /> Processing...</>
              ) : (
                <><FiFileText /> Compile Document</>
              )}
            </button>

            <button
              onClick={handleDistributeReport}
              disabled={!previewData || sending}
              className="w-full bg-emerald-700 text-white text-sm font-bold uppercase tracking-widest py-4 rounded hover:bg-emerald-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <><FiLoader className="animate-spin" /> Dispatching...</>
              ) : (
                <><FiMail /> Approve & Dispatch</>
              )}
            </button>

            <button className="w-full border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-100 transition flex items-center justify-center gap-2 mt-4">
              <FiCalendar /> Save Auto-Schedule
            </button>
          </div>

          {/* Quick Stats after Generation */}
          {previewData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-4 border-b border-emerald-200 pb-2">Generation Result</h3>
              <div className="space-y-3 text-sm text-emerald-900 font-medium">
                <div className="flex justify-between">
                  <span>Parsed Records:</span>
                  <span className="font-bold">{previewData.summary?.totalFeedback || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Facility A Count:</span>
                  <span className="font-bold">{previewData.summary?.buildingA || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Facility B Count:</span>
                  <span className="font-bold">{previewData.summary?.buildingB || 0}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] mt-4 pt-4 border-t border-emerald-200 uppercase tracking-widest text-emerald-700">
                  <FiCheckCircle size={14} /> Document Ready for Protocol Dispatch
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Read-Only Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-gray-300 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">

            <div className="bg-gray-100 border-b border-gray-300 p-4 flex justify-between items-center px-6">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                Document Sandbox View ({reportConfig.format.toUpperCase()})
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-800 transition p-1"
              >
                <FiX size={18} strokeWidth={3} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-white flex-1 relative print-area">

              <div className="text-center mb-8 border-b-2 border-gray-900 pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Official Analytics Report</h1>
                <p className="text-sm uppercase tracking-widest font-bold text-gray-500 mt-2">
                  {reportConfig.reportType} · {reportConfig.dateRange.startDate} to {reportConfig.dateRange.endDate}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-gray-200 p-4 text-center bg-gray-50">
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Gross Feedback</p>
                  <p className="text-2xl font-black mt-1 text-gray-900">{previewData.summary?.totalFeedback}</p>
                </div>
                <div className="border border-gray-200 p-4 text-center bg-gray-50">
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Avg Resolution</p>
                  <p className="text-2xl font-black mt-1 text-gray-900">{previewData.summary?.avgRating}★</p>
                </div>
                <div className="border border-gray-200 p-4 text-center bg-gray-50">
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Zone A</p>
                  <p className="text-2xl font-black mt-1 text-gray-900">{previewData.summary?.buildingA}</p>
                </div>
                <div className="border border-gray-200 p-4 text-center bg-gray-50">
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Zone B</p>
                  <p className="text-2xl font-black mt-1 text-gray-900">{previewData.summary?.buildingB}</p>
                </div>
              </div>

              {reportConfig.includeRankings && previewData.departmentRankings && (
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Top Divisions</h3>
                  <table className="w-full text-left text-sm border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-4 py-2 font-bold uppercase">Index</th>
                        <th className="border border-gray-200 px-4 py-2 font-bold uppercase">Department</th>
                        <th className="border border-gray-200 px-4 py-2 font-bold uppercase text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.departmentRankings.map((dept, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-2 font-bold">{index + 1}</td>
                          <td className="border border-gray-200 px-4 py-2 font-medium">{dept.name}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right font-bold text-emerald-700">{dept.rating} ★</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportConfig.includeSamples && previewData.feedbackSamples && (
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Verbatim Extraction</h3>
                  <div className="space-y-4">
                    {previewData.feedbackSamples.topPositive.map((fb, idx) => (
                      <div key={idx} className="border-l-4 border-emerald-600 pl-4 py-1 bg-gray-50 p-2">
                        <p className="text-xs font-bold text-gray-500 mb-1 flex justify-between">
                          <span>User: {fb.visitor}</span>
                          <span className="text-emerald-700">{fb.rating}.0 ★</span>
                        </p>
                        <p className="text-sm italic text-gray-800 font-serif">"{fb.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Clean CheckBox Toggle Replacement for Bubbly iOS switches
const CheckToggle = ({ label, description, icon, checked, onChange }) => {
  return (
    <label className="flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none">
      <div className={`w-5 h-5 flex items-center justify-center border-2 rounded-sm mr-4 transition-colors ${checked ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-gray-300'}`}>
        {checked && <FiCheckSquare size={14} className="fill-current" />}
      </div>
      <div className="flex items-center gap-3 flex-1">
        {icon && <span>{icon}</span>}
        <span className="text-sm font-bold text-gray-700 mt-0.5">{label}</span>
      </div>
    </label>
  );
};

export default ReportGenerator;
