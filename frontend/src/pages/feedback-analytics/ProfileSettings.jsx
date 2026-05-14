import React, { useState, useEffect } from "react";
import { FiSave, FiImage, FiUser, FiInfo } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const ProfileSettings = () => {
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  useEffect(() => {
    // Load existing image from local storage if set
    const savedImage = localStorage.getItem("adminProfileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    } else {
      setProfileImage(defaultImage);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save the profile picture straight to Local Storage 
      localStorage.setItem("adminProfileImage", profileImage);
      
      setTimeout(() => {
         toast.success("Profile imagery updated securely. Refreshing layout layout...");
         setLoading(false);
         // Force reload so the layout sidebar updates its image
         setTimeout(() => window.location.reload(), 1000);
      }, 800);
    } catch (error) {
      toast.error("Failed to commit settings update.");
      setLoading(false);
    }
  };

  const resetToDefault = () => {
     setProfileImage(defaultImage);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="border-b border-gray-300 pb-4">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Terminal Settings
         </h1>
         <p className="text-gray-600 mt-1 text-sm font-medium">
            Configure your administrative profile vectors & parameters
         </p>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
           <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
             <FiUser className="text-emerald-700" /> Duty Officer Profile
           </h2>
        </div>

        <div className="p-6 md:p-8">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Image Preview Block */}
              <div className="flex flex-col items-center gap-4">
                 <div className="w-40 h-40 rounded-full border-4 border-emerald-600 shadow-xl overflow-hidden bg-gray-100">
                    <img 
                       src={profileImage || defaultImage} 
                       alt="Preview" 
                       className="w-full h-full object-cover shadow-inner"
                       onError={(e) => { e.target.src = defaultImage; toast.error("Invalid Image URL"); }}
                    />
                 </div>
                 <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Live Preview</p>
                    <button 
                       onClick={resetToDefault} 
                       className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-gray-900 mt-1 transition"
                    >
                       Restore Default
                    </button>
                 </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSave} className="flex-1 space-y-6 w-full">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                       Portrait Network URL
                    </label>
                    <div className="flex items-center border-[2px] border-gray-200 bg-gray-50 rounded-sm focus-within:border-emerald-700 focus-within:bg-emerald-50/30 transition-colors">
                       <div className="pl-4 text-gray-400">
                          <FiImage size={18} />
                       </div>
                       <input 
                          type="url"
                          required
                          value={profileImage}
                          onChange={(e) => setProfileImage(e.target.value)}
                          className="w-full bg-transparent p-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                          placeholder="https://example.com/your-image.jpg"
                       />
                    </div>
                    <p className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-2">
                       <FiInfo /> Provide a direct public link to a PNG, JPG, or WEBP portrait.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Display Name</label>
                       <input 
                         type="text" 
                         disabled 
                         value="Duty Officer" 
                         className="w-full border border-gray-200 bg-gray-100 p-3 text-sm font-bold text-gray-500 rounded-sm cursor-not-allowed"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">System ID</label>
                       <input 
                         type="text" 
                         disabled 
                         value="FA-9042" 
                         className="w-full border border-gray-200 bg-gray-100 p-3 text-sm font-bold text-gray-500 rounded-sm cursor-not-allowed"
                       />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-gray-200">
                    <button
                       type="submit"
                       disabled={loading}
                       className="w-full md:w-auto px-8 bg-gray-900 hover:bg-black text-white font-bold uppercase tracking-widest text-xs py-4 rounded-sm transition flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {loading ? (
                         <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       ) : (
                         <>
                            <FiSave size={16} /> Save Security Profile
                         </>
                       )}
                    </button>
                 </div>
              </form>

           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
