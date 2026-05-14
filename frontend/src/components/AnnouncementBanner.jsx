import React, { useState, useEffect } from "react";
import { FiX, FiAlertCircle, FiSunrise, FiSun, FiMoon } from "react-icons/fi";

const AnnouncementBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  // Time-based announcements
  const getTimeBasedAnnouncement = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        type: "morning",
        icon: <FiSunrise className="text-yellow-300" size={20} />,
        title: "Good Morning",
        message:
          "Minister's office open 9AM-12PM. Coffee available at Building A, Floor 1.",
        bgColor: "bg-emerald-600",
        textColor: "text-white",
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        type: "afternoon",
        icon: <FiSun className="text-yellow-300" size={20} />,
        title: "Afternoon Update",
        message:
          "Conference hall available for bookings. Minister's office closed after 2PM.",
        bgColor: "bg-amber-500",
        textColor: "text-white",
      };
    } else {
      return {
        type: "evening",
        icon: <FiMoon className="text-blue-200" size={20} />,
        title: "Ministry Hours",
        message: "Operating hours: Monday-Thursday 9AM-5PM, Friday 9AM-1PM.",
        bgColor: "bg-slate-700",
        textColor: "text-white",
      };
    }
  };

  // Emergency announcements (can be fetched from API later)
  const emergencyAnnouncement = {
    active: true,
    title: "Minister's Meeting Today",
    message: "Offices closed 2PM-4PM. Please plan your visit accordingly.",
    type: "emergency",
    bgColor: "bg-red-600",
    textColor: "text-white",
  };

  useEffect(() => {
    // Check if banner was dismissed in this session
    const isDismissed = sessionStorage.getItem("announcementDismissed");
    if (isDismissed === "true") {
      setShowBanner(false);
    }

    // Check if there's an emergency announcement
    if (emergencyAnnouncement.active) {
      setCurrentAnnouncement(emergencyAnnouncement);
    } else {
      setCurrentAnnouncement(getTimeBasedAnnouncement());
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("announcementDismissed", "true");
  };

  if (!showBanner || !currentAnnouncement) {
    return null;
  }

  return (
    <div
      className={`${currentAnnouncement.bgColor} ${currentAnnouncement.textColor} relative overflow-hidden`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {currentAnnouncement.type === "emergency" ? (
                <FiAlertCircle size={24} className="animate-pulse" />
              ) : (
                currentAnnouncement.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm uppercase tracking-wide">
                  {currentAnnouncement.title}
                </span>
                <span className="text-sm opacity-90 truncate">
                  {currentAnnouncement.message}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Ethiopian flag accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 flex">
        <div className="w-1/3 bg-[#078930]"></div>
        <div className="w-1/3 bg-[#FCDD09]"></div>
        <div className="w-1/3 bg-[#DA121A]"></div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
