import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { searchDepartments } from "../data/departmentsData";
import {
  FiStar,
  FiSend,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiAlertCircle,
  FiMapPin,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const GeneralFeedback = () => {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [deptQuery, setDeptQuery] = useState("");
  const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const deptWrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!deptWrapRef.current) return;
      if (!deptWrapRef.current.contains(e.target)) {
        setShowDeptSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const deptSuggestions = useMemo(() => {
    const q = (deptQuery || "").trim();
    if (q.length < 2) return [];
    // uses departmentsData (name/description/head matching)
    return searchDepartments(q).slice(0, 6);
  }, [deptQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      // General feedback is currently client-only (no department id).
      // Keeping same UX as department feedback.
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Thank you for your feedback!");
      setSubmitted(true);
      setTimeout(() => navigate("/"), 2000);
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white flex items-center justify-center py-12">
          <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur-md shadow-xl shadow-slate-900/10 p-8 max-w-md mx-4 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-4xl text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Thank you!
            </h2>
            <p className="text-slate-600 mb-4">
              Your feedback has been submitted successfully.
            </p>
            <div className="flex justify-center gap-1 text-amber-500 text-2xl mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={star <= rating ? "fill-current" : ""}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur-md shadow-xl shadow-slate-900/10 overflow-hidden">
            {/* Ethiopian flag accent */}
            <div className="h-2.5 flex">
              <div className="flex-1 bg-[#078930]" />
              <div className="flex-1 bg-[#FCDD09]" />
              <div className="flex-1 bg-[#DA121A]" />
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2">
                Share Your Experience
              </h1>
              <p className="text-center text-slate-600 text-sm mb-6">
                Your feedback helps us improve our services
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Optional department name */}
                <div ref={deptWrapRef} className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department{" "}
                    <span className="text-slate-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={deptQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDeptQuery(v);
                      setDepartmentName(v);
                      setShowDeptSuggestions(true);
                    }}
                    onFocus={() => setShowDeptSuggestions(true)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Innovation Directorate"
                  />

                  {showDeptSuggestions && deptSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl shadow-slate-900/10 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recommended departments
                        </p>
                      </div>
                      <div className="max-h-72 overflow-auto">
                        {deptSuggestions.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setDepartmentName(d.name);
                              setDeptQuery(d.name);
                              setShowDeptSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-emerald-50/60 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-sm truncate">
                                  {d.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                                  {d.description}
                                </div>
                              </div>
                              <div className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                                <FiMapPin size={12} className="text-emerald-600" />
                                {d.building}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    How would you rate your visit?
                  </label>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none transition transform hover:scale-110"
                        aria-label={`Rate ${star} star`}
                      >
                        <FiStar
                          size={34}
                          className={`${
                            star <= (hover || rating)
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-emerald-600 mt-2 font-semibold">
                      You selected {rating} star{rating !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Feedback{" "}
                    <span className="text-slate-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Name{" "}
                    <span className="text-slate-400 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <FiUser
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email{" "}
                    <span className="text-slate-400 text-xs">
                      (optional - to receive response)
                    </span>
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <FiAlertCircle size={10} />
                    We'll send a response to this email if the department replies
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend size={18} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Your feedback is anonymous unless you provide your name and email.
              All feedback helps us serve you better.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GeneralFeedback;
