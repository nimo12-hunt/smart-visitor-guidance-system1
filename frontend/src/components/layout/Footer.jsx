import React from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiShield,
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0F172A] border-t border-white/10 pt-16 pb-8 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/ministry-logo.png"
                alt="Ministry of Innovation and Technology logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Official digital navigation and feedback system for the Ministry
              of Innovation and Technology. Empowering citizens through smart
              infrastructure.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <FiTwitter size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <FiFacebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <FiLinkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-5">
              Quick Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Sectors", path: "/" },
                { name: "Feedback", path: "/feedback" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-slate-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {["Help Desk", "Privacy Policy", "Terms of Use", "Accessibility"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full"></span>
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Contact Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-emerald-500" size={16} />
                <p className="text-sm text-slate-300">
                  Piassa, Addis Ababa, Ethiopia
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-emerald-500" size={16} />
                <p className="text-sm text-slate-300">+251 11 126 5737</p>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-emerald-500" size={16} />
                <p className="text-sm text-slate-300">contact@mint.gov.et</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">
            &copy; {currentYear} Ministry of Innovation & Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <FiShield className="text-emerald-500" size={12} />
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">
              Secure Portal
            </span>
          </div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider">
            Powered by MINT Tech-Core
          </div>
        </div>

        {/* Ethiopian Flag Mini */}
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-lg border border-white/5">
          <div className="w-5 h-3 bg-[#009739] rounded-sm"></div>
          <div className="w-5 h-3 bg-[#FFD700] rounded-sm"></div>
          <div className="w-5 h-3 bg-[#EF3340] rounded-sm"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;