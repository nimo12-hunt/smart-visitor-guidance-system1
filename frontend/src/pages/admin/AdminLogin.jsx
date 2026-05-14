import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { adminService } from "../../services/adminService";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lockCountdown, setLockCountdown] = useState("");

  const navigate = useNavigate();

  // ⏱️ Countdown timer when rate-limited
  React.useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setLockCountdown("");
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setLockCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminService.login(credentials);

      // ✅ Persist token AND full user profile for route guards
      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          _id: response._id,
          username: response.username,
          email: response.email,
          role: response.role,
          sectorId: response.sectorId, // Important for sector managers
          name: response.name,
        }),
      );

      toast.success("Login successful");

      // ✅ ROLE-BASED REDIRECT (Includes Sector Manager)
      const userRole = response.role;

      if (userRole === "feedback_analyst") {
        setTimeout(() => navigate("/feedback-analytics"), 800);
      } else if (userRole === "sector_manager") {
        setTimeout(() => navigate("/sector-dashboard"), 800);
      } else {
        setTimeout(() => navigate("/admin/dashboard"), 800);
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        // Rate limited — lock the form for 15 minutes
        const unlockAt = Date.now() + 15 * 60 * 1000;
        setLockedUntil(unlockAt);
        toast.error("Too many login attempts. Try again in 15 minutes.", {
          duration: 6000,
          icon: "🚫",
        });
      } else if (status === 401) {
        toast.error("Invalid username or password.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B11] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white font-sans relative overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1F2937",
            color: "#fff",
            border: "1px solid #059669",
          },
        }}
      />

      {/* Background Mint/Emerald ambient glows matching the "Mint Navigator" theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Ministry logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/ministry-logo.png"
            alt="Ministry of Innovation and Technology logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white mb-2">
          Mint<span className="text-emerald-500">Navigator</span>
        </h2>
        <p className="text-center text-sm text-slate-400 font-medium tracking-wide">
          Sign in to your administrative account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mt-8">
        <div className="bg-[#111827] py-10 px-4 shadow-2xl shadow-emerald-900/10 sm:rounded-2xl sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focused === "user" ? "text-emerald-500" : "text-slate-500"}`}
                >
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onFocus={() => setFocused("user")}
                  onBlur={() => setFocused("")}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#1F2937] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focused === "pass" ? "text-emerald-500" : "text-slate-500"}`}
                >
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused("")}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="block w-full pl-12 pr-12 py-3.5 bg-[#1F2937] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all tracking-wider"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-[#1F2937] border-slate-600 rounded text-emerald-500 focus:ring-offset-[#111827] focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* 🔒 Rate limit warning banner */}
            {lockedUntil && (
              <div className="flex items-center gap-3 bg-red-950/50 border border-red-700/50 rounded-xl px-4 py-3 text-sm text-red-400">
                <span className="text-lg">🚫</span>
                <div>
                  <p className="font-semibold text-red-300">
                    Account temporarily locked
                  </p>
                  <p>
                    Too many failed attempts. Try again in{" "}
                    <span className="font-bold text-white">
                      {lockCountdown}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !!lockedUntil}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : lockedUntil ? (
                  `Locked — ${lockCountdown}`
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
