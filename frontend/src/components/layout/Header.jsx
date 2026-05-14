import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiGlobe,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "om", label: "Oromoo", flag: "🇪🇹" },
  { code: "so", label: "Soomaali", flag: "🇸🇴" },
  { code: "ti", label: "ትግርኛ", flag: "🇪🇹" },
];

const NAV_ITEMS = [
  {
    key: "home",
    to: "/",
    label: "Home",
    icon: "🏠",
    activeColor: "from-emerald-600 to-teal-600",
    isActive: ({ pathname, hash }) =>
      pathname === "/" && hash !== "#sectors",
  },
  {
    key: "sectors",
    to: { pathname: "/", hash: "sectors" },
    label: "Sectors",
    icon: "🧭",
    activeColor: "from-cyan-600 to-blue-600",
    isActive: ({ pathname, hash }) =>
      pathname === "/" && hash === "#sectors",
  },
  {
    key: "feedback",
    to: "/feedback",
    label: "Feedback",
    icon: "💬",
    activeColor: "from-violet-600 to-purple-600",
    isActive: ({ pathname }) =>
      pathname === "/feedback" || pathname.startsWith("/feedback/"),
  },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();

  const navActive = (item) => item.isActive(location);

  return (
    <header className="sticky top-0 z-[100] bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      {/* Ethiopian Flag Stripes */}
      <div className="h-1.5 flex w-full">
        <div className="flex-1 bg-[#009739]"></div>
        <div className="flex-1 bg-[#FFD700]"></div>
        <div className="flex-1 bg-[#EF3340]"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group min-w-0 justify-self-start"
          >
            <img
              src="/ministry-logo.png"
              alt="Ministry of Innovation and Technology logo"
              className="h-10 sm:h-12 w-auto object-contain shrink-0"
            />
            <span className="font-bold text-sm sm:text-xl text-white tracking-tight truncate">
              MINT Navigator
            </span>
          </Link>

          {/* Desktop nav — centered in the middle column */}
          <nav className="hidden lg:flex items-center justify-center gap-1 min-w-0">
            {NAV_ITEMS.map((item) => {
              const active = navActive(item);
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`relative px-4 xl:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? `bg-gradient-to-r ${item.activeColor} text-white shadow-md shadow-emerald-500/20`
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Language + mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3 justify-self-end shrink-0">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/50 border border-white/10 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all hover:border-emerald-500/40"
              >
                <FiGlobe className="text-emerald-400" />
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase">
                  {language}
                </span>
                <FiChevronDown
                  className={`text-slate-400 transition-transform duration-300 ${
                    isLangOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isLangOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLangOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden py-2">
                    <div className="px-5 py-2 border-b border-white/5 mb-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Language
                      </p>
                    </div>
                    <div className="space-y-1 px-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                            language === lang.code
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-sm font-medium">
                              {lang.label}
                            </span>
                          </div>
                          {language === lang.code && (
                            <FiCheck className="text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-5 border-t border-white/10">
            <nav className="flex flex-col space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    navActive(item)
                      ? `bg-gradient-to-r ${item.activeColor} text-white`
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-bold text-sm uppercase tracking-wide">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Hidden Google Translate Elements */}
      <div
        id="google_translate_element"
        style={{ visibility: "hidden", position: "absolute", top: "-9999px" }}
      ></div>
      <style>{`
        .goog-te-banner-frame, .goog-te-balloon-frame, .goog-te-gadget-icon,
        .goog-te-gadget-simple img, .skiptranslate, #goog-gt-tt { 
          display: none !important; 
        }
        body { top: 0px !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
      `}</style>
    </header>
  );
};

export default Header;
