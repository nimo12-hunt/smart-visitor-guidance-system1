import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getDepartmentById } from "../data/departmentsData";
import { feedbackService } from "../services/feedbackService";
import {
  FiStar,
  FiSend,
  FiCheckCircle,
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiUser,
  FiMail,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const Feedback = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");

  useEffect(() => {
    const dept = getDepartmentById(parseInt(deptId));
    setDepartment(dept);
    setLoading(false);
  }, [deptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    // Feedback data with sectorId
    const feedbackData = {
      department: department.id,
      sectorId: department.sectorId,
      building: department.building,
      rating,
      comment,
      visitor: visitorName || "Anonymous",
      visitorEmail: visitorEmail || null,
    };

    try {
      await feedbackService.create(feedbackData);
      setSubmitted(true);
      toast.success("Thank you for your feedback!");

      setTimeout(() => {
        navigate(`/department/${department.id}`);
      }, 2000);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-500 text-sm">Loading...</p>
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

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-4xl text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-500 mb-4">
              Your feedback has been submitted successfully.
            </p>
            <div className="flex justify-center gap-1 text-yellow-500 text-2xl mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={star <= rating ? "fill-current" : ""}
                />
              ))}
            </div>
            <Link
              to={`/department/${department.id}`}
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
            >
              Return to Department
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Button */}
          <Link
            to={`/department/${department.id}`}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 mb-6 transition-colors text-sm"
          >
            <FiArrowLeft size={14} /> Back to Department
          </Link>

          {/* Department Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                  {department.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">
                    {department.name}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <FiMapPin size={12} className="text-emerald-500" />
                      Bldg {department.building}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <FiClock size={12} className="text-emerald-500" />
                      {department.walkingTime || "2 min"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                <FiStar className="fill-yellow-500 text-yellow-500" size={14} />
                <span className="font-bold text-gray-700">
                  {department.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Share Your Experience
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              Your feedback helps us improve our services
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Stars */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    >
                      <FiStar
                        size={32}
                        className={`${
                          star <= (hover || rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-emerald-600 mt-2">
                    You selected {rating} star{rating !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <FiUser
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email{" "}
                  <span className="text-gray-400 text-xs">
                    (optional - to receive response)
                  </span>
                </label>
                <div className="relative">
                  <FiMail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <FiAlertCircle size={10} />
                  We'll send a response to this email if the department replies
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

          {/* Info Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Your feedback is anonymous unless you provide your name and email.
              All feedback helps us serve you better.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;
